/**
 * API Gateway için test dosyası
 * 
 * Bu dosya, API Gateway bileşenlerinin temel testlerini içerir.
 */

const request = require('supertest');
const app = require('../src/index');
const authService = require('../src/services/authService');
const serviceDiscovery = require('../src/services/serviceDiscovery');

// Test kullanıcısı oluştur
let testToken;
try {
  authService.register('testuser', 'password123', ['user']);
  const loginResult = authService.login('testuser', 'password123');
  testToken = loginResult.token;
} catch (error) {
  console.error('Test kullanıcısı oluşturma hatası:', error.message);
}

describe('API Gateway Tests', () => {
  // Ana sayfa testi
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
    });
  });

  // Sağlık kontrolü testi
  describe('GET /health', () => {
    it('should return UP status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'UP');
    });
  });

  // Kimlik doğrulama testleri
  describe('Authentication', () => {
    it('should return 401 for protected routes without token', async () => {
      const res = await request(app).get('/api/v1/segmentation/123');
      expect(res.statusCode).toEqual(401);
    });

    it('should access protected routes with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/segmentation/123')
        .set('Authorization', `Bearer ${testToken}`);
      
      // Not: Bu test, mock yanıtlar nedeniyle 200 dönebilir
      // Gerçek servislerin olmadığı durumda 404 veya başka bir hata da dönebilir
      expect(res.statusCode).not.toEqual(401);
    });
  });

  // Rate limiter testi
  describe('Rate Limiter', () => {
    it('should include rate limit headers', async () => {
      const res = await request(app).get('/');
      expect(res.headers).toHaveProperty('x-ratelimit-limit');
      expect(res.headers).toHaveProperty('x-ratelimit-remaining');
      expect(res.headers).toHaveProperty('x-ratelimit-reset');
    });
  });

  // API versiyonlama testi
  describe('API Versioning', () => {
    it('should include API version header', async () => {
      const res = await request(app).get('/api/v1/segmentation/123');
      expect(res.headers).toHaveProperty('x-api-version');
    });

    it('should redirect to default version if not specified', async () => {
      const res = await request(app).get('/api/segmentation/123');
      expect(res.statusCode).toEqual(307); // Temporary redirect
      expect(res.headers.location).toContain('/api/v1/');
    });
  });

  // Servis keşif testi
  describe('Service Discovery', () => {
    beforeAll(() => {
      // Test servisi kaydet
      serviceDiscovery.register('test-service', 'localhost', 8080, { version: '1.0.0' });
    });

    it('should register and find services', () => {
      const services = serviceDiscovery.findByName('test-service');
      expect(services.length).toBeGreaterThan(0);
      expect(services[0]).toHaveProperty('name', 'test-service');
      expect(services[0]).toHaveProperty('host', 'localhost');
      expect(services[0]).toHaveProperty('port', 8080);
    });

    it('should find one service with load balancing', () => {
      const service = serviceDiscovery.findOne('test-service');
      expect(service).not.toBeNull();
      expect(service).toHaveProperty('name', 'test-service');
    });

    afterAll(() => {
      // Test servisini temizle
      const serviceId = Object.keys(serviceDiscovery.services).find(
        id => serviceDiscovery.services[id].name === 'test-service'
      );
      if (serviceId) {
        serviceDiscovery.deregister(serviceId);
      }
    });
  });
});
