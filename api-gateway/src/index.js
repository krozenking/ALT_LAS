/**
 * API Gateway için güncellenmiş index.js dosyası
 * 
 * Bu dosya, tüm yeni bileşenleri entegre eder ve API Gateway'i yapılandırır.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Middleware ve servisler
const rateLimiter = require('./middleware/rateLimiter');
const apiVersioning = require('./middleware/apiVersioning');
const authenticateJWT = require('./middleware/authenticateJWT');
const authService = require('./services/authService');
const serviceDiscovery = require('./services/serviceDiscovery');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Logging

// Rate limiter - tüm istekler için
app.use(rateLimiter({
  windowMs: 60 * 1000, // 1 dakika
  maxRequests: 100 // dakikada 100 istek
}));

// API versiyonlama
app.use(apiVersioning({
  defaultVersion: 'v1',
  supportedVersions: ['v1']
}));

// Swagger dokümantasyonu
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Test servisleri kaydet (geliştirme ortamı için)
if (process.env.NODE_ENV === 'development') {
  serviceDiscovery.register('segmentation-service', 'localhost', 3001, { version: '1.0.0' });
  serviceDiscovery.register('runner-service', 'localhost', 3002, { version: '1.0.0' });
  serviceDiscovery.register('archive-service', 'localhost', 3003, { version: '1.0.0' });
  console.log('Test services registered');
}

// Kimlik doğrulama rotaları
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, password, roles } = req.body;
    const user = authService.register(username, password, roles);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const result = authService.login(username, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Servis keşif rotaları
app.get('/api/services', (req, res) => {
  const services = serviceDiscovery.findAll();
  res.json(services);
});

app.post('/api/services/register', (req, res) => {
  try {
    const { name, host, port, metadata } = req.body;
    const service = serviceDiscovery.register(name, host, port, metadata);
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/services/:serviceId/heartbeat', (req, res) => {
  const { serviceId } = req.params;
  const service = serviceDiscovery.heartbeat(serviceId);
  
  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }
  
  res.json(service);
});

// Ana rotalar
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to ALT_LAS API Gateway',
    documentation: '/api-docs',
    version: req.apiVersion || 'v1'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

// Korumalı servis rotaları
// Segmentation Service
app.post('/api/v1/segmentation', authenticateJWT, (req, res) => {
  try {
    // Segmentation Service'i bul
    const service = serviceDiscovery.findOne('segmentation-service');
    
    if (!service) {
      return res.status(503).json({ message: 'Segmentation service unavailable' });
    }
    
    // Gerçek uygulamada, burada HTTP isteği yapılır
    // Şimdilik mock yanıt döndürüyoruz
    const mockResponse = {
      id: Math.random().toString(36).substring(7),
      status: 'success',
      altFile: `task_${Date.now()}.alt`,
      metadata: {
        timestamp: new Date().toISOString(),
        mode: req.body.mode || 'Normal',
        persona: req.body.persona || 'technical_expert'
      }
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('Error in segmentation service:', error);
    res.status(500).json({ message: 'Segmentation service error', error: error.message });
  }
});

app.get('/api/v1/segmentation/:id', authenticateJWT, (req, res) => {
  const { id } = req.params;
  
  // Mock yanıt
  res.json({
    id,
    status: 'completed',
    altFile: `task_${id}.alt`
  });
});

// Runner Service
app.post('/api/v1/runner', authenticateJWT, (req, res) => {
  try {
    // Runner Service'i bul
    const service = serviceDiscovery.findOne('runner-service');
    
    if (!service) {
      return res.status(503).json({ message: 'Runner service unavailable' });
    }
    
    // Mock yanıt
    const mockResponse = {
      id: Math.random().toString(36).substring(7),
      status: 'running',
      progress: 0,
      lastFile: null
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('Error in runner service:', error);
    res.status(500).json({ message: 'Runner service error', error: error.message });
  }
});

app.get('/api/v1/runner/:id', authenticateJWT, (req, res) => {
  const { id } = req.params;
  
  // Mock yanıt
  res.json({
    id,
    status: 'running',
    progress: Math.floor(Math.random() * 100),
    lastFile: Math.random() > 0.5 ? `result_${id}.last` : null
  });
});

// Archive Service
app.post('/api/v1/archive', authenticateJWT, (req, res) => {
  try {
    // Archive Service'i bul
    const service = serviceDiscovery.findOne('archive-service');
    
    if (!service) {
      return res.status(503).json({ message: 'Archive service unavailable' });
    }
    
    // Mock yanıt
    const mockResponse = {
      id: Math.random().toString(36).substring(7),
      status: 'success',
      atlasId: `atlas_${Date.now()}`,
      successRate: Math.floor(Math.random() * 100)
    };
    
    res.json(mockResponse);
  } catch (error) {
    console.error('Error in archive service:', error);
    res.status(500).json({ message: 'Archive service error', error: error.message });
  }
});

app.get('/api/v1/archive/:id', authenticateJWT, (req, res) => {
  const { id } = req.params;
  
  // Mock yanıt
  res.json({
    id,
    status: 'success',
    atlasId: `atlas_${id}`,
    successRate: Math.floor(Math.random() * 100)
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
    console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
  });
}

module.exports = app; // For testing
