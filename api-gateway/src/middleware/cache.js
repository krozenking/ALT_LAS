const mcache = require("memory-cache");

const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Use originalUrl or url as the key, consider query params
    const key = "__express__" + (req.originalUrl || req.url);
    const cachedBody = mcache.get(key);

    if (cachedBody) {
      // console.log(`Cache hit for ${key}`);
      // Send the cached response
      // Need to handle different content types, assuming JSON for now
      try {
        res.setHeader("X-Cache", "HIT");
        res.setHeader("Content-Type", "application/json"); // Assume JSON
        res.send(cachedBody);
      } catch (e) {
        // If sending fails (e.g., headers already sent), log and ignore
        console.error("Error sending cached response:", e);
      }
      return; // Important: stop further processing
    } else {
      // console.log(`Cache miss for ${key}`);
      res.setHeader("X-Cache", "MISS");
      // Override res.send to cache the response
      const originalSend = res.send;
      res.send = (body) => {
        // Only cache successful responses (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Cache the response body for the specified duration (in seconds)
          // memory-cache uses milliseconds
          mcache.put(key, body, duration * 1000);
          // console.log(`Cached response for ${key} for ${duration} seconds`);
        }
        // Call the original send method
        originalSend.call(res, body);
      };
      next();
    }
  };
};

module.exports = cacheMiddleware;

