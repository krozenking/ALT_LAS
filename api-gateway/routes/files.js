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
    logger.info(`Calling Archive Service: ${method.toUpperCase()} ${url}`, { data });
    try {
        const response = await axios({ method, url, data, headers });
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
                "/api/archive/register", // Assuming an endpoint to register new files
                { 
                    fileId: fileId,
                    filename: originalFilename,
                    size: uploadedFile.size,
                    mimeType: uploadedFile.mimetype,
                    // Potential: Add user ID, project ID etc. from req context
                    // Potential: Add local path if Archive Service needs to move/copy it
                    tempPath: newFilePath 
                },
                { Authorization: req.headers.authorization } // Pass auth header
            );

            logger.info("Successfully registered file with Archive Service.", { fileId: fileId, archiveResponse });
            
            // TODO: Optionally notify Segmentation Service (consider if Archive should do this)

            res.status(201).send({ 
                message: "File uploaded and registered successfully.", 
                fileId: fileId, 
                filename: originalFilename
            });

        } catch (serviceError) {
            logger.error("Error registering file with Archive Service:", { fileId: fileId });
            // Critical error: If archive registration fails, we might need to roll back the upload
            fs.unlink(newFilePath, (unlinkErr) => {
                if (unlinkErr) logger.error("Error cleaning up failed registration:", { error: unlinkErr.message, path: newFilePath });
            });
            res.status(500).send({ 
                message: "File uploaded but failed to register with Archive Service.", 
                fileId: fileId, 
                filename: originalFilename,
                serviceError: serviceError.message
            });
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
        `/api/archive/info/${fileId}`, // Assuming endpoint to get file info
        {},
        { Authorization: req.headers.authorization }
    );

    // TODO: Implement actual download logic based on fileInfo (e.g., path, S3 URL)
    // For now, assume it returns a path similar to local storage
    const filePath = fileInfo.path || path.join(uploadDir, `${fileId}${path.extname(fileInfo.filename)}`); // Placeholder path logic
    const originalFilename = fileInfo.filename || `${fileId}.unknown`;

    if (fs.existsSync(filePath)) {
        res.download(filePath, originalFilename, (downloadErr) => {
            if (downloadErr) {
                logger.error("Error downloading file:", { error: downloadErr.message, fileId, path: filePath });
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
      logger.error("Error retrieving file info from Archive Service:", { fileId });
      if (serviceError.response?.status === 404) {
          res.status(404).send({ message: "File not found in archive." });
      } else {
          res.status(500).send({ message: "Error retrieving file information.", serviceError: serviceError.message });
      }
  }
});

// File listing/search endpoint
router.get("/", async (req, res) => {
  try {
    // Get file list from Archive Service
    const fileList = await callArchiveService(
        "get", 
        "/api/archive/search", // Assuming endpoint for listing/searching
        { params: req.query }, // Pass query params for searching/filtering
        { Authorization: req.headers.authorization }
    );
    res.status(200).send(fileList); 

  } catch (serviceError) {
      logger.error("Error listing files from Archive Service:", { query: req.query });
      res.status(500).send({ message: "Could not list files.", serviceError: serviceError.message });
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
        `/api/archive/metadata/${fileId}`, // Assuming endpoint for metadata update
        metadataUpdates,
        { Authorization: req.headers.authorization }
    );
    logger.info("Successfully updated metadata in Archive Service.", { fileId, updates: metadataUpdates });
    res.status(200).send({ message: "Metadata updated successfully.", fileInfo: updatedInfo });

  } catch (serviceError) {
      logger.error("Error updating metadata in Archive Service:", { fileId, updates: metadataUpdates });
      if (serviceError.response?.status === 404) {
          res.status(404).send({ message: "File not found in archive." });
      } else {
          res.status(500).send({ message: "Could not update metadata.", serviceError: serviceError.message });
      }
  }
});

// File deletion endpoint
router.delete("/:fileId", async (req, res) => {
    const { fileId } = req.params;
    try {
        // Request deletion from Archive Service
        await callArchiveService(
            "delete", 
            `/api/archive/${fileId}`, // Assuming endpoint for deletion
            {},
            { Authorization: req.headers.authorization }
        );
        logger.info(`File deletion requested successfully from Archive Service: ${fileId}`);
        
        // Optional: Clean up local temp file if it still exists (Archive Service might handle this)
        // fs.readdir(uploadDir, (err, files) => { ... find and unlink ... });

        res.status(200).send({ message: `File ${fileId} deletion initiated successfully.` });

    } catch (serviceError) {
        logger.error("Error requesting file deletion from Archive Service:", { fileId });
        if (serviceError.response?.status === 404) {
            res.status(404).send({ message: "File not found in archive." });
        } else {
            res.status(500).send({ message: "Could not initiate file deletion.", serviceError: serviceError.message });
        }
    }
});


module.exports = router;

