// src/middleware/proxyMiddleware.ts
import { createProxyMiddleware, Options, RequestHandler } from 'http-proxy-middleware';
import { Request, Response, NextFunction, RequestHandler as ExpressRequestHandler } from 'express';
import CircuitBreaker from 'opossum';
import { serviceDiscovery } from '../services/serviceDiscovery';
import logger from '../utils/logger'; // Import logger
import http from 'http'; // Import http for IncomingMessage type

// Add originalUrl to IncomingMessage interface via declaration merging
// This helps if http-proxy-middleware passes the raw IncomingMessage to handlers
declare module 'http' {
  interface IncomingMessage {
    originalUrl?: string;
  }
}

// Circuit Breaker options
const circuitBreakerOptions: CircuitBreaker.Options = {
  timeout: 5000, // If the function takes longer than 5 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
  resetTimeout: 30000, // After 30 seconds, try again.
};

// Store circuit breakers for each service
export const breakers: { [key: string]: CircuitBreaker<any[], any> } = {};

type BreakerProxyFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>;

const getCircuitBreaker = (serviceName: string, proxyFunction: BreakerProxyFunction): CircuitBreaker<[Request, Response, NextFunction], void> => {
  if (!breakers[serviceName]) {
    const breaker = new CircuitBreaker<[Request, Response, NextFunction], void>(proxyFunction, circuitBreakerOptions);

    breaker.on('open', () => {
      logger.warn(`[CIRCUIT BREAKER] Circuit for ${serviceName} opened.`);
      // Metrik güncelleme
      if (global.updateCircuitBreakerMetrics) {
        global.updateCircuitBreakerMetrics(serviceName, 'open', 1);
      }
    });

    breaker.on('halfOpen', () => {
      logger.info(`[CIRCUIT BREAKER] Circuit for ${serviceName} half-opened.`);
      // Metrik güncelleme
      if (global.updateCircuitBreakerMetrics) {
        global.updateCircuitBreakerMetrics(serviceName, 'half-open');
      }
    });

    breaker.on('close', () => {
      logger.info(`[CIRCUIT BREAKER] Circuit for ${serviceName} closed.`);
      // Metrik güncelleme
      if (global.updateCircuitBreakerMetrics) {
        global.updateCircuitBreakerMetrics(serviceName, 'closed');
      }
    });

    breaker.on('fallback', (result: any, err: Error | any) => {
      logger.error(`[CIRCUIT BREAKER] Fallback triggered for ${serviceName}: ${err?.message || 'Unknown error'}`);
    });

    breaker.fallback((req: Request, res: Response, next: NextFunction, err: Error) => {
      logger.error(`[CIRCUIT BREAKER FALLBACK] Service ${serviceName} unavailable: ${err?.message}`);
      if (!res.headersSent) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: `The ${serviceName} service is currently unavailable due to repeated failures. Please try again later.`
        });
      }
      logger.error(`[CIRCUIT BREAKER FALLBACK] Headers already sent for ${req.originalUrl}, cannot send 503 response.`);
      return undefined;
    });

    breakers[serviceName] = breaker;
  }
  return breakers[serviceName] as CircuitBreaker<[Request, Response, NextFunction], void>;
};

// Default proxy options - Use correct types from http-proxy-middleware
const defaultOptions: Options = {
  changeOrigin: true,
  selfHandleResponse: true,
  pathRewrite: {},
  on: {
    // Use http.IncomingMessage here, but access originalUrl added via declaration merging
    proxyReq: (proxyReq, req: http.IncomingMessage, res) => {
        // Use originalUrl if available (attached by upstream middleware), otherwise fallback to url
        logger.info(`[PROXY REQ] ${req.method} ${req.originalUrl || req.url} -> ${proxyReq.path}`);
    },
    // Use http.IncomingMessage here
    error: (err, req: http.IncomingMessage, res) => {
        // Use originalUrl if available, otherwise fallback to url
        logger.error(`[PROXY ERROR] ${req.method} ${req.originalUrl || req.url}: ${err.message}`);
        const serverResponse = res as http.ServerResponse;
        if (!serverResponse.headersSent) {
            serverResponse.writeHead(502, { 'Content-Type': 'application/json' });
            serverResponse.end(JSON.stringify({
                error: 'Bad Gateway',
                message: 'Error connecting to the backend service.'
            }));
        } else {
            serverResponse.destroy(err);
        }
    },
  }
};

export const createServiceProxy = (
  serviceName: string,
  pathPrefix: string,
  options: Partial<Options> = {}
): ExpressRequestHandler => {
  const serviceAvailabilityCheck: ExpressRequestHandler = (req, res, next) => {
    try {
      // Attach originalUrl to the raw request object for potential use in proxy events
      // This is a common pattern, but might be fragile depending on Node/Express versions.
      // If this causes issues, remove it and rely on req.originalUrl within the breaker scope.
      // (req as any)._originalUrl = req.originalUrl; // Use a less intrusive property name
      // Let's remove the problematic line for now as originalUrl is available in the breaker scope
      // req.socket.parser.incoming.originalUrl = req.originalUrl;
      serviceDiscovery.getServiceUrl(serviceName);
      next();
    } catch (error: any) {
      logger.error(`Service '${serviceName}' not configured: ${error?.message}`);
      res.status(503).json({
        error: 'Service Unavailable',
        message: `The ${serviceName} service is not configured properly.`
      });
    }
  };

  try {
    const targetUrl = serviceDiscovery.getServiceUrl(serviceName);

    const proxyOptions: Options = {
      ...defaultOptions,
      target: targetUrl,
      ...options,
      selfHandleResponse: true,
    };

    const proxy = createProxyMiddleware(proxyOptions);

    // This function is wrapped by the circuit breaker
    const proxyFunction: BreakerProxyFunction = (req, res, next) => {
      // İstek başlangıç zamanını kaydet
      const startTime = Date.now();

      return new Promise<void>((resolve, reject) => {
        const customOnProxyRes = (proxyRes: http.IncomingMessage, reqFromProxy: http.IncomingMessage, resFromProxy: http.ServerResponse) => {
          let body = Buffer.from([]);
          proxyRes.on('data', (chunk) => {
            body = Buffer.concat([body, chunk]);
          });
          proxyRes.on('end', () => {
            try {
              // İstek süresini hesapla
              const duration = Date.now() - startTime;

              // Use originalUrl directly from the Express Request object (req) captured in the closure
              resFromProxy.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
              resFromProxy.end(body);

              // Proxy yanıt durumunu belirle
              const statusCategory = proxyRes.statusCode ?
                proxyRes.statusCode < 400 ? "success" :
                proxyRes.statusCode < 500 ? "client_error" : "server_error"
                : "unknown";

              logger.info(`[PROXY RES] ${req.method} ${req.originalUrl} -> ${proxyRes.statusCode} (${duration}ms)`);

              // Metrik güncelleme
              if (global.updateProxyMetrics) {
                global.updateProxyMetrics(req.method, serviceName, statusCategory, duration);
              }

              // Yanıt başarılı mı?
              if (proxyRes.statusCode && proxyRes.statusCode < 500) {
                resolve();
              } else {
                reject(new Error(`Service ${serviceName} returned status ${proxyRes.statusCode}`));
              }
            } catch (error: any) {
              // İstek süresini hesapla
              const duration = Date.now() - startTime;

              logger.error(`[PROXY RES END ERROR] Error processing proxy response for ${req.originalUrl}: ${error?.message}`);

              // Metrik güncelleme - hata durumu
              if (global.updateProxyMetrics) {
                global.updateProxyMetrics(req.method, serviceName, "error", duration);
              }

              reject(error);
            }
          });
          proxyRes.on('error', (err) => {
            // İstek süresini hesapla
            const duration = Date.now() - startTime;

            logger.error(`[PROXY RES ERROR] Error receiving proxy response for ${req.originalUrl}: ${err.message}`);

            // Metrik güncelleme - hata durumu
            if (global.updateProxyMetrics) {
              global.updateProxyMetrics(req.method, serviceName, "error", duration);
            }

            reject(err);
          });
        };

        const eventAttachedProxy = proxy as any;
        // Ensure we don't attach multiple listeners if the middleware instance is somehow reused
        eventAttachedProxy.off('proxyRes', customOnProxyRes);
        eventAttachedProxy.on('proxyRes', customOnProxyRes);

        // Execute the proxy middleware. Pass the original Express req/res.
        // http-proxy-middleware types expect IncomingMessage/ServerResponse, but it works with Express req/res.
        (proxy as ExpressRequestHandler)(req, res, (err?: any) => {
          // This callback might be called by HPM in some error scenarios even with selfHandleResponse
          if (err) {
            logger.error(`[PROXY MIDDLEWARE NEXT(ERROR)] ${req.method} ${req.originalUrl}: ${err.message}`);
            reject(err); // Reject the promise on proxy error
          } else {
            // If next() is called without error, it's unexpected with selfHandleResponse: true
            logger.warn(`[PROXY MIDDLEWARE NEXT()] Unexpected call to next() for ${req.originalUrl}`);
            // We might resolve or reject depending on whether the response was handled
            if (!res.headersSent) {
                 reject(new Error('Proxy finished without sending response or error'));
            } else {
                 // Assume success if headers were sent, though this is ambiguous
                 resolve();
            }
          }
        });
      });
    };

    const breaker = getCircuitBreaker(serviceName, proxyFunction);

    const finalMiddleware: ExpressRequestHandler = (req, res, next) => {
      serviceAvailabilityCheck(req, res, (err?: any) => {
        if (err) {
           logger.error("[UNEXPECTED] Error passed from serviceAvailabilityCheck");
           return;
        }
        breaker.fire(req, res, next).catch(err => {
          // Fallback is handled by the breaker itself. This catch is for unexpected errors during .fire()
          if (!res.headersSent) {
             logger.error(`[CIRCUIT BREAKER UNHANDLED ERROR] ${req.method} ${req.originalUrl}: ${err?.message}`);
             res.status(500).json({ error: 'Internal Server Error', message: 'An unexpected error occurred while processing the request.' });
          }
        });
      });
    };
    return finalMiddleware;

  } catch (error: any) {
    logger.error(`Failed to create proxy for service '${serviceName}': ${error?.message}`);
    const errorMiddleware: ExpressRequestHandler = (req, res) => {
      res.status(503).json({
        error: 'Service Unavailable',
        message: `The ${serviceName} service is not configured properly.`
      });
    };
    return errorMiddleware;
  }
};

// Export pre-configured proxies for each service
export const segmentationServiceProxy = createServiceProxy(
  'segmentation',
  '/api/segmentation',
  {
    pathRewrite: { '^/api/segmentation': '/api' }
  }
);

export const runnerServiceProxy = createServiceProxy(
  'runner',
  '/api/runner',
  {
    pathRewrite: { '^/api/runner': '/api' }
  }
);

export const archiveServiceProxy = createServiceProxy(
  'archive',
  '/api/archive',
  {
    pathRewrite: { '^/api/archive': '/api' }
  }
);

export const aiOrchestratorServiceProxy = createServiceProxy(
  'ai-orchestrator',
  '/api/ai',
  {
    pathRewrite: { '^/api/ai': '/api' }
  }
);
