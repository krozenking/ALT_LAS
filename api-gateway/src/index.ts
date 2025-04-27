import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { authenticateJWT } from './middleware/authMiddleware';
import { routeAuthorization } from './middleware/routeAuthMiddleware';
import errorMiddleware from './middleware/errorMiddleware';
import loggingMiddleware from './middleware/loggingMiddleware';
import rateLimiter from './middleware/rateLimiter';
import authRoutes from './routes/authRoutes';
import segmentationRoutes from './routes/segmentationRoutes';
import runnerRoutes from './routes/runnerRoutes';
import archiveRoutes from './routes/archiveRoutes';
import serviceRoutes from './routes/serviceRoutes';
import healthRoutes from './routes/healthRoutes'; // Added health routes
import logger from './utils/logger';

// Swagger/OpenAPI yapılandırması
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Express uygulaması
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware yapılandırması
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);
app.use(rateLimiter);

// API dokümantasyonu
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Sağlık kontrolü endpoint'i
app.use("/health", healthRoutes);

// API rotaları
app.use('/api/auth', authRoutes);

// Kimlik doğrulama ve yetkilendirme middleware'leri
// Tüm korumalı rotalar için JWT doğrulama
app.use('/api/segmentation', authenticateJWT);
app.use('/api/runner', authenticateJWT);
app.use('/api/archive', authenticateJWT);
app.use('/api/services', authenticateJWT);

// Route bazlı yetkilendirme
app.use(routeAuthorization);

// Servis rotaları
app.use('/api/segmentation', segmentationRoutes);
app.use('/api/runner', runnerRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/services', serviceRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Endpoint bulunamadı' });
});

// Hata işleme middleware'i
app.use(errorMiddleware);

// Sunucuyu başlat
app.listen(PORT, () => {
  logger.info(`API Gateway ${PORT} portunda çalışıyor`);
  logger.info(`API Dokümantasyonu: http://localhost:${PORT}/api-docs`);
});

export default app;
