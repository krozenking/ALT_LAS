import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// Middleware ve utils
import logger from './utils/logger';
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/errorMiddleware';
import { requestLogger, responseTime, securityHeaders } from './middleware/loggingMiddleware';
import { rateLimiter } from './middleware/rateLimiter';
import { authenticateJWT, authorize } from './middleware/authMiddleware';

// Servisler
import * as authService from './services/authService';
import * as serviceDiscovery from './services/serviceDiscovery';

// Initialize express app
const app: Application = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(helmet()); // Güvenlik başlıkları
app.use(securityHeaders); // Ek güvenlik başlıkları
app.use(cors()); // CORS etkinleştir
app.use(express.json()); // JSON gövdelerini ayrıştır
app.use(express.urlencoded({ extended: true })); // URL-encoded gövdelerini ayrıştır
app.use(requestLogger); // HTTP istek loglama
app.use(responseTime); // Yanıt süresi ölçümü

// Rate limiter - tüm istekler için
app.use(rateLimiter({
  windowMs: 60 * 1000, // 1 dakika
  maxRequests: 100 // dakikada 100 istek
}));

// Swagger dokümantasyonu
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Test servisleri kaydet (geliştirme ortamı için)
if (process.env.NODE_ENV === 'development') {
  serviceDiscovery.register('segmentation-service', 'localhost', 3001, { version: '1.0.0' });
  serviceDiscovery.register('runner-service', 'localhost', 3002, { version: '1.0.0' });
  serviceDiscovery.register('archive-service', 'localhost', 3003, { version: '1.0.0' });
  logger.info('Test servisler kaydedildi');
}

// Kimlik doğrulama rotaları
app.post('/api/auth/register', asyncHandler(async (req: Request, res: Response) => {
  const { username, password, roles } = req.body;
  const user = await authService.register(username, password, roles);
  res.status(201).json(user);
}));

app.post('/api/auth/login', asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const result = await authService.login(username, password);
  res.json(result);
}));

// Servis keşif rotaları
app.get('/api/services', asyncHandler(async (req: Request, res: Response) => {
  const services = await serviceDiscovery.findAll();
  res.json(services);
}));

app.post('/api/services/register', asyncHandler(async (req: Request, res: Response) => {
  const { name, host, port, metadata } = req.body;
  const service = await serviceDiscovery.register(name, host, port, metadata);
  res.status(201).json(service);
}));

app.post('/api/services/:serviceId/heartbeat', asyncHandler(async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const service = await serviceDiscovery.heartbeat(serviceId);
  
  if (!service) {
    return res.status(404).json({ message: 'Servis bulunamadı' });
  }
  
  res.json(service);
}));

// Ana rotalar
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'ALT_LAS API Gateway\'e Hoş Geldiniz',
    documentation: '/api-docs',
    version: req.apiVersion || 'v1'
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'UP' });
});

// Korumalı servis rotaları
// Segmentation Service
app.post('/api/v1/segmentation', authenticateJWT, asyncHandler(async (req: Request, res: Response) => {
  try {
    // Segmentation Service'i bul
    const service = await serviceDiscovery.findOne('segmentation-service');
    
    if (!service) {
      return res.status(503).json({ message: 'Segmentation servisi kullanılamıyor' });
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
    logger.error('Segmentation servisinde hata:', error);
    throw error;
  }
}));

app.get('/api/v1/segmentation/:id', authenticateJWT, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Mock yanıt
  res.json({
    id,
    status: 'completed',
    altFile: `task_${id}.alt`
  });
}));

// Runner Service
app.post('/api/v1/runner', authenticateJWT, asyncHandler(async (req: Request, res: Response) => {
  try {
    // Runner Service'i bul
    const service = await serviceDiscovery.findOne('runner-service');
    
    if (!service) {
      return res.status(503).json({ message: 'Runner servisi kullanılamıyor' });
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
    logger.error('Runner servisinde hata:', error);
    throw error;
  }
}));

app.get('/api/v1/runner/:id', authenticateJWT, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Mock yanıt
  res.json({
    id,
    status: 'running',
    progress: Math.floor(Math.random() * 100),
    lastFile: Math.random() > 0.5 ? `result_${id}.last` : null
  });
}));

// Archive Service
app.post('/api/v1/archive', authenticateJWT, asyncHandler(async (req: Request, res: Response) => {
  try {
    // Archive Service'i bul
    const service = await serviceDiscovery.findOne('archive-service');
    
    if (!service) {
      return res.status(503).json({ message: 'Archive servisi kullanılamıyor' });
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
    logger.error('Archive servisinde hata:', error);
    throw error;
  }
}));

app.get('/api/v1/archive/:id', authenticateJWT, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Mock yanıt
  res.json({
    id,
    status: 'success',
    atlasId: `atlas_${id}`,
    successRate: Math.floor(Math.random() * 100)
  });
}));

// Hata işleme middleware'leri
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    logger.info(`API Gateway ${port} portunda çalışıyor`);
    logger.info(`Swagger dokümantasyonu http://localhost:${port}/api-docs adresinde kullanılabilir`);
  });
}

export default app; // Test için
