import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression'; // Import compression middleware
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import http from 'http'; // Import http module
import { authenticateJWT } from './middleware/authMiddleware';
import { routeAuthorization } from './middleware/routeAuthMiddleware';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware'; // Use named import
import { requestLogger } from './middleware/loggingMiddleware'; // Use named import
import { rateLimiter, cleanup as cleanupRateLimiter } from './middleware/rateLimiter'; // Use named import and import cleanup
import { cleanup as cleanupSessionService } from './services/sessionService'; // Import cleanup
import cacheMiddleware from './middleware/cache';
import authRoutes from './routes/authRoutes';
// Remove direct route imports for proxied services
// import segmentationRoutes from './routes/segmentationRoutes';
// import runnerRoutes from './routes/runnerRoutes';
// import archiveRoutes from './routes/archiveRoutes';
import serviceRoutes from "./routes/serviceRoutes";
import commandRoutes from "./routes/commandRoutes"; // Import command routes
import fileRoutes from "./routes/fileRoutes"; // Import file routes
import userRoutes from "./routes/userRoutes"; // Import user routes
import passwordRoutes from "./routes/passwordRoutes"; // Import password routes
import sessionRoutes from "./routes/sessionRoutes"; // Import session routes
import { setupMetrics, setupHealthCheck } from './utils/monitoring'; // Import monitoring setup
import logger from './utils/logger';
import { disconnectRedis } from './utils/redisClient'; // Import Redis disconnect
// Import proxy middlewares
import { 
  segmentationServiceProxy, 
  runnerServiceProxy, 
  archiveServiceProxy 
} from './middleware/proxyMiddleware';

// Swagger/OpenAPI yapılandırması
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Express uygulaması
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware yapılandırması
app.use(cors());
app.use(helmet());
app.use(compression()); // Add compression middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestLogger); // Use named import
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 100 })); // Use named import and provide options

// Setup Monitoring (Health Check & Metrics)
setupHealthCheck(app);
setupMetrics(app);

// API dokümantasyonu
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API rotaları
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/password', passwordRoutes); // Add password routes

// Kimlik doğrulama ve yetkilendirme middleware'leri
// Apply JWT auth to all protected routes, including proxied ones
app.use("/api/v1/segmentation", authenticateJWT);
app.use("/api/v1/runner", authenticateJWT);
app.use("/api/v1/archive", authenticateJWT);
app.use("/api/v1/services", authenticateJWT);
app.use("/api/v1/commands", authenticateJWT); // Add command routes with auth
app.use("/api/v1/files", authenticateJWT); // Add file routes with auth
app.use("/api/v1/users", authenticateJWT); // Apply JWT auth to user routes
app.use("/api/v1/sessions", authenticateJWT); // Apply JWT auth to session routes

// Route bazlı yetkilendirme (Apply after JWT auth, before proxy/routes)
app.use(routeAuthorization);

// Servis rotaları - Replace direct routes with proxies
app.use("/api/v1/segmentation", segmentationServiceProxy);
app.use("/api/v1/runner", runnerServiceProxy);
app.use("/api/v1/archive", archiveServiceProxy); // Apply proxy, caching can be handled within the service or re-evaluated

// Other non-proxied routes
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/commands", commandRoutes); // Use command routes
app.use("/api/v1/files", cacheMiddleware(30), fileRoutes); // Use file routes with 30-second cache for GET requests
app.use("/api/v1/users", userRoutes); // Use user routes
app.use("/api/v1/sessions", sessionRoutes); // Use session routes

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Endpoint bulunamadı' });
});

// Hata işleme middleware'i
app.use(errorHandler); // Use named import

let server: http.Server | null = null;

// Sunucuyu sadece test ortamı dışında başlat
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    logger.info(`API Gateway ${PORT} portunda çalışıyor`);
    logger.info(`API Dokümantasyonu: http://localhost:${PORT}/api-docs`);
  });
}

// Graceful shutdown function
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  // Stop accepting new connections
  if (server) {
    server.close(async (err) => {
      if (err) {
        logger.error('Error closing server:', err);
        process.exit(1);
      }
      logger.info('HTTP server closed.');
      
      // Cleanup intervals and connections
      cleanupRateLimiter();
      cleanupSessionService();
      await disconnectRedis();
      
      logger.info('Cleanup finished. Exiting.');
      process.exit(0);
    });

    // Force close server after a timeout
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000); // 10 seconds timeout

  } else {
      // If server wasn't started (e.g., in test env), just cleanup
      cleanupRateLimiter();
      cleanupSessionService();
      await disconnectRedis();
      logger.info('Cleanup finished (no server running). Exiting.');
      process.exit(0);
  }
};

// Listen for termination signals (except in test environment)
if (process.env.NODE_ENV !== 'test') {
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app; // Export app for testing purposes

