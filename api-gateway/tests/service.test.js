const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/index');
const { segmentationService, runnerService, archiveService } = require('../src/services/serviceIntegration');
const Redis = require('ioredis');

// Mock service integration and Redis
jest.mock('../src/services/serviceIntegration');
jest.mock('ioredis');

describe('Service Integration', () => {
  let token;
  
  beforeEach(() => {
    // Mock token for authenticated routes
    token = jwt.sign({ 
      userId: '123', 
      roles: ['admin'], 
      permissions: ['read:services', 'write:services'] 
    }, 'default_jwt_secret_change_in_production');
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Service Discovery', () => {
    describe('GET /api/services', () => {
      it('should list all services', async () => {
        const mockServices = [
          { id: 'segmentation-1', name: 'Segmentation Service', url: 'http://segmentation:3001', status: 'up' },
          { id: 'runner-1', name: 'Runner Service', url: 'http://runner:3002', status: 'up' },
          { id: 'archive-1', name: 'Archive Service', url: 'http://archive:3003', status: 'up' }
        ];
        
        // Mock implementation for the test
        const mockServiceRegistry = {
          getAllServices: jest.fn().mockReturnValue(mockServices)
        };
        
        // Temporarily replace the actual implementation
        const originalRegistry = app.locals.serviceRegistry;
        app.locals.serviceRegistry = mockServiceRegistry;
        
        const response = await request(app)
          .get('/api/services')
          .set('Authorization', `Bearer ${token}`);
        
        // Restore the original implementation
        app.locals.serviceRegistry = originalRegistry;
        
        expect(response.status).toBe(200);
        expect(mockServiceRegistry.getAllServices).toHaveBeenCalled();
        expect(response.body).toEqual(mockServices);
      });
      
      it('should return 401 if not authenticated', async () => {
        const response = await request(app)
          .get('/api/services');
        
        expect(response.status).toBe(401);
      });
    });

    describe('POST /api/services', () => {
      it('should register a new service', async () => {
        const serviceData = {
          id: 'test-service-1',
          name: 'Test Service',
          url: 'http://test-service:4000',
          status: 'up',
          metadata: { version: '1.0.0' }
        };
        
        // Mock implementation for the test
        const mockServiceRegistry = {
          registerService: jest.fn().mockReturnValue(serviceData)
        };
        
        // Temporarily replace the actual implementation
        const originalRegistry = app.locals.serviceRegistry;
        app.locals.serviceRegistry = mockServiceRegistry;
        
        const response = await request(app)
          .post('/api/services')
          .set('Authorization', `Bearer ${token}`)
          .send(serviceData);
        
        // Restore the original implementation
        app.locals.serviceRegistry = originalRegistry;
        
        expect(response.status).toBe(201);
        expect(mockServiceRegistry.registerService).toHaveBeenCalledWith(serviceData);
        expect(response.body).toEqual(serviceData);
      });
      
      it('should return 400 if required fields are missing', async () => {
        const response = await request(app)
          .post('/api/services')
          .set('Authorization', `Bearer ${token}`)
          .send({ name: 'Test Service' });
        
        expect(response.status).toBe(400);
      });
    });
  });

  describe('Health Checks', () => {
    describe('GET /api/health', () => {
      it('should return basic health status without authentication', async () => {
        const response = await request(app)
          .get('/api/health');
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'UP');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('service', 'api-gateway');
      });
    });

    describe('GET /api/health/details', () => {
      it('should return detailed health status', async () => {
        // Mock service health checks
        segmentationService.checkHealth.mockResolvedValue(true);
        runnerService.checkHealth.mockResolvedValue(true);
        archiveService.checkHealth.mockResolvedValue(true);
        
        segmentationService.getStatus.mockReturnValue({
          serviceName: 'SegmentationService',
          circuitState: 'CLOSED'
        });
        
        runnerService.getStatus.mockReturnValue({
          serviceName: 'RunnerService',
          circuitState: 'CLOSED'
        });
        
        archiveService.getStatus.mockReturnValue({
          serviceName: 'ArchiveService',
          circuitState: 'CLOSED'
        });
        
        const response = await request(app)
          .get('/api/health/details')
          .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'UP');
        expect(response.body).toHaveProperty('services');
        expect(response.body).toHaveProperty('system');
        expect(response.body).toHaveProperty('circuitBreakers');
        
        expect(response.body.services).toHaveProperty('api_gateway');
        expect(response.body.services).toHaveProperty('segmentation_service');
        expect(response.body.services).toHaveProperty('runner_service');
        expect(response.body.services).toHaveProperty('archive_service');
        
        expect(segmentationService.checkHealth).toHaveBeenCalled();
        expect(runnerService.checkHealth).toHaveBeenCalled();
        expect(archiveService.checkHealth).toHaveBeenCalled();
      });
      
      it('should handle service unavailability', async () => {
        // Mock service health checks
        segmentationService.checkHealth.mockRejectedValue(new Error('Service unavailable'));
        runnerService.checkHealth.mockResolvedValue(false);
        archiveService.checkHealth.mockResolvedValue(true);
        
        const response = await request(app)
          .get('/api/health/details')
          .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'DEGRADED');
        expect(response.body.services.segmentation_service).toHaveProperty('status', 'DOWN');
        expect(response.body.services.runner_service).toHaveProperty('status', 'DOWN');
        expect(response.body.services.archive_service).toHaveProperty('status', 'UP');
      });
    });
  });

  describe('Cache Management', () => {
    let mockRedisClient;
    
    beforeEach(() => {
      // Mock Redis client
      mockRedisClient = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        ttl: jest.fn(),
        expire: jest.fn(),
        exists: jest.fn(),
        keys: jest.fn(),
        flushall: jest.fn()
      };
      
      // Replace Redis client in app
      Redis.mockImplementation(() => mockRedisClient);
    });
    
    describe('GET /api/cache/:key', () => {
      it('should get cached value', async () => {
        const key = 'test-key';
        const value = JSON.stringify({ data: 'test-value' });
        
        mockRedisClient.get.mockResolvedValue(value);
        
        const response = await request(app)
          .get(`/api/cache/${key}`)
          .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(mockRedisClient.get).toHaveBeenCalledWith(key);
        expect(response.body).toEqual({ data: 'test-value' });
      });
      
      it('should return 404 if key not found', async () => {
        mockRedisClient.get.mockResolvedValue(null);
        
        const response = await request(app)
          .get('/api/cache/nonexistent')
          .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(404);
      });
    });
    
    describe('PUT /api/cache/:key', () => {
      it('should set cache value without TTL', async () => {
        const key = 'test-key';
        const value = { data: 'test-value' };
        
        mockRedisClient.set.mockResolvedValue('OK');
        
        const response = await request(app)
          .put(`/api/cache/${key}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ value });
        
        expect(response.status).toBe(200);
        expect(mockRedisClient.set).toHaveBeenCalledWith(
          key,
          JSON.stringify(value)
        );
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('key', key);
      });
      
      it('should set cache value with TTL', async () => {
        const key = 'test-key';
        const value = { data: 'test-value' };
        const ttl = 60;
        
        mockRedisClient.set.mockResolvedValue('OK');
        
        const response = await request(app)
          .put(`/api/cache/${key}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ value, ttl });
        
        expect(response.status).toBe(200);
        expect(mockRedisClient.set).toHaveBeenCalledWith(
          key,
          JSON.stringify(value),
          'EX',
          ttl
        );
        expect(response.body).toHaveProperty('ttl', ttl);
      });
    });
    
    describe('DELETE /api/cache/:key', () => {
      it('should delete cache key', async () => {
        const key = 'test-key';
        
        mockRedisClient.del.mockResolvedValue(1);
        
        const response = await request(app)
          .delete(`/api/cache/${key}`)
          .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(mockRedisClient.del).toHaveBeenCalledWith(key);
        expect(response.body).toHaveProperty('deleted', true);
      });
      
      it('should handle non-existent key', async () => {
        mockRedisClient.del.mockResolvedValue(0);
        
        const response = await request(app)
          .delete('/api/cache/nonexistent')
          .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('deleted', false);
      });
    });
  });

  describe('API Versioning', () => {
    let mockRedisClient;
    
    beforeEach(() => {
      // Mock Redis client
      mockRedisClient = {
        get: jest.fn(),
        set: jest.fn()
      };
      
      // Replace Redis client in app
      Redis.mockImplementation(() => mockRedisClient);
    });
    
    describe('GET /api/versions', () => {
      it('should list API versions from cache', async () => {
        const mockVersions = [
          { version: 'v1', status: 'stable' },
          { version: 'v2', status: 'beta' }
        ];
        
        mockRedisClient.get.mockResolvedValue(JSON.stringify(mockVersions));
        
        const response = await request(app)
          .get('/api/versions')
          .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(mockRedisClient.get).toHaveBeenCalledWith('api:versions');
        expect(response.body).toEqual(mockVersions);
      });
      
      it('should list API versions and cache them if not in cache', async () => {
        mockRedisClient.get.mockResolvedValue(null);
        mockRedisClient.set.mockResolvedValue('OK');
        
        const response = await request(app)
          .get('/api/versions')
          .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(mockRedisClient.get).toHaveBeenCalledWith('api:versions');
        expect(mockRedisClient.set).toHaveBeenCalled();
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });
    });
    
    describe('GET /api/versions/:version/status', () => {
      it('should get version status', async () => {
        mockRedisClient.get.mockResolvedValue(null);
        mockRedisClient.set.mockResolvedValue('OK');
        
        const response = await request(app)
          .get('/api/versions/v1/status')
          .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('version', 'v1');
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('uptime');
      });
      
      it('should return 404 for invalid version', async () => {
        const response = await request(app)
          .get('/api/versions/v999/status')
          .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(404);
      });
    });
  });
});
