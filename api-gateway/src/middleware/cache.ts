import { Request, Response, NextFunction } from "express";
import redisClient from "../utils/redisClient"; // Import the configured Redis client
import logger from "../utils/logger";

const cacheMiddleware = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Use originalUrl or url as the key, consider query params
    const key = "__express__" + (req.originalUrl || req.url);
    let cachedBody = null;

    try {
      cachedBody = await redisClient.get(key);
    } catch (err) {
      logger.error(`Redis GET error for key ${key}:`, err);
      // If Redis fails, proceed without caching
      return next();
    }

    if (cachedBody) {
      // logger.info(`Redis Cache hit for ${key}`);
      // Send the cached response
      try {
        res.setHeader("X-Cache", "HIT");
        // Attempt to parse as JSON, fallback to sending as is
        try {
          res.setHeader("Content-Type", "application/json");
          res.send(JSON.parse(cachedBody));
        } catch (parseError) {
          // If not JSON, send as plain text or original content type if stored
          // For simplicity, sending as plain text here. Could store content-type in Redis too.
          res.setHeader("Content-Type", "text/plain"); 
          res.send(cachedBody);
        }
      } catch (e) {
        logger.error("Error sending cached response:", e);
      }
      return; // Stop further processing
    } else {
      // logger.info(`Redis Cache miss for ${key}`);
      res.setHeader("X-Cache", "MISS");
      // Override res.send to cache the response in Redis
      const originalSend = res.send;
      res.send = (body) => {
        // Only cache successful responses (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            // Store the body in Redis with expiration (EX = seconds)
            // Stringify JSON bodies before storing
            const bodyToCache = (typeof body === "string") ? body : JSON.stringify(body);
            redisClient.set(key, bodyToCache, "EX", duration)
              .then(() => { /* logger.info(`Redis Cached response for ${key} for ${duration} seconds`); */ })
              .catch(err => logger.error(`Redis SET error for key ${key}:`, err));
          } catch (err) {
            logger.error(`Error caching response body for key ${key}:`, err);
          }
        }
        // Call the original send method
        originalSend.call(res, body);
      };
      next();
    }
  };
};

module.exports = cacheMiddleware;

