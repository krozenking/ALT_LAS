/**
 * @file API Gateway Entry Point
 * @description This file initializes and configures the Express.js application for the ALT_LAS API Gateway.
 * It sets up middleware, routes, authentication, service discovery, and performance monitoring.
 * The API Gateway serves as the single entry point for all client requests to the ALT_LAS backend services.
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet"); // For setting various HTTP headers to secure the app
const morgan = require("morgan"); // HTTP request logger middleware
const swaggerUi = require("swagger-ui-express"); // To serve Swagger UI for API documentation
const YAML = require("yamljs"); // To load YAML files, used here for swagger.yaml
const path = require("path");

// --- Middleware Imports ---
const rateLimiter = require("./middleware/rateLimiter"); // Custom rate limiting middleware
const apiVersioning = require("./middleware/apiVersioning"); // Middleware for API versioning
const authenticateJWT = require("./middleware/authenticateJWT"); // Middleware for JWT authentication

// --- Service Imports ---
const authService = require("./services/authService"); // Handles authentication logic (registration, login, token refresh, logout)
const enhancedServiceDiscovery = require("./services/enhancedServiceDiscovery"); // Manages discovery and health checks of backend microservices
const performanceMonitor = require("./services/performanceMonitor"); // Monitors and collects performance metrics

// Initialize Express application
const app = express();
const port = process.env.PORT || 3000; // Use port from environment variable or default to 3000

// --- Core Middleware Setup ---
app.use(performanceMonitor.middleware()); // Performance monitoring should be one of the first middleware
app.use(helmet()); // Apply security-related HTTP headers
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming requests with JSON payloads
app.use(morgan("dev")); // Log HTTP requests to the console in 'dev' format

// Apply rate limiting to all requests
app.use(rateLimiter({
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 100,    // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after a minute"
}));

// Apply API versioning middleware
app.use(apiVersioning({
  defaultVersion: "v1",
  supportedVersions: ["v1"],
}));

// --- API Documentation (Swagger) ---
const swaggerDocumentPath = path.join(__dirname, "../swagger.yaml");
const swaggerDocument = YAML.load(swaggerDocumentPath);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Serve Swagger UI at /api-docs

// --- Service Registration (Development Only) ---
// In a development environment, manually register backend services for discovery.
// In production, services would typically register themselves or be discovered via a service registry (e.g., Consul, Eureka).
if (process.env.NODE_ENV === "development") {
  enhancedServiceDiscovery.register("segmentation-service", "localhost", 3001, { version: "1.0.0", protocol: "http" });
  enhancedServiceDiscovery.register("runner-service", "localhost", 3002, { version: "1.0.0", protocol: "http" });
  enhancedServiceDiscovery.register("archive-service", "localhost", 3003, { version: "1.0.0", protocol: "http" });
  // TODO: Register other services like workflow-engine, os-integration, ai-orchestrator if they have HTTP interfaces.
  console.log("Development: Mock backend services registered with health checks.");
}

// --- Authentication Routes ---
/**
 * @route POST /api/auth/register
 * @description Registers a new user.
 * @access Public
 */
app.post("/api/auth/register", (req, res) => {
  try {
    const { username, password, roles } = req.body;
    const user = authService.register(username, password, roles || ["user"]);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @route POST /api/auth/login
 * @description Logs in an existing user and returns JWT tokens.
 * @access Public
 */
app.post("/api/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;
    const result = authService.login(username, password);
    res.json(result); // Contains accessToken and refreshToken
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

/**
 * @route POST /api/auth/refresh
 * @description Refreshes an access token using a refresh token.
 * @access Public
 */
app.post("/api/auth/refresh", (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }
    const result = authService.refreshAccessToken(refreshToken);
    res.json(result); // Contains new accessToken
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

/**
 * @route POST /api/auth/logout
 * @description Logs out a user by invalidating their refresh token.
 * @access Public
 */
app.post("/api/auth/logout", (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }
    const success = authService.logout(refreshToken);
    // Even if the token was already invalid or not found, we don't want to leak that info.
    res.status(200).json({ message: "Logout processed successfully" });
  } catch (error) {
    // Log the actual error server-side for debugging
    console.error("Logout error:", error.message);
    res.status(500).json({ message: "Logout failed due to an internal error" });
  }
});

// --- Service Discovery and Status Routes (Admin Access Only) ---
/**
 * @route GET /api/services
 * @description Lists all registered backend services.
 * @access Admin
 */
app.get("/api/services", authenticateJWT, authService.authorize(["admin"]), (req, res) => {
  const services = enhancedServiceDiscovery.findAll();
  res.json(services);
});

/**
 * @route GET /api/status
 * @description Gets the health status of all registered backend services.
 * @access Admin
 */
app.get("/api/status", authenticateJWT, authService.authorize(["admin"]), (req, res) => {
  const healthStatus = enhancedServiceDiscovery.getHealthStatus();
  res.json(healthStatus);
});

/**
 * @route POST /api/services/register
 * @description Manually registers a new backend service (primarily for admin/dev use).
 * @access Admin
 */
app.post("/api/services/register", authenticateJWT, authService.authorize(["admin"]), (req, res) => {
  try {
    const { name, host, port, metadata, healthCheckOptions } = req.body;
    const service = enhancedServiceDiscovery.register(name, host, port, metadata, healthCheckOptions);
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- Performance Metrics Routes (Admin Access Only) ---
/**
 * @route GET /api/metrics
 * @description Retrieves detailed performance metrics for the API Gateway.
 * @access Admin
 */
app.get("/api/metrics", authenticateJWT, authService.authorize(["admin"]), (req, res) => {
  const metrics = performanceMonitor.getMetrics();
  res.json(metrics);
});

/**
 * @route GET /api/metrics/summary
 * @description Retrieves a summary of performance metrics.
 * @access Admin
 */
app.get("/api/metrics/summary", authenticateJWT, authService.authorize(["admin"]), (req, res) => {
  const summary = performanceMonitor.getSummary();
  res.json(summary);
});

// --- General Routes ---
/**
 * @route GET /
 * @description Root endpoint providing basic information about the API Gateway.
 * @access Public
 */
app.get("/", (req, res) => {
  res.json({ 
    message: "Welcome to ALT_LAS API Gateway",
    documentation: "/api-docs", // Link to Swagger API documentation
    version: req.apiVersion || "v1", // Current API version being accessed
    status: "running"
  });
});

/**
 * @route GET /health
 * @description Health check endpoint for the API Gateway itself.
 * @access Public
 */
app.get("/health", (req, res) => {
  // TODO: Add more comprehensive health checks for the gateway (e.g., Redis connection).
  res.json({ status: "UP", service: "API Gateway" });
});

// --- Proxied Service Routes (Authenticated) ---
// These routes proxy requests to the respective backend microservices.
// All routes here require JWT authentication.

/**
 * @route POST /api/v1/segmentation
 * @description Proxies requests to the Segmentation Service to segment a command.
 * @access Authenticated Users
 */
app.post("/api/v1/segmentation", authenticateJWT, async (req, res) => {
  try {
    const service = enhancedServiceDiscovery.findOneHealthy("segmentation-service");
    if (!service) {
      performanceMonitor.recordServiceDiscovery("failure", "segmentation-service");
      return res.status(503).json({ message: "Segmentation service unavailable or unhealthy" });
    }
    performanceMonitor.recordServiceDiscovery("request", service);
    
    // TODO: Implement actual proxying logic using a library like 'http-proxy-middleware' or 'axios'.
    // Example with axios (ensure axios is installed: npm install axios):
    // const axios = require('axios');
    // const response = await axios.post(`${service.protocol}://${service.host}:${service.port}/segment`, req.body, {
    //   headers: { 'Authorization': req.headers.authorization } // Forward auth header if needed by backend
    // });
    // res.status(response.status).json(response.data);

    // Placeholder mock response for now
    const mockResponse = {
      id: `seg_${Math.random().toString(36).substring(2, 9)}`,
      status: "success",
      altFile: `task_${Date.now()}.alt`,
      metadata: {
        timestamp: new Date().toISOString(),
        mode: req.body.mode || "Normal",
        persona: req.body.persona || "technical_expert",
        userId: req.user.sub // User ID from JWT token
      }
    };
    res.json(mockResponse);
  } catch (error) {
    console.error("Error proxying to segmentation service:", error.message);
    res.status(error.response?.status || 500).json({ 
        message: "Segmentation service proxy error", 
        error: error.message 
    });
  }
});

// Add similar proxy routes for other services (Runner, Archive, Workflow Engine etc.)
// Example for Runner Service:
app.post("/api/v1/runner/execute", authenticateJWT, async (req, res) => {
  try {
    const service = enhancedServiceDiscovery.findOneHealthy("runner-service");
    if (!service) {
      performanceMonitor.recordServiceDiscovery("failure", "runner-service");
      return res.status(503).json({ message: "Runner service unavailable or unhealthy" });
    }
    performanceMonitor.recordServiceDiscovery("request", service);
    // TODO: Actual proxy logic to runner-service's execution endpoint
    res.json({ message: "Request sent to Runner Service", taskId: `run_${Date.now()}` });
  } catch (error) {
    console.error("Error proxying to runner service:", error.message);
    res.status(error.response?.status || 500).json({ message: "Runner service proxy error", error: error.message });
  }
});


// --- Error Handling Middleware (Should be last) ---
/**
 * Generic error handler for any unhandled errors in the application.
 */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  performanceMonitor.recordError(err); // Record the error for monitoring
  res.status(err.status || 500).json({
    message: err.message || "An unexpected error occurred!",
    // Provide error details only in development for security reasons
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

/**
 * 404 Not Found handler for requests to undefined routes.
 */
app.use((req, res) => {
  res.status(404).json({ message: "Not Found: The requested resource does not exist." });
});

// --- Server Initialization ---
// Start the server only if not in a test environment
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
    console.log(`Swagger API documentation available at http://localhost:${port}/api-docs`);
    console.log(`Service health status available at http://localhost:${port}/api/status (Admin only)`);
    console.log(`Performance metrics available at http://localhost:${port}/api/metrics (Admin only)`);
  });
}

module.exports = app; // Export the app for testing purposes

