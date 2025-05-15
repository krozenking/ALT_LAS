import { Request, Response, NextFunction, Express } from "express";
import client from "prom-client";
import responseTime from "response-time";
import logger from "./logger";

// Global fonksiyonlar için tip tanımları
declare global {
  var updateCircuitBreakerMetrics: (service: string, state: string, trips?: number) => void;
  var updateProxyMetrics: (method: string, service: string, status: string, duration: number) => void;
}

// Critical Error Counter
export const criticalErrorCounter = new client.Counter({
  name: "critical_errors_total",
  help: "Total number of critical errors (e.g., 5xx)",
  labelNames: ["error_type", "route"], // Optional labels like error type or route
});

// Error Rate Gauge
export const errorRateGauge = new client.Gauge({
  name: "api_gateway_error_rate",
  help: "Error rate by type, route and method",
  labelNames: ["error_type", "route", "method"]
});

// Request Duration by Error Type
export const errorRequestDuration = new client.Histogram({
  name: "api_gateway_error_request_duration_ms",
  help: "Duration of requests that resulted in errors",
  labelNames: ["error_type", "route", "method"],
  buckets: [10, 50, 100, 200, 500, 1000, 2500, 5000, 10000]
});

/**
 * Prometheus Metrics Configuration
 */
export const setupMetrics = (app: Express) => {
  // Enable default metrics collection (CPU, memory, etc.)
  client.collectDefaultMetrics({
    prefix: 'api_gateway_',
    labels: {
      app: 'alt_las_api_gateway',
      environment: process.env.NODE_ENV || 'development'
    }
  });

  // HTTP Request Duration Histogram
  const httpRequestDurationMicroseconds = new client.Histogram({
    name: "api_gateway_http_request_duration_ms",
    help: "Duration of HTTP requests in ms",
    labelNames: ["method", "route", "code", "service"],
    buckets: [10, 50, 100, 200, 500, 1000, 2500, 5000, 10000] // Daha detaylı buckets
  });

  // HTTP Request Counter
  const httpRequestCounter = new client.Counter({
    name: "api_gateway_http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "code", "service"]
  });

  // HTTP Error Counter
  const httpErrorCounter = new client.Counter({
    name: "api_gateway_http_errors_total",
    help: "Total number of HTTP errors",
    labelNames: ["method", "route", "code", "error_type", "service"]
  });

  // Cache Metrics
  const cacheHitCounter = new client.Counter({
    name: "api_gateway_cache_hits_total",
    help: "Total number of cache hits",
    labelNames: ["route", "service"]
  });

  const cacheMissCounter = new client.Counter({
    name: "api_gateway_cache_misses_total",
    help: "Total number of cache misses",
    labelNames: ["route", "service"]
  });

  // Proxy Metrics
  const proxyRequestCounter = new client.Counter({
    name: "api_gateway_proxy_requests_total",
    help: "Total number of proxy requests",
    labelNames: ["method", "service", "status"]
  });

  const proxyRequestDuration = new client.Histogram({
    name: "api_gateway_proxy_request_duration_ms",
    help: "Duration of proxy requests in ms",
    labelNames: ["method", "service", "status"],
    buckets: [10, 50, 100, 200, 500, 1000, 2500, 5000, 10000]
  });

  // Circuit Breaker Metrics
  const circuitBreakerStateGauge = new client.Gauge({
    name: "api_gateway_circuit_breaker_state",
    help: "Circuit breaker state (0=closed, 1=open, 0.5=half-open)",
    labelNames: ["service"]
  });

  const circuitBreakerTripsCounter = new client.Counter({
    name: "api_gateway_circuit_breaker_trips_total",
    help: "Total number of circuit breaker trips",
    labelNames: ["service"]
  });

  // Middleware to measure response time and record in histogram
  app.use(responseTime((req: Request, res: Response, time: number) => {
    // Servis adını belirle
    let service = "api_gateway";
    let route = req.path || "/";

    // Proxy rotalarını tanımla
    if (route.startsWith("/api/v1/segmentation")) {
      service = "segmentation";
    } else if (route.startsWith("/api/v1/runner")) {
      service = "runner";
    } else if (route.startsWith("/api/v1/archive")) {
      service = "archive";
    } else if (route.startsWith("/api/v1/ai")) {
      service = "ai_orchestrator";
    }

    // Route path'i normalize et (dinamik parametreleri kaldır)
    if (req?.route?.path) {
      route = req.route.path;
    }

    // HTTP metrikleri
    const statusCode = res.statusCode.toString();
    const method = req.method;

    // İstek süresini kaydet
    httpRequestDurationMicroseconds
      .labels(method, route, statusCode, service)
      .observe(time);

    // İstek sayısını artır
    httpRequestCounter
      .labels(method, route, statusCode, service)
      .inc();

    // Hata durumunda hata sayacını artır
    if (res.statusCode >= 400) {
      const errorType = res.statusCode >= 500 ? "server_error" : "client_error";
      httpErrorCounter
        .labels(method, route, statusCode, errorType, service)
        .inc();
    }

    // Cache metriklerini kontrol et
    const cacheHeader = res.getHeader("X-Cache");
    if (cacheHeader === "HIT") {
      cacheHitCounter.labels(route, service).inc();
    } else if (cacheHeader === "MISS") {
      cacheMissCounter.labels(route, service).inc();
    }
  }));

  // Metrics Endpoint - Yetkilendirme ekle
  (app as any).get("/metrics", async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Basit API anahtarı kontrolü (production'da daha güvenli bir yöntem kullanılmalı)
      const apiKey = req.headers["x-api-key"] || req.query.apiKey;
      const metricsApiKey = process.env.METRICS_API_KEY;

      if (metricsApiKey && apiKey !== metricsApiKey) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      res.set("Content-Type", client.register.contentType);
      res.end(await client.register.metrics());
      logger.info("Metrics endpoint accessed");
    } catch (error) {
      next(error);
    }
  });

  // Circuit Breaker durumunu izlemek için global fonksiyonlar
  global.updateCircuitBreakerMetrics = (service: string, state: string, trips?: number) => {
    let stateValue = 0; // closed
    if (state === "open") stateValue = 1;
    if (state === "half-open") stateValue = 0.5;

    circuitBreakerStateGauge.labels(service).set(stateValue);

    if (trips && trips > 0) {
      circuitBreakerTripsCounter.labels(service).inc(trips);
    }
  };

  // Proxy metriklerini güncellemek için global fonksiyon
  global.updateProxyMetrics = (method: string, service: string, status: string, duration: number) => {
    proxyRequestCounter.labels(method, service, status).inc();
    proxyRequestDuration.labels(method, service, status).observe(duration);
  };

  logger.info("Enhanced Prometheus metrics collection enabled and /metrics endpoint configured.");
};

/**
 * Enhanced Health Check Configuration
 */
export const setupHealthCheck = (app: Express) => {
  // Gelişmiş sağlık kontrolü endpoint'i
  (app as any).get("/health", async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Temel sistem durumu
      interface ServiceStatus {
        status: string;
        [key: string]: unknown;
      }

      interface HealthStatus {
        status: string;
        timestamp: string;
        uptime: number;
        version: string;
        services: {
          redis?: ServiceStatus;
          serviceDiscovery?: ServiceStatus;
          circuitBreakers?: Record<string, ServiceStatus>;
          [key: string]: unknown;
        };
        memory: {
          rss: number;
          heapTotal: number;
          heapUsed: number;
          external: number;
          unit: string;
        };
        error?: string; // Opsiyonel hata alanı
      }

      const healthStatus: HealthStatus = {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || "unknown",
        services: {
          redis: undefined,
          serviceDiscovery: undefined,
          circuitBreakers: undefined
        },
        memory: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
          unit: "MB"
        }
      };

    // Servis durumlarını kontrol et
    try {
      // Redis durumu
      const redisClient = require("../utils/redisClient").default;
      if (redisClient && redisClient.status === "ready") {
        healthStatus.services.redis = { status: "ok" };

        // Redis ping testi
        try {
          const pingStart = Date.now();
          await redisClient.ping();
          healthStatus.services.redis.latency = Date.now() - pingStart;
        } catch (err) {
          healthStatus.services.redis.status = "degraded";
          healthStatus.services.redis.error = "Ping failed";
        }
      } else {
        healthStatus.services.redis = {
          status: "unavailable",
          details: redisClient ? redisClient.status : "not initialized"
        };
      }

      // Servis keşif durumu
      const serviceDiscovery = require("../services/serviceDiscovery").serviceDiscovery;
      if (serviceDiscovery) {
        healthStatus.services.serviceDiscovery = {
          status: "ok",
          availableServices: serviceDiscovery.getAvailableServices()
        };
      }

      // Circuit breaker durumları
      const breakers = require("../middleware/proxyMiddleware").breakers;
      if (breakers) {
        if (!healthStatus.services.circuitBreakers) {
          healthStatus.services.circuitBreakers = {};
        }

        Object.keys(breakers).forEach(service => {
          const breaker = breakers[service];
          if (healthStatus.services.circuitBreakers) {
            healthStatus.services.circuitBreakers[service] = {
              status: breaker.status,
              stats: {
                successes: breaker.stats.successes,
                failures: breaker.stats.failures,
                rejects: breaker.stats.rejects,
                timeouts: breaker.stats.timeouts
              }
            };
          }
        });
      }
    } catch (error) {
      logger.error("Error checking service health:", error);
      healthStatus.status = "degraded";
      healthStatus.error = "Error checking service dependencies";
    }

    // Yanıt durumunu belirle
    const hasFailedServices = Object.values(healthStatus.services).some(
      (service) => service && typeof service === 'object' && (service as any).status === "unavailable"
    );

    const hasDegradedServices = Object.values(healthStatus.services).some(
      (service) => service && typeof service === 'object' && (service as any).status === "degraded"
    );

    if (hasFailedServices) {
      healthStatus.status = "critical";
      res.status(503);
    } else if (hasDegradedServices) {
      healthStatus.status = "degraded";
      res.status(200); // Degraded durumda bile 200 dönebiliriz
    } else {
      res.status(200);
    }

    // Detaylı bilgi isteniyorsa
    if (req.query.verbose !== "true") {
      // Basit yanıt
      const simpleStatus = {
        status: healthStatus.status,
        timestamp: healthStatus.timestamp
      };
      return res.json(simpleStatus);
    }

    // Detaylı yanıt
    res.json(healthStatus);
    } catch (error) {
      next(error);
    }
  });

  logger.info("Enhanced health check endpoint configured at /health.");
};

