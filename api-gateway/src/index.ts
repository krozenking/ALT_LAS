import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

// Middleware ve utils
import logger from './utils/logger';
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/errorMiddleware';
import { requestLogger, responseTime, securityHeaders } from './middleware/loggingMiddleware';
import { rateLimiter } from './middleware/rateLimiter';
import { setupSwagger } from './utils/swagger';

// Routes
import authRoutes from './routes/authRoutes';
import serviceRoutes from './routes/serviceRoutes';
import segmentationRoutes from './routes/segmentationRoutes';
import runnerRoutes from './routes/runnerRoutes';
import archiveRoutes from './routes/archiveRoutes';

// Initialize express app
const app: Express = express();
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
const swaggerService = setupSwagger(app, path.join(__dirname, '../swagger.yaml'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/v1/segmentation', segmentationRoutes);
app.use('/api/v1/runner', runnerRoutes);
app.use('/api/v1/archive', archiveRoutes);

// Ana rotalar
app.get('/', (req, res) => {
  res.json({ 
    message: 'ALT_LAS API Gateway\'e Hoş Geldiniz',
    documentation: '/api-docs',
    version: req.apiVersion || 'v1'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

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
