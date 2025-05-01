import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { authenticateJWT } from './middleware/authMiddleware';
import { routeAuthorization } from './middleware/routeAuthMiddleware';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware'; // Use named import
import { requestLogger } from './middleware/loggingMiddleware'; // Use named import
import { rateLimiter } from './middleware/rateLimiter'; // Use named import
import authRoutes from './routes/authRoutes';
import segmentationRoutes from './routes/segmentationRoutes';
import runnerRoutes from './routes/runnerRoutes';
import archiveRoutes from './routes/archiveRoutes';
import serviceRoutes from "./routes/serviceRoutes";
import commandRoutes from "./routes/commandRoutes"; // Import command routes
import fileRoutes from "./routes/files"; // Import file routes
// import healthRoutes from "./routes/healthRoutes"; // Removed, handled by setupHealthCheck
import { setupMetrics, setupHealthCheck } from './utils/monitoring'; // Import monitoring setup
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
app.use(requestLogger); // Use named import
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 100 })); // Use named import and provide options

// Setup Monitoring (Health Check & Metrics)
setupHealthCheck(app);
setupMetrics(app);

// API dokümantasyonu
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Sağlık kontrolü endpoint'i - Handled by setupHealthCheck
// app.use("/health", healthRoutes);

// API rotaları
app.use('/api/auth', authRoutes);

// Kimlik doğrulama ve yetkilendirme middleware'leri
// Tüm korumalı rotalar için JWT doğrulama
app.use('/api/segmentation', authenticateJWT);
app.use('/api/runner', authenticateJWT);
app.use('/api/archive', authenticateJWT);
app.use("/api/services", authenticateJWT);
app.use("/api/commands", authenticateJWT); // Add command routes with auth
app.use("/api/files", authenticateJWT); // Add file routes with auth

// Route bazlı yetkilendirme
app.use(routeAuthorization);

// Servis rotaları
app.use('/api/segmentation', segmentationRoutes);
app.use('/api/runner', runnerRoutes);
app.use("/api/archive", archiveRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/commands", commandRoutes); // Use command routes
app.use("/api/files", fileRoutes); // Use file routes

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Endpoint bulunamadı' });
});

// Hata işleme middleware'i
app.use(errorHandler); // Use named import

// Sunucuyu başlat
app.listen(PORT, () => {
  logger.info(`API Gateway ${PORT} portunda çalışıyor`);
  logger.info(`API Dokümantasyonu: http://localhost:${PORT}/api-docs`);
});

export default app;
