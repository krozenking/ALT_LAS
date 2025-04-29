/**
 * API Gateway için güncellenmiş index.js dosyası
 * 
 * Bu dosya, tüm yeni bileşenleri entegre eder ve API Gateway'i yapılandırır.
 * Token yenileme, çıkış işlemleri, gelişmiş servis keşfi ve performans izleme eklendi.
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

// Middleware ve servisler
const rateLimiter = require("./middleware/rateLimiter");
const apiVersioning = require("./middleware/apiVersioning");
const authenticateJWT = require("./middleware/authenticateJWT");
const authService = require("./services/authService");
// const serviceDiscovery = require("./services/serviceDiscovery"); // Eski servis keşfi yerine yenisi kullanılacak
const enhancedServiceDiscovery = require("./services/enhancedServiceDiscovery"); // Gelişmiş servis keşfi
const performanceMonitor = require("./services/performanceMonitor"); // Performans izleme

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(performanceMonitor.middleware()); // Performans izleme middleware'i (en başa eklenmeli)
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan("dev")); // Logging

// Rate limiter - tüm istekler için
app.use(rateLimiter({
  windowMs: 60 * 1000, // 1 dakika
  maxRequests: 100 // dakikada 100 istek
}));

// API versiyonlama
app.use(apiVersioning({
  defaultVersion: "v1",
  supportedVersions: ["v1"]
}));

// Swagger dokümantasyonu
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Test servisleri kaydet (geliştirme ortamı için)
if (process.env.NODE_ENV === "development") {
  enhancedServiceDiscovery.register("segmentation-service", "localhost", 3001, { version: "1.0.0" });
  enhancedServiceDiscovery.register("runner-service", "localhost", 3002, { version: "1.0.0" });
  enhancedServiceDiscovery.register("archive-service", "localhost", 3003, { version: "1.0.0" });
  console.log("Test services registered with health checks");
}

// Kimlik doğrulama rotaları
app.post("/api/auth/register", (req, res) => {
  try {
    const { username, password, roles } = req.body;
    const user = authService.register(username, password, roles || ["user"]);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;
    const result = authService.login(username, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

app.post("/api/auth/refresh", (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }
    const result = authService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }
    const success = authService.logout(refreshToken);
    if (success) {
      res.status(200).json({ message: "Successfully logged out" });
    } else {
      res.status(200).json({ message: "Logout processed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
});

// Servis keşif ve durum rotaları (Admin erişimi)
app.get("/api/services", authenticateJWT, authService.authorize(["admin"]), (req, res) => {
  const services = enhancedServiceDiscovery.findAll();
  res.json(services);
});

app.get("/api/status", authenticateJWT, authService.authorize(["admin"]), (req, res) => {
  const healthStatus = enhancedServiceDiscovery.getHealthStatus();
  res.json(healthStatus);
});

app.post("/api/services/register", authenticateJWT, authService.authorize(["admin"]), (req, res) => {
  try {
    const { name, host, port, metadata, healthCheckOptions } = req.body;
    const service = enhancedServiceDiscovery.register(name, host, port, metadata, healthCheckOptions);
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Not: Heartbeat endpoint'i kaldırıldı, sağlık kontrolü bu işlevi görüyor.
// app.post("/api/services/:serviceId/heartbeat", ... );

// Performans Metrikleri Rotaları (Admin erişimi)
app.get("/api/metrics", authenticateJWT, authService.authorize(["admin"]), (req, res) => {
  const metrics = performanceMonitor.getMetrics();
  res.json(metrics);
});

app.get("/api/metrics/summary", authenticateJWT, authService.authorize(["admin"]), (req, res) => {
  const summary = performanceMonitor.getSummary();
  res.json(summary);
});

// Ana rotalar
app.get("/", (req, res) => {
  res.json({ 
    message: "Welcome to ALT_LAS API Gateway",
    documentation: "/api-docs",
    version: req.apiVersion || "v1"
  });
});

// Health check endpoint (API Gateway'in kendi sağlığı)
app.get("/health", (req, res) => {
  // Daha kapsamlı bir sağlık kontrolü eklenebilir (örn: veritabanı bağlantısı)
  res.json({ status: "UP" });
});

// Korumalı servis rotaları (Tüm doğrulanmış kullanıcılar erişebilir)
// Mikroservislere yönlendirme yaparken gelişmiş servis keşfini kullan

// Segmentation Service
app.post("/api/v1/segmentation", authenticateJWT, async (req, res) => {
  try {
    const service = enhancedServiceDiscovery.findOneHealthy("segmentation-service");
    if (!service) {
      performanceMonitor.recordServiceDiscovery("failure");
      return res.status(503).json({ message: "Segmentation service unavailable or unhealthy" });
    }
    performanceMonitor.recordServiceDiscovery("request", service);
    
    // Gerçek uygulamada, burada HTTP isteği yapılır (axios kullanarak)
    // const response = await axios.post(`${service.url}/segment`, req.body);
    // res.json(response.data);

    // Şimdilik mock yanıt döndürüyoruz
    const mockResponse = {
      id: Math.random().toString(36).substring(7),
      status: "success",
      altFile: `task_${Date.now()}.alt`,
      metadata: {
        timestamp: new Date().toISOString(),
        mode: req.body.mode || "Normal",
        persona: req.body.persona || "technical_expert",
        userId: req.user.sub
      }
    };
    res.json(mockResponse);
  } catch (error) {
    console.error("Error proxying to segmentation service:", error);
    res.status(500).json({ message: "Segmentation service proxy error", error: error.message });
  }
});

app.get("/api/v1/segmentation/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const service = enhancedServiceDiscovery.findOneHealthy("segmentation-service");
    if (!service) {
      performanceMonitor.recordServiceDiscovery("failure");
      return res.status(503).json({ message: "Segmentation service unavailable or unhealthy" });
    }
    performanceMonitor.recordServiceDiscovery("request", service);
    
    // Gerçek uygulamada: await axios.get(`${service.url}/segment/${id}`);
    // Mock yanıt
    res.json({
      id,
      status: "completed",
      altFile: `task_${id}.alt`
    });
  } catch (error) {
     console.error("Error proxying to segmentation service:", error);
     res.status(500).json({ message: "Segmentation service proxy error", error: error.message });
  }
});

// Runner Service
app.post("/api/v1/runner", authenticateJWT, async (req, res) => {
  try {
    const service = enhancedServiceDiscovery.findOneHealthy("runner-service");
    if (!service) {
      performanceMonitor.recordServiceDiscovery("failure");
      return res.status(503).json({ message: "Runner service unavailable or unhealthy" });
    }
    performanceMonitor.recordServiceDiscovery("request", service);

    // Gerçek uygulamada: await axios.post(`${service.url}/run`, req.body);
    // Mock yanıt
    const mockResponse = {
      id: Math.random().toString(36).substring(7),
      status: "running",
      progress: 0,
      lastFile: null,
      metadata: { userId: req.user.sub }
    };
    res.json(mockResponse);
  } catch (error) {
    console.error("Error proxying to runner service:", error);
    res.status(500).json({ message: "Runner service proxy error", error: error.message });
  }
});

app.get("/api/v1/runner/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
   try {
    const service = enhancedServiceDiscovery.findOneHealthy("runner-service");
    if (!service) {
      performanceMonitor.recordServiceDiscovery("failure");
      return res.status(503).json({ message: "Runner service unavailable or unhealthy" });
    }
    performanceMonitor.recordServiceDiscovery("request", service);

    // Gerçek uygulamada: await axios.get(`${service.url}/run/${id}`);
    // Mock yanıt
    res.json({
      id,
      status: "running",
      progress: Math.floor(Math.random() * 100),
      lastFile: Math.random() > 0.5 ? `result_${id}.last` : null
    });
  } catch (error) {
     console.error("Error proxying to runner service:", error);
     res.status(500).json({ message: "Runner service proxy error", error: error.message });
  }
});

// Archive Service
app.post("/api/v1/archive", authenticateJWT, async (req, res) => {
  try {
    const service = enhancedServiceDiscovery.findOneHealthy("archive-service");
    if (!service) {
      performanceMonitor.recordServiceDiscovery("failure");
      return res.status(503).json({ message: "Archive service unavailable or unhealthy" });
    }
    performanceMonitor.recordServiceDiscovery("request", service);

    // Gerçek uygulamada: await axios.post(`${service.url}/archive`, req.body);
    // Mock yanıt
    const mockResponse = {
      id: Math.random().toString(36).substring(7),
      status: "success",
      atlasId: `atlas_${Date.now()}`,
      successRate: Math.floor(Math.random() * 100),
      metadata: { userId: req.user.sub }
    };
    res.json(mockResponse);
  } catch (error) {
    console.error("Error proxying to archive service:", error);
    res.status(500).json({ message: "Archive service proxy error", error: error.message });
  }
});

app.get("/api/v1/archive/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const service = enhancedServiceDiscovery.findOneHealthy("archive-service");
    if (!service) {
      performanceMonitor.recordServiceDiscovery("failure");
      return res.status(503).json({ message: "Archive service unavailable or unhealthy" });
    }
    performanceMonitor.recordServiceDiscovery("request", service);

    // Gerçek uygulamada: await axios.get(`${service.url}/archive/${id}`);
    // Mock yanıt
    res.json({
      id,
      status: "success",
      atlasId: `atlas_${id}`,
      successRate: Math.floor(Math.random() * 100)
    });
  } catch (error) {
     console.error("Error proxying to archive service:", error);
     res.status(500).json({ message: "Archive service proxy error", error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Performans izleyiciye hata kaydı ekle (opsiyonel)
  // performanceMonitor.recordError(err);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
    console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
    console.log(`Metrics available at http://localhost:${port}/api/metrics (Admin only)`);
    console.log(`Service status available at http://localhost:${port}/api/status (Admin only)`);
  });
}

module.exports = app; // For testing

