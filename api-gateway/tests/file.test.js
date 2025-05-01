const request = require("supertest");
const express = require("express"); // Import express for mocking app
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const formidable = require("formidable");
const { v4: uuidv4 } = require("uuid"); // Import uuid to mock it

// Mock the actual app - We need to mock the dependencies used in files.js
// Mock logger first as it's used globally
jest.mock("../src/utils/logger", () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

// Mock the NEW archiveClient module
const mockCallArchiveService = jest.fn();
jest.mock("../src/utils/archiveClient", () => ({
    callArchiveService: mockCallArchiveService,
}));

// Mock formidable
const mockParse = jest.fn();
const mockFormidableInstance = { parse: mockParse };
jest.mock("formidable", () => {
    return jest.fn(() => mockFormidableInstance); // Mock the constructor to return our instance
});

// Mock uuid
const mockGeneratedFileId = "mock-uuid-12345";
jest.mock("uuid", () => ({
    v4: jest.fn(() => mockGeneratedFileId),
}));

// Import the router *after* mocks are set up
const fileRoutes = require("../routes/files");
const logger = require("../src/utils/logger"); // Get the mocked logger

// Create a minimal express app to test the router
const app = express();
app.use(express.json());
// Mock authentication middleware for testing purposes
app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            // Use a known secret for testing
            const decoded = jwt.verify(token, "default_jwt_secret_change_in_production"); 
            req.user = decoded; // Attach user info if needed by routes
            next();
        } catch (err) {
            res.status(401).send({ message: "Invalid token" });
        }
    } else {
        // Allow unauthenticated access for specific tests if needed, or enforce auth
        // For these routes, auth is generally required
         if (!req.path.includes("unprotected")) { // Example: allow unprotected paths
             return res.status(401).send({ message: "Authentication required" });
         }
         next();
    }
});
app.use("/api/files", fileRoutes);

// Helper to create an error object that mimics an Axios error response
const createServiceError = (status, data) => {
    const error = new Error(`Request failed with status code ${status}`);
    error.response = { status, data };
    // Add other properties if the code specifically checks for them (e.g., isAxiosError)
    // error.isAxiosError = true; 
    return error;
};

// --- Test Suite ---
describe("File Routes (/api/files)", () => {
    let token;
    const testUserId = "user-test-123";
    const uploadDir = path.join(__dirname, "../uploads"); // Define uploadDir for path checks

    beforeAll(() => {
        // Generate a token for testing
        token = jwt.sign({ userId: testUserId, roles: ["user"] }, "default_jwt_secret_change_in_production", { expiresIn: "1h" });
    });

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Spy on and mock fs methods
        // jest.spyOn(fs, 'existsSync').mockReturnValue(true); // No longer needed
        jest.spyOn(fs, 'rename').mockImplementation((oldPath, newPath, cb) => cb(null));
        jest.spyOn(fs, 'unlink').mockImplementation((filePath, cb) => cb(null));
        jest.spyOn(fs, 'readdir').mockImplementation((dirPath, cb) => cb(null, []));
        jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {}); 
        // Mock fs.stat as well for res.download - default success
        jest.spyOn(fs, 'stat').mockImplementation((path, cb) => cb(null, { size: 1234, isFile: () => true }));

        // Reset the archive client mock
        mockCallArchiveService.mockClear();
        mockCallArchiveService.mockResolvedValue({}); // Reset default to resolve with empty object

        // Reset formidable mock parse function
        mockParse.mockImplementation((req, cb) => { // Reset the parse function directly
            // Default mock: no file uploaded
            cb(null, {}, {}); 
        });
        
        // Reset uuid mock - Access the mocked function directly
        require("uuid").v4.mockClear(); // Correct way to access the mock function
        require("uuid").v4.mockReturnValue(mockGeneratedFileId);
    });

    afterEach(() => {
        // Restore original implementations for spies
        jest.restoreAllMocks();
    });

    // --- POST /upload ---
    describe("POST /upload", () => {
        const mockFile = {
            filepath: "/tmp/mockpath123",
            originalFilename: "test.txt",
            mimetype: "text/plain",
            size: 100,
        };
        const expectedTempFilePath = path.join(uploadDir, `${mockGeneratedFileId}.txt`);

        it("should successfully upload a file and register with Archive Service", async () => {
            mockParse.mockImplementation((req, cb) => {
                cb(null, {}, { file: [mockFile] });
            });
            // Mock the successful response from callArchiveService
            mockCallArchiveService.mockResolvedValueOnce({ message: "Registered", fileId: mockGeneratedFileId });

            const response = await request(app)
                .post("/api/files/upload")
                .set("Authorization", `Bearer ${token}`)
                .send(); 

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("message", "File uploaded and registered successfully.");
            expect(response.body).toHaveProperty("fileId", mockGeneratedFileId);
            expect(response.body).toHaveProperty("filename", "test.txt");
            expect(fs.rename).toHaveBeenCalledWith(mockFile.filepath, expectedTempFilePath, expect.any(Function));
            // Check if callArchiveService was called correctly
            expect(mockCallArchiveService).toHaveBeenCalledWith(
                "post",
                "/api/archive/register",
                expect.objectContaining({ 
                    fileId: mockGeneratedFileId,
                    filename: "test.txt", 
                    size: 100,
                    tempPath: expectedTempFilePath 
                }),
                { Authorization: `Bearer ${token}` }
            );
        });

        it("should return 400 if no file is uploaded", async () => {
            const response = await request(app)
                .post("/api/files/upload")
                .set("Authorization", `Bearer ${token}`)
                .send();

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message", "No file uploaded.");
        });

        it("should return 500 if renaming fails", async () => {
            mockParse.mockImplementation((req, cb) => {
                cb(null, {}, { file: [mockFile] });
            });
            jest.spyOn(fs, 'rename').mockImplementation((oldPath, newPath, cb) => cb(new Error("Rename failed")));

            const response = await request(app)
                .post("/api/files/upload")
                .set("Authorization", `Bearer ${token}`)
                .send();

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("message", "Error finalizing file upload.");
            expect(fs.unlink).toHaveBeenCalledWith(mockFile.filepath, expect.any(Function)); 
        });

        it("should return 500 if Archive Service registration fails (non-service error)", async () => {
            mockParse.mockImplementation((req, cb) => {
                cb(null, {}, { file: [mockFile] });
            });
            // Simulate a generic error (no 'response' property)
            mockCallArchiveService.mockRejectedValueOnce(new Error("Network Error")); 

            const response = await request(app)
                .post("/api/files/upload")
                .set("Authorization", `Bearer ${token}`)
                .send();

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("message", "Could not communicate with Archive Service for registration.");
            // Check if unlink was called on the expected temporary file path
            expect(fs.unlink).toHaveBeenCalledWith(expectedTempFilePath, expect.any(Function)); 
        });
        
        it("should return 502 if Archive Service returns 5xx error", async () => {
            mockParse.mockImplementation((req, cb) => {
                cb(null, {}, { file: [mockFile] });
            });
            // Simulate a service error (with 'response' property)
            mockCallArchiveService.mockRejectedValueOnce(createServiceError(503, { message: "Service Unavailable" }));

            const response = await request(app)
                .post("/api/files/upload")
                .set("Authorization", `Bearer ${token}`)
                .send();

            expect(response.status).toBe(502); // Expect Bad Gateway if dependent service fails
            expect(response.body).toHaveProperty("message", "Archive Service error during registration.");
            // Check if unlink was called on the expected temporary file path
            expect(fs.unlink).toHaveBeenCalledWith(expectedTempFilePath, expect.any(Function)); 
        });

        it("should return 401 if not authenticated", async () => {
            const response = await request(app).post("/api/files/upload").send();
            expect(response.status).toBe(401);
        });
    });

    // --- GET /download/:fileId ---
    describe("GET /download/:fileId", () => {
        const fileId = "test-file-id-123";
        const filename = "document.pdf";
        const filePath = `/path/to/storage/${fileId}.pdf`;

        it("should download the file if found in Archive Service", async () => {
            // Mock successful response from callArchiveService
            mockCallArchiveService.mockResolvedValueOnce({ fileId: fileId, filename: filename, path: filePath });
            // Ensure fs.stat returns success for the specific path
            jest.spyOn(fs, 'stat').mockImplementation((p, cb) => {
                if (p === filePath) {
                    cb(null, { size: 5678, isFile: () => true });
                } else {
                    cb(new Error('File not found'));
                }
            });

            const response = await request(app)
                .get(`/api/files/download/${fileId}`)
                .set("Authorization", `Bearer ${token}`);

            // Check status and headers set by res.download
            expect(response.status).toBe(200); 
            expect(mockCallArchiveService).toHaveBeenCalledWith(
                "get",
                `/api/archive/info/${fileId}`,
                {},
                { Authorization: `Bearer ${token}` }
            );
            // expect(fs.existsSync).toHaveBeenCalledWith(filePath); // NO LONGER USED
            expect(fs.stat).toHaveBeenCalledWith(filePath, expect.any(Function)); // Check if stat was called
            // Check headers set by res.download
            expect(response.headers['content-disposition']).toBe(`attachment; filename="${filename}"`);
            // Supertest handles the download stream, we don't need to mock res.download directly
        });

        it("should return 404 if file info not found in Archive Service", async () => {
            // Simulate 404 error from service
            mockCallArchiveService.mockRejectedValueOnce(createServiceError(404, { message: "Not Found" }));

            const response = await request(app)
                .get(`/api/files/download/${fileId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message", "File not found in archive.");
        });

        it("should return 404 if file not found at storage location", async () => {
             mockCallArchiveService.mockResolvedValueOnce({ fileId: fileId, filename: filename, path: filePath });
             // Ensure fs.stat returns ENOENT error for the specific path
            jest.spyOn(fs, 'stat').mockImplementation((p, cb) => {
                if (p === filePath) {
                    const error = new Error('File not found');
                    error.code = 'ENOENT'; // Simulate file not found error
                    cb(error);
                } else {
                    cb(null, { size: 123, isFile: () => true }); // Default success for other paths
                }
            });

            const response = await request(app)
                .get(`/api/files/download/${fileId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message", "File not found at storage location.");
            expect(fs.stat).toHaveBeenCalledWith(filePath, expect.any(Function)); // Verify stat was called
        });

        it("should return 500 if Archive Service call fails unexpectedly (non-service error)", async () => {
            mockCallArchiveService.mockRejectedValueOnce(new Error("Internal Server Error"));

            const response = await request(app)
                .get(`/api/files/download/${fileId}`)
                .set("Authorization", `Bearer ${token}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("message", "Could not communicate with Archive Service for retrieving file information.");
        });
        
        it("should return 502 if Archive Service returns 5xx error", async () => {
            mockCallArchiveService.mockRejectedValueOnce(createServiceError(500, { message: "Server Error" }));

            const response = await request(app)
                .get(`/api/files/download/${fileId}`)
                .set("Authorization", `Bearer ${token}`);
                
            expect(response.status).toBe(502);
            expect(response.body).toHaveProperty("message", "Archive Service error during retrieving file information.");
        });

        it("should return 401 if not authenticated", async () => {
            const response = await request(app).get(`/api/files/download/${fileId}`);
            expect(response.status).toBe(401);
        });
    });

    // --- GET / ---
    describe("GET /", () => {
        it("should list files from Archive Service", async () => {
            const mockFileList = { files: [{ fileId: "f1", filename: "a.txt" }, { fileId: "f2", filename: "b.pdf" }], total: 2 };
            mockCallArchiveService.mockResolvedValueOnce(mockFileList);

            const response = await request(app)
                .get("/api/files/")
                .set("Authorization", `Bearer ${token}`)
                .query({ limit: 10, offset: 0 });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockFileList);
            expect(mockCallArchiveService).toHaveBeenCalledWith(
                "get",
                "/api/archive/search",
                { params: { limit: '10', offset: '0' } }, 
                { Authorization: `Bearer ${token}` }
            );
        });

        it("should return 500 if Archive Service call fails (non-service error)", async () => {
            mockCallArchiveService.mockRejectedValueOnce(new Error("Service Error"));

            const response = await request(app)
                .get("/api/files/")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("message", "Could not communicate with Archive Service for listing files.");
        });
        
        it("should return 502 if Archive Service returns 5xx error", async () => {
            mockCallArchiveService.mockRejectedValueOnce(createServiceError(500, { message: "Server Error" }));

            const response = await request(app)
                .get("/api/files/")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(502);
            expect(response.body).toHaveProperty("message", "Archive Service error during listing files.");
        });

        it("should return 401 if not authenticated", async () => {
            const response = await request(app).get("/api/files/");
            expect(response.status).toBe(401);
        });
    });

    // --- PUT /metadata/:fileId ---
    describe("PUT /metadata/:fileId", () => {
        const fileId = "metadata-test-id";
        const updates = { description: "New description", tags: ["tag1", "tag2"] };

        it("should update metadata via Archive Service", async () => {
            const updatedInfo = { fileId: fileId, filename: "meta.txt", ...updates };
            mockCallArchiveService.mockResolvedValueOnce(updatedInfo);

            const response = await request(app)
                .put(`/api/files/metadata/${fileId}`)
                .set("Authorization", `Bearer ${token}`)
                .send(updates);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Metadata updated successfully.");
            expect(response.body).toHaveProperty("fileInfo", updatedInfo);
            expect(mockCallArchiveService).toHaveBeenCalledWith(
                "put",
                `/api/archive/metadata/${fileId}`,
                updates,
                { Authorization: `Bearer ${token}` }
            );
        });

        it("should return 400 if no update data is provided", async () => {
            const response = await request(app)
                .put(`/api/files/metadata/${fileId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message", "No metadata updates provided.");
        });

        it("should return 404 if file not found in Archive Service", async () => {
            mockCallArchiveService.mockRejectedValueOnce(createServiceError(404, { message: "Not Found" }));

            const response = await request(app)
                .put(`/api/files/metadata/${fileId}`)
                .set("Authorization", `Bearer ${token}`)
                .send(updates);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message", "File not found in archive.");
        });

        it("should return 500 if Archive Service call fails unexpectedly (non-service error)", async () => {
            mockCallArchiveService.mockRejectedValueOnce(new Error("Internal Error"));

            const response = await request(app)
                .put(`/api/files/metadata/${fileId}`)
                .set("Authorization", `Bearer ${token}`)
                .send(updates);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("message", "Could not communicate with Archive Service for updating metadata.");
        });
        
        it("should return 502 if Archive Service returns 5xx error", async () => {
            mockCallArchiveService.mockRejectedValueOnce(createServiceError(500, { message: "Server Error" }));

            const response = await request(app)
                .put(`/api/files/metadata/${fileId}`)
                .set("Authorization", `Bearer ${token}`)
                .send(updates);

            expect(response.status).toBe(502);
            expect(response.body).toHaveProperty("message", "Archive Service error during updating metadata.");
        });

        it("should return 401 if not authenticated", async () => {
            const response = await request(app).put(`/api/files/metadata/${fileId}`).send(updates);
            expect(response.status).toBe(401);
        });
    });

    // --- DELETE /:fileId ---
    describe("DELETE /:fileId", () => {
        const fileId = "delete-test-id";

        // Reset mocks specifically for DELETE tests to ensure correct setup
        beforeEach(() => {
            mockCallArchiveService.mockClear();
            mockCallArchiveService.mockResolvedValue({}); // Default success
        });

        it("should request deletion from Archive Service", async () => {
            // No need to mock again if default is resolve
            // mockCallArchiveService.mockResolvedValueOnce({ message: "Deletion initiated" });

            const response = await request(app)
                .delete(`/api/files/${fileId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", `File ${fileId} deletion initiated successfully.`);
            expect(mockCallArchiveService).toHaveBeenCalledWith(
                "delete",
                `/api/archive/${fileId}`,
                {},
                { Authorization: `Bearer ${token}` }
            );
        });

        it("should return 404 if file not found in Archive Service", async () => {
            mockCallArchiveService.mockRejectedValueOnce(createServiceError(404, { message: "Not Found" }));

            const response = await request(app)
                .delete(`/api/files/${fileId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message", "File not found in archive.");
        });

        it("should return 500 if Archive Service call fails unexpectedly (non-service error)", async () => {
            mockCallArchiveService.mockRejectedValueOnce(new Error("Internal Error"));

            const response = await request(app)
                .delete(`/api/files/${fileId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("message", "Could not communicate with Archive Service for initiating file deletion."); 
        });
        
        it("should return 502 if Archive Service returns 5xx error", async () => {
            mockCallArchiveService.mockRejectedValueOnce(createServiceError(500, { message: "Server Error" }));

            const response = await request(app)
                .delete(`/api/files/${fileId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(502);
            expect(response.body).toHaveProperty("message", "Archive Service error during initiating file deletion.");
        });

        it("should return 401 if not authenticated", async () => {
            const response = await request(app).delete(`/api/files/${fileId}`);
            expect(response.status).toBe(401);
        });
    });
});

