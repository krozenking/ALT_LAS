const express = require("express");
const router = express.Router();
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const logger = require("../src/utils/logger");

// Define a directory for temporary uploads - might be phased out with Archive Service integration
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// TODO: Move service URLs to config
const ARCHIVE_SERVICE_URL = process.env.ARCHIVE_SERVICE_URL || "http://localhost:3003"; // Example URL

// Helper function to interact with Archive Service
const callArchiveService = async (method, endpoint, data = {}, headers = {}) => {
    const url = `${ARCHIVE_SERVICE_URL}${endpoint}`;
    logger.info(`Calling Archive Service: ${method.toUpperCase()} ${url}`, { data: (method.toLowerCase() === "get" || method.toLowerCase() === "delete") ? undefined : data }); // Avoid logging large payloads for GET/DELETE
    try {
        const config = { method, url, headers };
        if (method.toLowerCase() === "get" || method.toLowerCase() === "delete") {
            config.params = data.params; // Use params for GET/DELETE
        } else {
            config.data = data; // Use data for POST/PUT
        }
        const response = await axios(config);
        logger.info(`Archive Service responded for ${method.toUpperCase()} ${endpoint}`, { status: response.status });
        return response.data;
    } catch (error) {
        logger.error(`Error calling Archive Service (${method.toUpperCase()} ${endpoint}):`, {
            error: error.message,
            url: url,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error; // Re-throw to be handled by the caller
    }
};

// Helper function to handle Archive Service errors in responses
const handleServiceError = (res, error, contextMessage, fileId = null) => {
    logger.error(`${contextMessage} failed:`, { fileId, error: error.message, status: error.response?.status });
    if (error.response) {
        // Error from the service itself
        if (error.response.status === 404) {
            res.status(404).send({ message: "File not found in archive." });
        } else if (error.response.status >= 500) {
            // Service unavailable or internal error
            res.status(502).send({ message: `Archive Service error during ${contextMessage}.`, serviceStatus: error.response.status, serviceError: error.response.data });
        } else {
            // Other client errors from service (e.g., 400, 401, 403)
            // Pass through the status and message from the service error if possible
            res.status(error.response.status).send({ message: `Archive Service error: ${error.response.data?.message || error.message}`, serviceError: error.response.data });
        }
    } else {
        // Network error or other issue calling the service (error doesn't have a response property)
        res.status(500).send({ message: `Could not communicate with Archive Service for ${contextMessage}.`, error: error.message });
    }
};

// File upload endpoint
router.post("/upload", (req, res, next) => {
  const form = formidable({ uploadDir: uploadDir, keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      logger.error("Error parsing form data:", { error: err.message });
      return res.status(500).send({ message: "Error processing file upload.", error: err.message });
    }

    const file = files.file;
    if (!file || file.length === 0) {
        logger.warn("File upload attempt with no file.");
        return res.status(400).send({ message: "No file uploaded." });
    }

    const uploadedFile = file[0];
    const fileId = uuidv4();
    const originalFilename = uploadedFile.originalFilename;
    const fileExt = path.extname(originalFilename);
    const newFilePath = path.join(uploadDir, `${fileId}${fileExt}`);

    fs.rename(uploadedFile.filepath, newFilePath, async (renameErr) => {
        if (renameErr) {
            logger.error("Error renaming uploaded file:", { error: renameErr.message, originalPath: uploadedFile.filepath, newPath: newFilePath });
            fs.unlink(uploadedFile.filepath, (unlinkErr) => {
                if (unlinkErr) logger.error("Error cleaning up failed upload:", { error: unlinkErr.message, path: uploadedFile.filepath });
            });
            return res.status(500).send({ message: "Error finalizing file upload.", error: renameErr.message });
        }

        logger.info(`File uploaded locally: ${newFilePath}`, { fileId: fileId, filename: originalFilename });

        // Register file with Archive Service
        try {
            const archiveResponse = await callArchiveService(
                "post", 
                "/api/archive/register", 
                { 
                    fileId: fileId,
                    filename: originalFilename,
                    size: uploadedFile.size,
                    mimeType: uploadedFile.mimetype,
                    tempPath: newFilePath 
                },
                { Authorization: req.headers.authorization } 
            );

            logger.info("Successfully registered file with Archive Service.", { fileId: fileId, archiveResponse });
            
            res.status(201).send({ 
                message: "File uploaded and registered successfully.", 
                fileId: fileId, 
                filename: originalFilename
            });

        } catch (serviceError) {
            // Use the helper for consistent error handling
            // We need to clean up the locally saved file if registration fails
            fs.unlink(newFilePath, (unlinkErr) => {
                if (unlinkErr) logger.error("Error cleaning up failed registration:", { error: unlinkErr.message, path: newFilePath });
            });
            handleServiceError(res, serviceError, "registration", fileId);
        }
    });
  });
});

// File download endpoint
router.get("/download/:fileId", async (req, res) => {
  const { fileId } = req.params;
  try {
    // Get file metadata/location from Archive Service
    const fileInfo = await callArchiveService(
        "get", 
        `/api/archive/info/${fileId}`, 
        {},
        { Authorization: req.headers.authorization }
    );

    const filePath = fileInfo.path; // Assuming Archive Service provides the correct path
    const originalFilename = fileInfo.filename || `${fileId}.unknown`;

    if (!filePath) {
        logger.error("Archive Service returned info without a path:", { fileId, fileInfo });
        return res.status(500).send({ message: "Archive Service did not provide a file location." });
    }

    if (fs.existsSync(filePath)) {
        res.download(filePath, originalFilename, (downloadErr) => {
            if (downloadErr) {
                logger.error("Error sending file for download:", { error: downloadErr.message, fileId, path: filePath });
                // Don't try to send another response if headers already sent
                if (!res.headersSent) {
                    res.status(500).send({ message: "Could not download the file." });
                }
            }
        });
    } else {
        logger.warn("File info found in archive, but file not found at path:", { fileId, path: filePath });
        res.status(404).send({ message: "File not found at storage location." });
    }

  } catch (serviceError) {
      handleServiceError(res, serviceError, "retrieving file information", fileId);
  }
});

// File listing/search endpoint
router.get("/", async (req, res) => {
  try {
    // Get file list from Archive Service
    const fileList = await callArchiveService(
        "get", 
        "/api/archive/search", 
        { params: req.query }, // Pass query params for searching/filtering
        { Authorization: req.headers.authorization }
    );
    res.status(200).send(fileList); 

  } catch (serviceError) {
      handleServiceError(res, serviceError, "listing files");
  }
});

// File metadata management endpoint
router.put("/metadata/:fileId", async (req, res) => {
  const { fileId } = req.params;
  const metadataUpdates = req.body;

  if (!metadataUpdates || Object.keys(metadataUpdates).length === 0) {
      return res.status(400).send({ message: "No metadata updates provided." });
  }

  try {
    // Update metadata via Archive Service
    const updatedInfo = await callArchiveService(
        "put", 
        `/api/archive/metadata/${fileId}`, 
        metadataUpdates,
        { Authorization: req.headers.authorization }
    );
    logger.info("Successfully updated metadata in Archive Service.", { fileId, updates: metadataUpdates });
    res.status(200).send({ message: "Metadata updated successfully.", fileInfo: updatedInfo });

  } catch (serviceError) {
      handleServiceError(res, serviceError, "updating metadata", fileId);
  }
});

// File deletion endpoint
router.delete("/:fileId", async (req, res) => {
    const { fileId } = req.params;
    try {
        // Request deletion from Archive Service
        await callArchiveService(
            "delete", 
            `/api/archive/${fileId}`, 
            {},
            { Authorization: req.headers.authorization }
        );
        logger.info(`File deletion requested successfully from Archive Service: ${fileId}`);
        
        res.status(200).send({ message: `File ${fileId} deletion initiated successfully.` });

    } catch (serviceError) {
        handleServiceError(res, serviceError, "initiating file deletion", fileId);
    }
});


module.exports = router;

