const express = require("express");
const router = express.Router();
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Define a directory for temporary uploads
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// File upload endpoint
router.post("/upload", (req, res, next) => {
  const form = formidable({ uploadDir: uploadDir, keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Error parsing form data:", err);
      return res.status(500).send({ message: "Error processing file upload.", error: err.message });
    }

    // Assuming single file upload with field name 'file'
    const file = files.file;

    if (!file || file.length === 0) {
        return res.status(400).send({ message: "No file uploaded." });
    }

    const uploadedFile = file[0]; // formidable v3 returns array
    const fileId = uuidv4();
    const originalFilename = uploadedFile.originalFilename;
    const newFilePath = path.join(uploadDir, `${fileId}-${originalFilename}`);

    // Rename the file to include a unique ID (optional, depends on strategy)
    fs.rename(uploadedFile.filepath, newFilePath, (renameErr) => {
        if (renameErr) {
            console.error("Error renaming uploaded file:", renameErr);
            // Attempt to clean up the partially uploaded file if rename fails
            fs.unlink(uploadedFile.filepath, (unlinkErr) => {
                if (unlinkErr) console.error("Error cleaning up failed upload:", unlinkErr);
            });
            return res.status(500).send({ message: "Error finalizing file upload.", error: renameErr.message });
        }

        console.log(`File uploaded and saved as: ${newFilePath}`);
        // TODO: Add logic to notify other services (e.g., Segmentation Service) about the new file
        res.status(201).send({ 
            message: "File uploaded successfully.", 
            fileId: fileId, 
            filename: originalFilename, 
            savedPath: newFilePath // For internal reference, might not expose this
        });
    });

  });
});

// Placeholder for file download endpoint
router.get("/download/:filename", (req, res) => {
  const { filename } = req.params;
  // TODO: Implement secure file download logic, potentially fetching from Archive Service or shared storage
  const filePath = path.join(uploadDir, filename); // Example: assuming files are stored locally for now

  if (fs.existsSync(filePath)) {
      res.download(filePath, (err) => {
          if (err) {
              console.error("Error downloading file:", err);
              res.status(500).send({ message: "Could not download the file.", error: err.message });
          }
      });
  } else {
      res.status(404).send({ message: "File not found." });
  }
});

// Placeholder for file listing/search endpoint
router.get("/", (req, res) => {
  // TODO: Implement file listing logic, potentially querying Archive Service
  fs.readdir(uploadDir, (err, files) => {
      if (err) {
          console.error("Error reading upload directory:", err);
          return res.status(500).send({ message: "Could not list files.", error: err.message });
      }
      res.status(200).send({ files: files }); // Basic listing for now
  });
});

// Placeholder for file metadata management endpoint
router.put("/metadata/:filename", (req, res) => {
  const { filename } = req.params;
  // TODO: Implement metadata update logic, potentially interacting with Archive Service
  res.status(501).send({ message: `Metadata management for ${filename} not implemented yet.` });
});

// File deletion endpoint
router.delete("/:filename", (req, res) => {
    const { filename } = req.params;
    // TODO: Implement secure file deletion logic, potentially coordinating with Archive Service
    const filePath = path.join(uploadDir, filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).send({ message: "File not found." });
            }
            console.error("Error deleting file:", err);
            return res.status(500).send({ message: "Could not delete the file.", error: err.message });
        }
        res.status(200).send({ message: `File ${filename} deleted successfully.` });
    });
});


module.exports = router;

