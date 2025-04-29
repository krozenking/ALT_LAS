import { Request, Response, NextFunction, Express } from "express";
import client from "prom-client";
import responseTime from "response-time";
import logger from "./logger";

// Critical Error Counter
export const criticalErrorCounter = new client.Counter({
  name: "critical_errors_total",
  help: "Total number of critical errors (e.g., 5xx)",
  labelNames: ["error_type", "route"], // Optional labels like error type or route
});

/**
 * Prometheus Metrics Configuration
 */
export const setupMetrics = (app: Express) => {
  // Enable default metrics collection (CPU, memory, etc.)
  client.collectDefaultMetrics();

  // Optional: Clear default metrics if needed (e.g., for specific testing)
  // client.register.clear();

  // HTTP Request Duration Histogram
  const httpRequestDurationMicroseconds = new client.Histogram({
    name: "http_request_duration_ms",
    help: "Duration of HTTP requests in ms",
    labelNames: ["method", "route", "code"],
    buckets: [50, 100, 200, 500, 1000, 2500, 5000] // Buckets in milliseconds
  });

  // Middleware to measure response time and record in histogram
  app.use(responseTime((req: Request, res: Response, time: number) => {
    if (req?.route?.path) { // Ensure route path is available
      httpRequestDurationMicroseconds
        .labels(req.method, req.route.path, res.statusCode.toString())
        .observe(time);
    }
  }));

  // Metrics Endpoint
  app.get("/metrics", async (req: Request, res: Response) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
    logger.info("Metrics endpoint accessed");
  });

  logger.info("Prometheus metrics collection enabled and /metrics endpoint configured.");
};

/**
 * Basic Health Check Configuration
 */
export const setupHealthCheck = (app: Express) => {
  // Simple health check endpoint
  app.use("/health", require("express-healthcheck")());
  logger.info("Health check endpoint configured at /health.");
};

