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
    let cachedBody: string | null = null; // Explicitly type as string | null

    try {
      cachedBody = await redisClient.get(key);
    } catch (err: any) { // Add type for err
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
          res.send(JSON.parse(cachedBody)); // No return here
        } catch (parseError) {
          // If not JSON, send as plain text or original content type if stored
          // For simplicity, sending as plain text here. Could store content-type in Redis too.
          res.setHeader("Content-Type", "text/plain"); 
          res.send(cachedBody); // No return here
        }
      } catch (e: any) { // Add type for e
        logger.error("Error sending cached response:", e);
        // If sending cached response fails, maybe proceed?
        // Depending on desired behavior, could call next() or just end response.
        // For now, let's just log and end.
        if (!res.headersSent) {
          res.status(500).send("Error retrieving cached response");
        }
      }
      return; // Stop further processing after attempting to send cached response
    } else {
      // logger.info(`Redis Cache miss for ${key}`);
      res.setHeader("X-Cache", "MISS");
      // Override res.send to cache the response in Redis
      const originalSend = res.send.bind(res); // Bind context

      // Define the new send function with a matching signature (approximated)
      res.send = (body?: any): Response => { 
        // Only cache successful responses (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300 && body != null) { // Check if body is not null/undefined
          try {
            // Store the body in Redis with expiration (EX = seconds)
            // Stringify JSON bodies before storing
            const bodyToCache = (typeof body === "string") ? body : JSON.stringify(body);
            redisClient.set(key, bodyToCache, { EX: duration }) // Use options object for EX
              .then(() => { /* logger.info(`Redis Cached response for ${key} for ${duration} seconds`); */ })
              .catch((err: any) => logger.error(`Redis SET error for key ${key}:`, err)); // Add type for err
          } catch (err: any) { // Add type for err
            logger.error(`Error caching response body for key ${key}:`, err);
          }
        }
        // Call the original send method with the original context and return its result
        return originalSend.call(res, body);
      };
      next();
    }
  };
};

export default cacheMiddleware;

