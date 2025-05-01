const express = require("express");
const router = express.Router();
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios"); // Import axios
const logger = require("../src/utils/logger"); // Import logger

// Define a directory for temporary uploads
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// TODO: Move service URLs to config
const SEGMENTATION_SERVICE_URL = process.env.SEGMENTATION_SERVICE_URL || "http://localhost:3001"; // Example URL, adjust as needed

// File upload endpoint
router.post("/upload", (req, res, next) => {
  // Use host from the original request for service calls if running in same network
  const baseUrl = `${req.protocol}://${req.get("host")}`;

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
    // Store file with unique ID to avoid collisions and simplify referencing
    const newFilePath = path.join(uploadDir, `${fileId}${path.extname(originalFilename)}`); 

    fs.rename(uploadedFile.filepath, newFilePath, async (renameErr) => {
        if (renameErr) {
            logger.error("Error renaming uploaded file:", { error: renameErr.message, originalPath: uploadedFile.filepath, newPath: newFilePath });
            fs.unlink(uploadedFile.filepath, (unlinkErr) => {
                if (unlinkErr) logger.error("Error cleaning up failed upload:", { error: unlinkErr.message, path: uploadedFile.filepath });
            });
            return res.status(500).send({ message: "Error finalizing file upload.", error: renameErr.message });
        }

        logger.info(`File uploaded and saved as: ${newFilePath}`, { fileId: fileId, filename: originalFilename });

        // Notify Segmentation Service about the new file
        // TODO: Refactor this into a dedicated service client/layer
        try {
            // Assuming Segmentation Service has an endpoint to process uploaded files
            // The gateway should ideally proxy this request instead of knowing the direct URL
            // Using relative path assuming gateway proxies /api/segmentation
            const segmentationEndpoint = `${baseUrl}/api/segmentation/process`; 
            logger.info(`Notifying Segmentation Service at ${segmentationEndpoint}`, { fileId: fileId, filename: originalFilename });
            
            // Send file metadata (ID, name, maybe path if shared volume)
            await axios.post(segmentationEndpoint, { 
                fileId: fileId,
                filename: originalFilename,
                // Pass auth token if needed by segmentation service
                // headers: { Authorization: req.headers.authorization } 
            }, {
                // Pass necessary headers, especially Authorization if needed
                headers: { Authorization: req.headers.authorization } 
            });

            logger.info("Successfully notified Segmentation Service.", { fileId: fileId });
            res.status(201).send({ 
                message: "File uploaded successfully and segmentation process initiated.", 
                fileId: fileId, 
                filename: originalFilename
            });

        } catch (serviceError) {
            logger.error("Error notifying Segmentation Service:", { 
                error: serviceError.message, 
                fileId: fileId, 
                response: serviceError.response?.data 
            });
            // Decide on error handling: Should the upload fail if notification fails?
            // For now, return success but include a warning/note.
            res.status(202).send({ // 202 Accepted: Upload OK, but downstream processing might have issues
                message: "File uploaded successfully, but could not initiate segmentation process.", 
                fileId: fileId, 
                filename: originalFilename,
                warning: "Failed to notify Segmentation Service.",
                serviceError: serviceError.message
            });
        }
    });
  });
});

// File download endpoint
router.get("/download/:fileId", (req, res) => {
  const { fileId } = req.params;
  // TODO: Implement secure file download logic, potentially fetching from Archive Service or shared storage
  // This needs a way to map fileId back to a filename/path
  // For now, search for file starting with fileId in uploadDir
  fs.readdir(uploadDir, (err, files) => {
      if (err) {
          logger.error("Error reading upload directory for download:", { error: err.message, fileId });
          return res.status(500).send({ message: "Could not access file storage.", error: err.message });
      }
      const foundFile = files.find(f => f.startsWith(fileId));
      if (foundFile) {
          const filePath = path.join(uploadDir, foundFile);
          res.download(filePath, foundFile.substring(fileId.length + 1), (downloadErr) => { // Send original name
              if (downloadErr) {
                  logger.error("Error downloading file:", { error: downloadErr.message, fileId, path: filePath });
                  // Avoid sending detailed error messages to client
                  if (!res.headersSent) {
                      res.status(500).send({ message: "Could not download the file." });
                  }
              }
          });
      } else {
          res.status(404).send({ message: "File not found." });
      }
  });
});

// File listing/search endpoint
router.get("/", (req, res) => {
  // TODO: Implement file listing logic, potentially querying Archive Service
  fs.readdir(uploadDir, (err, files) => {
      if (err) {
          logger.error("Error reading upload directory:", { error: err.message });
          return res.status(500).send({ message: "Could not list files.", error: err.message });
      }
      // Map files to include ID and original name (if possible)
      const fileList = files.map(f => {
          const parts = f.split(".");
          const ext = parts.pop();
          const id = parts.join("."); // Assuming filename is UUID.ext
          // This is a simplification; original name isn't stored here
          return { fileId: id, storedName: f }; 
      });
      res.status(200).send({ files: fileList }); // Basic listing for now
  });
});

// Placeholder for file metadata management endpoint
router.put("/metadata/:fileId", (req, res) => {
  const { fileId } = req.params;
  // TODO: Implement metadata update logic, potentially interacting with Archive Service
  logger.warn("Metadata update endpoint called but not implemented.", { fileId });
  res.status(501).send({ message: `Metadata management for ${fileId} not implemented yet.` });
});

// File deletion endpoint
router.delete("/:fileId", (req, res) => {
    const { fileId } = req.params;
    // TODO: Implement secure file deletion logic, potentially coordinating with Archive Service
    // Find the actual file name based on fileId
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            logger.error("Error reading upload directory for deletion:", { error: err.message, fileId });
            return res.status(500).send({ message: "Could not access file storage.", error: err.message });
        }
        const foundFile = files.find(f => f.startsWith(fileId));
        if (foundFile) {
            const filePath = path.join(uploadDir, foundFile);
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    logger.error("Error deleting file:", { error: unlinkErr.message, fileId, path: filePath });
                    return res.status(500).send({ message: "Could not delete the file.", error: unlinkErr.message });
                }
                logger.info(`File deleted successfully: ${filePath}`, { fileId });
                res.status(200).send({ message: `File ${fileId} deleted successfully.` });
            });
        } else {
            res.status(404).send({ message: "File not found." });
        }
    });
});


module.exports = router;

