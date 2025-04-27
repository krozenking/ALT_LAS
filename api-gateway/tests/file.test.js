const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/index');
const { segmentationService, runnerService, archiveService } = require('../src/services/serviceIntegration');
const fs = require('fs');
const path = require('path');

// Mock service integration and fs
jest.mock('../src/services/serviceIntegration');
jest.mock('fs');
jest.mock('path');

describe('File Routes', () => {
  let token;
  
  beforeEach(() => {
    // Mock token for authenticated routes
    token = jwt.sign({ 
      userId: '123', 
      roles: ['user'], 
      permissions: ['read:files', 'write:files'] 
    }, 'default_jwt_secret_change_in_production');
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock fs functions
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockReturnValue(undefined);
    fs.readFileSync.mockReturnValue(Buffer.from('test file content'));
    fs.unlinkSync.mockReturnValue(undefined);
  });

  describe('POST /api/files/upload', () => {
    it('should upload an alt file', async () => {
      // Mock multer file
      const mockFile = {
        path: '/tmp/upload-123456',
        originalname: 'test.alt',
        mimetype: 'application/octet-stream',
        size: 1024
      };
      
      // Mock request with file
      app.request.file = mockFile;
      
      // Mock segmentation service
      segmentationService.post.mockResolvedValue({
        altFileId: 'alt-123',
        metadata: { originalName: 'test.alt' }
      });
      
      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('test file content'), 'test.alt')
        .field('metadata', JSON.stringify({ tag: 'test' }));
      
      expect(response.status).toBe(201);
      expect(segmentationService.post).toHaveBeenCalledWith(
        '/api/files/alt/upload',
        expect.objectContaining({
          content: expect.any(String),
          metadata: expect.objectContaining({
            originalName: 'test.alt',
            tag: 'test'
          })
        })
      );
      expect(response.body).toHaveProperty('fileId', 'alt-123');
      expect(response.body).toHaveProperty('fileName', 'test.alt');
      expect(response.body).toHaveProperty('fileType', 'alt');
    });
    
    it('should upload a last file', async () => {
      // Mock multer file
      const mockFile = {
        path: '/tmp/upload-123456',
        originalname: 'test.last',
        mimetype: 'application/octet-stream',
        size: 1024
      };
      
      // Mock request with file
      app.request.file = mockFile;
      
      // Mock runner service
      runnerService.post.mockResolvedValue({
        lastFileId: 'last-123',
        metadata: { originalName: 'test.last' }
      });
      
      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('test file content'), 'test.last')
        .field('metadata', JSON.stringify({ tag: 'test' }));
      
      expect(response.status).toBe(201);
      expect(runnerService.post).toHaveBeenCalledWith(
        '/api/files/last/upload',
        expect.objectContaining({
          content: expect.any(String),
          metadata: expect.objectContaining({
            originalName: 'test.last',
            tag: 'test'
          })
        })
      );
      expect(response.body).toHaveProperty('fileId', 'last-123');
      expect(response.body).toHaveProperty('fileName', 'test.last');
      expect(response.body).toHaveProperty('fileType', 'last');
    });
    
    it('should upload an atlas file', async () => {
      // Mock multer file
      const mockFile = {
        path: '/tmp/upload-123456',
        originalname: 'test.atlas',
        mimetype: 'application/octet-stream',
        size: 1024
      };
      
      // Mock request with file
      app.request.file = mockFile;
      
      // Mock archive service
      archiveService.post.mockResolvedValue({
        atlasFileId: 'atlas-123',
        metadata: { originalName: 'test.atlas' }
      });
      
      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('test file content'), 'test.atlas')
        .field('metadata', JSON.stringify({ tag: 'test' }));
      
      expect(response.status).toBe(201);
      expect(archiveService.post).toHaveBeenCalledWith(
        '/api/files/atlas/upload',
        expect.objectContaining({
          content: expect.any(String),
          metadata: expect.objectContaining({
            originalName: 'test.atlas',
            tag: 'test'
          })
        })
      );
      expect(response.body).toHaveProperty('fileId', 'atlas-123');
      expect(response.body).toHaveProperty('fileName', 'test.atlas');
      expect(response.body).toHaveProperty('fileType', 'atlas');
    });
    
    it('should return 400 if file is missing', async () => {
      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(400);
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post('/api/files/upload')
        .attach('file', Buffer.from('test file content'), 'test.alt');
      
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/files/alt/:fileId', () => {
    it('should download an alt file', async () => {
      const fileId = 'alt-123';
      
      segmentationService.getAltFile.mockResolvedValue({
        content: 'file content',
        metadata: { originalName: 'test.alt' }
      });
      
      const response = await request(app)
        .get(`/api/files/alt/${fileId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(segmentationService.getAltFile).toHaveBeenCalledWith(fileId);
      expect(response.header['content-type']).toBe('application/octet-stream');
      expect(response.header['content-disposition']).toContain('attachment');
      expect(response.header['content-disposition']).toContain('test.alt');
      expect(response.text).toBe('file content');
    });
    
    it('should return 404 if file not found', async () => {
      segmentationService.getAltFile.mockResolvedValue(null);
      
      const response = await request(app)
        .get('/api/files/alt/nonexistent')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/files/last/:fileId', () => {
    it('should download a last file', async () => {
      const fileId = 'last-123';
      
      runnerService.getLastFile.mockResolvedValue({
        content: 'file content',
        metadata: { originalName: 'test.last' }
      });
      
      const response = await request(app)
        .get(`/api/files/last/${fileId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(runnerService.getLastFile).toHaveBeenCalledWith(fileId);
      expect(response.header['content-type']).toBe('application/octet-stream');
      expect(response.header['content-disposition']).toContain('attachment');
      expect(response.header['content-disposition']).toContain('test.last');
      expect(response.text).toBe('file content');
    });
  });

  describe('GET /api/files/atlas/:fileId', () => {
    it('should download an atlas file', async () => {
      const fileId = 'atlas-123';
      
      archiveService.getAtlasFile.mockResolvedValue({
        content: 'file content',
        metadata: { originalName: 'test.atlas' }
      });
      
      const response = await request(app)
        .get(`/api/files/atlas/${fileId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(archiveService.getAtlasFile).toHaveBeenCalledWith(fileId);
      expect(response.header['content-type']).toBe('application/octet-stream');
      expect(response.header['content-disposition']).toContain('attachment');
      expect(response.header['content-disposition']).toContain('test.atlas');
      expect(response.text).toBe('file content');
    });
  });

  describe('GET /api/files/list', () => {
    it('should list files by type', async () => {
      const mockFiles = {
        files: [
          { id: 'alt-123', name: 'test1.alt' },
          { id: 'alt-456', name: 'test2.alt' }
        ],
        total: 2
      };
      
      segmentationService.get.mockResolvedValue(mockFiles);
      
      const response = await request(app)
        .get('/api/files/list?type=alt')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(segmentationService.get).toHaveBeenCalledWith(
        '/api/files/alt/list',
        expect.objectContaining({
          userId: '123',
          limit: 10,
          offset: 0
        })
      );
      expect(response.body).toEqual(mockFiles);
    });
    
    it('should return 400 if type is missing', async () => {
      const response = await request(app)
        .get('/api/files/list')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(400);
    });
    
    it('should return 400 if type is invalid', async () => {
      const response = await request(app)
        .get('/api/files/list?type=invalid')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/files/search', () => {
    it('should search files by type and query', async () => {
      const mockResults = {
        files: [
          { id: 'alt-123', name: 'test1.alt' }
        ],
        total: 1
      };
      
      segmentationService.get.mockResolvedValue(mockResults);
      
      const response = await request(app)
        .get('/api/files/search?type=alt&query=test')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(segmentationService.get).toHaveBeenCalledWith(
        '/api/files/alt/search',
        expect.objectContaining({
          userId: '123',
          query: 'test',
          limit: 10,
          offset: 0
        })
      );
      expect(response.body).toEqual(mockResults);
    });
    
    it('should return 400 if type is missing', async () => {
      const response = await request(app)
        .get('/api/files/search?query=test')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(400);
    });
    
    it('should return 400 if query is missing', async () => {
      const response = await request(app)
        .get('/api/files/search?type=alt')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/files/metadata/:type/:fileId', () => {
    it('should get file metadata', async () => {
      const fileId = 'alt-123';
      const mockMetadata = {
        originalName: 'test.alt',
        size: 1024,
        createdAt: '2025-04-27T00:00:00Z',
        tags: ['test']
      };
      
      segmentationService.get.mockResolvedValue({
        metadata: mockMetadata
      });
      
      const response = await request(app)
        .get(`/api/files/metadata/alt/${fileId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(segmentationService.get).toHaveBeenCalledWith(`/api/files/alt/${fileId}/metadata`);
      expect(response.body).toEqual(mockMetadata);
    });
    
    it('should return 404 if metadata not found', async () => {
      segmentationService.get.mockResolvedValue(null);
      
      const response = await request(app)
        .get('/api/files/metadata/alt/nonexistent')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/files/metadata/:type/:fileId', () => {
    it('should update file metadata', async () => {
      const fileId = 'alt-123';
      const metadata = {
        tags: ['test', 'updated'],
        description: 'Updated description'
      };
      
      segmentationService.put.mockResolvedValue({
        metadata: {
          originalName: 'test.alt',
          size: 1024,
          createdAt: '2025-04-27T00:00:00Z',
          ...metadata
        }
      });
      
      const response = await request(app)
        .put(`/api/files/metadata/alt/${fileId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ metadata });
      
      expect(response.status).toBe(200);
      expect(segmentationService.put).toHaveBeenCalledWith(
        `/api/files/alt/${fileId}/metadata`,
        { metadata }
      );
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('metadata');
    });
    
    it('should return 400 if metadata is missing', async () => {
      const response = await request(app)
        .put('/api/files/metadata/alt/alt-123')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      
      expect(response.status).toBe(400);
    });
  });
});
