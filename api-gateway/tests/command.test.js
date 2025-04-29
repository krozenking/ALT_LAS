const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/index');
const { segmentationService, runnerService, archiveService } = require('../src/services/serviceIntegration');

// Mock service integration
jest.mock('../src/services/serviceIntegration');

describe('Command Routes', () => {
  let token;
  
  beforeEach(() => {
    // Mock token for authenticated routes
    token = jwt.sign({ 
      userId: '123', 
      roles: ['user'], 
      permissions: ['read:runner', 'write:runner'] 
    }, 'default_jwt_secret_change_in_production');
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('POST /api/commands', () => {
    it('should process a command', async () => {
      const commandData = {
        command: 'test command',
        options: { param1: 'value1' }
      };
      
      // Mock segmentation service
      segmentationService.segmentCommand.mockResolvedValue({
        altFileId: 'alt-123',
        segments: []
      });
      
      // Mock runner service
      runnerService.runCommand.mockResolvedValue({
        runId: 'run-123',
        status: 'processing',
        estimatedCompletionTime: '2025-04-27T01:00:00Z'
      });
      
      const response = await request(app)
        .post('/api/commands')
        .set('Authorization', `Bearer ${token}`)
        .send(commandData);
      
      expect(response.status).toBe(202);
      expect(segmentationService.segmentCommand).toHaveBeenCalledWith(
        commandData.command,
        expect.objectContaining(commandData.options)
      );
      expect(runnerService.runCommand).toHaveBeenCalledWith(
        'alt-123',
        expect.any(Object)
      );
      expect(response.body).toHaveProperty('commandId', 'run-123');
      expect(response.body).toHaveProperty('status', 'processing');
    });
    
    it('should return 400 if command is missing', async () => {
      const response = await request(app)
        .post('/api/commands')
        .set('Authorization', `Bearer ${token}`)
        .send({ options: {} });
      
      expect(response.status).toBe(400);
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post('/api/commands')
        .send({ command: 'test' });
      
      expect(response.status).toBe(401);
    });
    
    it('should return 403 if missing required permissions', async () => {
      const limitedToken = jwt.sign({ 
        userId: '123', 
        roles: ['user'], 
        permissions: ['read:runner'] // Missing write:runner
      }, 'default_jwt_secret_change_in_production');
      
      const response = await request(app)
        .post('/api/commands')
        .set('Authorization', `Bearer ${limitedToken}`)
        .send({ command: 'test' });
      
      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/commands/:commandId', () => {
    it('should get command status', async () => {
      const commandId = 'run-123';
      
      runnerService.getCommandStatus.mockResolvedValue({
        runId: commandId,
        status: 'completed',
        result: 'Command executed successfully',
        lastFileId: 'last-123'
      });
      
      const response = await request(app)
        .get(`/api/commands/${commandId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(runnerService.getCommandStatus).toHaveBeenCalledWith(commandId);
      expect(response.body).toHaveProperty('runId', commandId);
      expect(response.body).toHaveProperty('status', 'completed');
    });
    
    it('should return 404 if command not found', async () => {
      runnerService.getCommandStatus.mockResolvedValue(null);
      
      const response = await request(app)
        .get('/api/commands/nonexistent')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/commands/:commandId/cancel', () => {
    it('should cancel a command', async () => {
      const commandId = 'run-123';
      
      runnerService.cancelCommand.mockResolvedValue({
        runId: commandId,
        status: 'cancelled'
      });
      
      const response = await request(app)
        .post(`/api/commands/${commandId}/cancel`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(runnerService.cancelCommand).toHaveBeenCalledWith(commandId);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('status', 'cancelled');
    });
    
    it('should return 404 if command not found', async () => {
      runnerService.cancelCommand.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/api/commands/nonexistent/cancel')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/commands/history', () => {
    it('should get command history', async () => {
      const mockHistory = {
        commands: [
          { runId: 'run-123', status: 'completed' },
          { runId: 'run-456', status: 'failed' }
        ],
        total: 2
      };
      
      runnerService.get.mockResolvedValue(mockHistory);
      
      const response = await request(app)
        .get('/api/commands/history')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(runnerService.get).toHaveBeenCalledWith(
        '/api/history',
        expect.objectContaining({
          userId: '123',
          limit: 10,
          offset: 0
        })
      );
      expect(response.body).toEqual(mockHistory);
    });
    
    it('should apply query parameters', async () => {
      runnerService.get.mockResolvedValue({ commands: [], total: 0 });
      
      const response = await request(app)
        .get('/api/commands/history?limit=5&offset=10&status=completed')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(runnerService.get).toHaveBeenCalledWith(
        '/api/history',
        expect.objectContaining({
          userId: '123',
          limit: 5,
          offset: 10,
          status: 'completed'
        })
      );
    });
  });

  describe('POST /api/commands/archive/:commandId', () => {
    it('should archive a completed command', async () => {
      const commandId = 'run-123';
      const metadata = { tag: 'important' };
      
      // Mock command status
      runnerService.getCommandStatus.mockResolvedValue({
        runId: commandId,
        status: 'completed',
        lastFileId: 'last-123'
      });
      
      // Mock archive service
      archiveService.archiveLastFile.mockResolvedValue({
        atlasFileId: 'atlas-123'
      });
      
      const response = await request(app)
        .post(`/api/commands/archive/${commandId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ metadata });
      
      expect(response.status).toBe(200);
      expect(runnerService.getCommandStatus).toHaveBeenCalledWith(commandId);
      expect(archiveService.archiveLastFile).toHaveBeenCalledWith(
        'last-123',
        expect.objectContaining(metadata)
      );
      expect(response.body).toHaveProperty('atlasFileId', 'atlas-123');
    });
    
    it('should return 400 if command is not completed', async () => {
      runnerService.getCommandStatus.mockResolvedValue({
        runId: 'run-123',
        status: 'processing'
      });
      
      const response = await request(app)
        .post('/api/commands/archive/run-123')
        .set('Authorization', `Bearer ${token}`)
        .send({ metadata: {} });
      
      expect(response.status).toBe(400);
      expect(archiveService.archiveLastFile).not.toHaveBeenCalled();
    });
    
    it('should return 404 if command not found', async () => {
      runnerService.getCommandStatus.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/api/commands/archive/nonexistent')
        .set('Authorization', `Bearer ${token}`)
        .send({ metadata: {} });
      
      expect(response.status).toBe(404);
    });
  });
});
