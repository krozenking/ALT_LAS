import { startOpenTelemetry } from "./utils/tracing"; // Import OpenTelemetry
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression"; // Import compression middleware
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import http from "http"; // Import http module
import { authenticateJWT } from "./middleware/authMiddleware";
import { routeAuthorization } from "./middleware/routeAuthMiddleware";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware"; // Use named import
import { requestLogger } from "./middleware/loggingMiddleware"; // Use named import
import { rateLimiter, cleanup as cleanupRateLimiter } from "./middleware/rateLimiter"; // Use named import and import cleanup
import { cleanup as cleanupSessionService } from "./services/sessionService"; // Import cleanup
import cacheMiddleware from "./middleware/cache";
import authRoutes from "./routes/authRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import commandRoutes from "./routes/commandRoutes"; // Import command routes
import fileRoutes from "./routes/fileRoutes"; // Import file routes
import userRoutes from "./routes/userRoutes"; // Import user routes
import passwordRoutes from "./routes/passwordRoutes"; // Import password routes
import sessionRoutes from "./routes/sessionRoutes"; // Import session routes
import loadRoutes from "./utils/routeLoader"; // Import dynamic route loader
import { setupMetrics, setupHealthCheck } from "./utils/monitoring"; // Import monitoring setup
import logger from "./utils/logger";
import { disconnectRedis } from "./utils/redisClient"; // Import Redis disconnect
import {
  segmentationServiceProxy,
  runnerServiceProxy,
  archiveServiceProxy,
  aiOrchestratorServiceProxy
} from "./middleware/proxyMiddleware";

// Start OpenTelemetry
startOpenTelemetry();

// Swagger/OpenAPI yapılandırması
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"));

// Express uygulaması
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware yapılandırması
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // İzin verilen originler
    const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];

    // Development modunda tüm originlere izin ver
    if (process.env.NODE_ENV === 'development' || !origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation: Origin not allowed'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
  exposedHeaders: ['Content-Length', 'X-Rate-Limit-Limit', 'X-Rate-Limit-Remaining', 'X-Rate-Limit-Reset'],
  credentials: true,
  maxAge: 86400, // 24 saat
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Gelişmiş Helmet yapılandırması
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"]
    }
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' },
  hsts: {
    maxAge: 31536000, // 1 yıl
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  expectCt: {
    enforce: true,
    maxAge: 86400 // 1 gün
  },
  dnsPrefetchControl: { allow: false }
}));

// Ek güvenlik başlıkları
app.use((req: Request, res: Response, next: NextFunction) => {
  // Cache kontrolü
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  // Ek XSS koruması
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Clickjacking koruması
  res.setHeader('X-Frame-Options', 'DENY');

  // MIME sniffing koruması
  res.setHeader('X-Content-Type-Options', 'nosniff');

  next();
});

app.use(compression()); // Add compression middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestLogger); // Use named import

// Gelişmiş rate limiter yapılandırması
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 dakika
  maxRequests: 100, // IP başına 15 dakikada 100 istek
  keyGenerator: function(req: Request): string {
    // Kullanıcı ID'si varsa ona göre, yoksa IP adresine göre limit
    const key = req.user?.id || req.ip || 'unknown';
    return String(key); // String'e dönüştürerek tip uyumluluğunu sağla
  },
  // Rate limit aşıldığında yanıt başlıklarını ayarla
  headers: true,
  // Rate limit aşıldığında özel mesaj
  message: {
    status: 429,
    message: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
    type: 'RateLimitError',
    retryAfter: 900 // 15 dakika (saniye cinsinden)
  },
  // Bazı rotaları rate limit'ten muaf tut
  skip: function(req: Request): boolean {
    // Sağlık kontrolü ve metrik endpoint'leri için rate limit uygulanmasın
    return req.path === '/health' || req.path === '/metrics';
  },
  // Rate limit aşıldığında loglama
  onLimitReached: function(req: Request): void {
    logger.warn(`Rate limit aşıldı: ${req.ip} - ${req.method} ${req.path}`);
  }
}));

// Setup Monitoring (Health Check & Metrics)
setupHealthCheck(app);
setupMetrics(app);

// API dokümantasyonu
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API rotaları
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/password", passwordRoutes); // Add password routes

// Load dynamic routes from modules
loadRoutes(app);

// Kimlik doğrulama ve yetkilendirme middleware'leri
app.use("/api/v1/segmentation", authenticateJWT);
app.use("/api/v1/runner", authenticateJWT);
app.use("/api/v1/archive", authenticateJWT);
app.use("/api/v1/ai", authenticateJWT);
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
app.use("/api/v1/ai", aiOrchestratorServiceProxy);

// Other non-proxied routes
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/commands", commandRoutes); // Use command routes
app.use("/api/v1/files", cacheMiddleware({
  duration: 60, // 60 saniye cache
  keyPrefix: "files",
  ignoreQueryParams: false,
  varyByUser: true, // Kullanıcıya göre farklı cache
  statusCodes: [200, 304] // 200 ve 304 yanıtlarını cache'le
}), fileRoutes); // Gelişmiş cache yapılandırması
app.use("/api/v1/users", userRoutes); // Use user routes
app.use("/api/v1/sessions", sessionRoutes); // Use session routes

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Endpoint bulunamadı" });
});

// Hata işleme middleware'i
app.use(errorHandler); // Use named import

let server: http.Server | null = null;

// Sunucuyu sadece test ortamı dışında başlat
if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, () => {
    logger.info(`API Gateway ${PORT} portunda çalışıyor`);
    logger.info(`API Dokümantasyonu: http://localhost:${PORT}/api-docs`);
  });
}

// Graceful shutdown function
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  if (server) {
    server.close(async (err) => {
      if (err) {
        logger.error("Error closing server:", err);
        process.exit(1);
      }
      logger.info("HTTP server closed.");

      cleanupRateLimiter();
      cleanupSessionService();
      await disconnectRedis();

      logger.info("Cleanup finished. Exiting.");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("Could not close connections in time, forcefully shutting down");
      process.exit(1);
    }, 10000);

  } else {
      cleanupRateLimiter();
      cleanupSessionService();
      await disconnectRedis();
      logger.info("Cleanup finished (no server running). Exiting.");
      process.exit(0);
  }
};

if (process.env.NODE_ENV !== "test") {
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

export default app;

