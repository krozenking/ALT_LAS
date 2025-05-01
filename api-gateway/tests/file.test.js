const request = require("supertest");
const express = require("express"); // Import express for mocking app
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const formidable = require("formidable");

// Mock the actual app - We need to mock the dependencies used in files.js
// Mock logger first as it's used globally
jest.mock("../src/utils/logger", () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

// Mock axios for service calls
const mockAxiosInstance = jest.fn().mockResolvedValue({ data: {}, status: 200 });
jest.mock("axios", () => ({
  __esModule: true,
  default: mockAxiosInstance,
  // Mock other methods if they were used directly
  get: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
  post: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
  put: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
  delete: jest.fn().mockResolvedValue({ data: {}, status: 200 }),
}));

// Mock formidable
const mockParse = jest.fn();
const mockFormidableInstance = { parse: mockParse };
jest.mock("formidable", () => {
    return jest.fn(() => mockFormidableInstance); // Mock the constructor to return our instance
});

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

// Helper to create axios error with response
const createAxiosError = (status, data) => {
    const error = new Error(`Request failed with status code ${status}`);
    error.response = { status, data };
    return error;
};

// --- Test Suite ---
describe("File Routes (/api/files)", () => {
    let token;
    const testUserId = "user-test-123";
    const archiveServiceUrl = process.env.ARCHIVE_SERVICE_URL || "http://localhost:3003";

    beforeAll(() => {
        // Generate a token for testing
        token = jwt.sign({ userId: testUserId, roles: ["user"] }, "default_jwt_secret_change_in_production", { expiresIn: "1h" });
    });

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Spy on and mock fs methods
        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        jest.spyOn(fs, 'rename').mockImplementation((oldPath, newPath, cb) => cb(null));
        jest.spyOn(fs, 'unlink').mockImplementation((filePath, cb) => cb(null));
        jest.spyOn(fs, 'readdir').mockImplementation((dirPath, cb) => cb(null, []));
        jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {}); 

        // Reset axios mock (using the explicitly mocked instance)
        mockAxiosInstance.mockClear();
        mockAxiosInstance.mockResolvedValue({ data: {}, status: 200 }); // Reset default

        // Reset formidable mock parse function
        mockParse.mockImplementation((req, cb) => { // Reset the parse function directly
            // Default mock: no file uploaded
            cb(null, {}, {}); 
        });
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

        it("should successfully upload a file and register with Archive Service", async () => {
            mockParse.mockImplementation((req, cb) => {
                cb(null, {}, { file: [mockFile] });
            });
            mockAxiosInstance.mockResolvedValueOnce({ 
                data: { message: "Registered", fileId: expect.any(String) }, 
                status: 201 
            });

            const response = await request(app)
                .post("/api/files/upload")
                .set("Authorization", `Bearer ${token}`)
                .send(); 

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("message", "File uploaded and registered successfully.");
            expect(response.body).toHaveProperty("fileId");
            expect(response.body).toHaveProperty("filename", "test.txt");
            expect(fs.rename).toHaveBeenCalled();
            expect(mockAxiosInstance).toHaveBeenCalledWith(expect.objectContaining({
                method: "post",
                url: `${archiveServiceUrl}/api/archive/register`,
                data: expect.objectContaining({ filename: "test.txt", size: 100 }),
                headers: { Authorization: `Bearer ${token}` }
            }));
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

        it("should return 500 if Archive Service registration fails (non-axios error)", async () => {
            mockParse.mockImplementation((req, cb) => {
                cb(null, {}, { file: [mockFile] });
            });
            mockAxiosInstance.mockRejectedValueOnce(new Error("Network Error")); // Simulate generic error

            const response = await request(app)
                .post("/api/files/upload")
                .set("Authorization", `Bearer ${token}`)
                .send();

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("message", "File uploaded but failed to register with Archive Service.");
            expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining(response.body.fileId), expect.any(Function)); 
        });
        
        it("should return 502 if Archive Service returns 5xx error", async () => {
            mockParse.mockImplementation((req, cb) => {
                cb(null, {}, { file: [mockFile] });
            });
            mockAxiosInstance.mockRejectedValueOnce(createAxiosError(503, { message: "Service Unavailable" }));

            const response = await request(app)
                .post("/api/files/upload")
                .set("Authorization", `Bearer ${token}`)
                .send();

            expect(response.status).toBe(502); // Expect Bad Gateway if dependent service fails
            expect(response.body).toHaveProperty("message", "Archive Service registration failed.");
            expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining(response.body.fileId), expect.any(Function)); 
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
            mockAxiosInstance.mockResolvedValueOnce({ 
                data: { fileId: fileId, filename: filename, path: filePath }, 
                status: 200 
            });
            jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true); 

            const response = await request(app)
                .get(`/api/files/download/${fileId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(mockAxiosInstance).toHaveBeenCalledWith(expect.objectContaining({
                method: "get",
                url: `${archiveServiceUrl}/api/archive/info/${fileId}`,
                headers: { Authorization: `Bearer ${token}` }
            }));
            expect(fs.existsSync).toHaveBeenCalledWith(filePath);
            expect(response.headers["content-disposition"]).toBe(`attachment; filename="${filename}"`);
        });

        it("should return 404 if file info not found in Archive Service", async () => {
            mockAxiosInstance.mockRejectedValueOnce(createAxiosError(404, { message: "Not Found" }));

            const response = await request(app)
                .get(`/api/files/download/${fileId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message", "File not found in archive.");
        });

        it("should return 404 if file not found at storage location", async () => {
             mockAxiosInstance.mockResolvedValueOnce({ 
                data: { fileId: fileId, filename: filename, path: filePath }, 
                status: 200 
            });
            jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false); 

            const response = await request(app)
                .get(`/api/files/download/${fileId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message", "File not found at storage location.");
        });

        it("should return 500 if Archive Service call fails unexpectedly (non-axios error)", async () => {
            mockAxiosInstance.mockRejectedValueOnce(new Error("Internal Server Error"));

            const response = await request(app)
                .get(`/api/files/download/${fileId}`)
                .set("Authorization", `Bearer ${token}`);
                
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("message", "Error retrieving file information.");
        });
        
        it("should return 502 if Archive Service returns 5xx error", async () => {
            mockAxiosInstance.mockRejectedValueOnce(createAxiosError(500, { message: "Server Error" }));

            const response = await request(app)
                .get(`/api/files/download/${fileId}`)
                .set("Authorization", `Bearer ${token}`);
                
            expect(response.status).toBe(502);
            expect(response.body).toHaveProperty("message", "Error retrieving file information from Archive Service.");
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
            mockAxiosInstance.mockResolvedValueOnce({ data: mockFileList, status: 200 });

            const response = await request(app)
                .get("/api/files/")
                .set("Authorization", `Bearer ${token}`)
                .query({ limit: 10, offset: 0 });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockFileList);
            expect(mockAxiosInstance).toHaveBeenCalledWith(expect.objectContaining({
                method: "get",
                url: `${archiveServiceUrl}/api/archive/search`,
                params: { limit: '10', offset: '0' }, 
                headers: { Authorization: `Bearer ${token}` }
            }));
        });

        it("should return 500 if Archive Service call fails (non-axios error)", async () => {
            mockAxiosInstance.mockRejectedValueOnce(new Error("Service Error"));

            const response = await request(app)
                .get("/api/files/")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("message", "Could not list files.");
        });
        
        it("should return 502 if Archive Service returns 5xx error", async () => {
            mockAxiosInstance.mockRejectedValueOnce(createAxiosError(500, { message: "Server Error" }));

            const response = await request(app)
                .get("/api/files/")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(502);
            expect(response.body).toHaveProperty("message", "Could not list files from Archive Service.");
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
            mockAxiosInstance.mockResolvedValueOnce({ data: updatedInfo, status: 200 });

            const response = await request(app)
                .put(`/api/files/metadata/${fileId}`)
                .set("Authorization", `Bearer ${token}`)
                .send(updates);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", "Metadata updated successfully.");
            expect(response.body).toHaveProperty("fileInfo", updatedInfo);
            expect(mockAxiosInstance).toHaveBeenCalledWith(expect.objectContaining({
                method: "put",
                url: `${archiveServiceUrl}/api/archive/metadata/${fileId}`,
                data: updates,
                headers: { Authorization: `Bearer ${token}` }
            }));
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
            mockAxiosInstance.mockRejectedValueOnce(createAxiosError(404, { message: "Not Found" }));

            const response = await request(app)
                .put(`/api/files/metadata/${fileId}`)
                .set("Authorization", `Bearer ${token}`)
                .send(updates);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message", "File not found in archive.");
        });

        it("should return 500 if Archive Service call fails unexpectedly (non-axios error)", async () => {
            mockAxiosInstance.mockRejectedValueOnce(new Error("Internal Error"));

            const response = await request(app)
                .put(`/api/files/metadata/${fileId}`)
                .set("Authorization", `Bearer ${token}`)
                .send(updates);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("message", "Could not update metadata.");
        });
        
        it("should return 502 if Archive Service returns 5xx error", async () => {
            mockAxiosInstance.mockRejectedValueOnce(createAxiosError(500, { message: "Server Error" }));

            const response = await request(app)
                .put(`/api/files/metadata/${fileId}`)
                .set("Authorization", `Bearer ${token}`)
                .send(updates);

            expect(response.status).toBe(502);
            expect(response.body).toHaveProperty("message", "Could not update metadata in Archive Service.");
        });

        it("should return 401 if not authenticated", async () => {
            const response = await request(app).put(`/api/files/metadata/${fileId}`).send(updates);
            expect(response.status).toBe(401);
        });
    });

    // --- DELETE /:fileId ---
    describe("DELETE /:fileId", () => {
        const fileId = "delete-test-id";

        it("should request deletion from Archive Service", async () => {
            mockAxiosInstance.mockResolvedValueOnce({ data: { message: "Deletion initiated" }, status: 200 });

            const response = await request(app)
                .delete(`/api/files/${fileId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("message", `File ${fileId} deletion initiated successfully.`);
            expect(mockAxiosInstance).toHaveBeenCalledWith(expect.objectContaining({
                method: "delete",
                url: `${archiveServiceUrl}/api/archive/${fileId}`,
                headers: { Authorization: `Bearer ${token}` }
            }));
        });

        it("should return 404 if file not found in Archive Service", async () => {
            mockAxiosInstance.mockRejectedValueOnce(createAxiosError(404, { message: "Not Found" }));

            const response = await request(app)
                .delete(`/api/files/${fileId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("message", "File not found in archive.");
        });

        it("should return 500 if Archive Service call fails unexpectedly (non-axios error)", async () => {
            mockAxiosInstance.mockRejectedValueOnce(new Error("Internal Error"));

            const response = await request(app)
                .delete(`/api/files/${fileId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty("message", "Could not initiate file deletion.");
        });
        
        it("should return 502 if Archive Service returns 5xx error", async () => {
            mockAxiosInstance.mockRejectedValueOnce(createAxiosError(500, { message: "Server Error" }));

            const response = await request(app)
                .delete(`/api/files/${fileId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(502);
            expect(response.body).toHaveProperty("message", "Could not initiate file deletion in Archive Service.");
        });

        it("should return 401 if not authenticated", async () => {
            const response = await request(app).delete(`/api/files/${fileId}`);
            expect(response.status).toBe(401);
        });
    });
});

