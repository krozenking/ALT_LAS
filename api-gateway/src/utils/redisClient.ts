import Redis from "ioredis";
import logger from "./logger";

let redisClient: Redis | null = null;

// Only connect to Redis if not in test environment
if (process.env.NODE_ENV !== 'test') {
  // Configure Redis connection using environment variables or defaults
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  redisClient = new Redis(redisUrl, {
    // Optional: Add more configuration options here
    // e.g., password, db, retryStrategy
    maxRetriesPerRequest: 3, // Example: Retry commands up to 3 times
    enableReadyCheck: true,
    // Prevent connection attempts if Redis is not available during startup
    // This might help in environments where Redis is optional or starts later
    enableOfflineQueue: false, 
  });

  redisClient.on("connect", () => {
    logger.info("Connected to Redis server.");
  });

  redisClient.on("ready", () => {
    logger.info("Redis client is ready.");
  });

  redisClient.on("error", (err) => {
    logger.error("Redis connection error:", err);
    // Consider adding logic to handle critical connection errors
    // In non-test env, maybe exit if connection is crucial?
  });

  redisClient.on("close", () => {
    logger.warn("Redis connection closed.");
  });

  redisClient.on("reconnecting", () => {
    logger.info("Reconnecting to Redis...");
  });

} else {
  logger.info("Running in test environment. Skipping Redis connection.");
  // Provide a mock client for test environment to avoid errors
  // This mock needs to satisfy the parts of the Redis client interface used by the app
  redisClient = {
    status: 'end', // Simulate a non-ready status
    get: async (key: string) => { 
      logger.debug(`[Mock Redis] GET ${key}`);
      return null; // Always return null for cache misses in tests
    },
    set: async (key: string, value: string, ...args: any[]) => {
      logger.debug(`[Mock Redis] SET ${key} with args: ${args.join(', ')}`);
      return 'OK'; // Simulate successful set
    },
    quit: async () => {
      logger.debug("[Mock Redis] QUIT");
      redisClient!.status = 'end';
      return 'OK';
    },
    // Add other methods used by your application if necessary
    on: (event: string, listener: (...args: any[]) => void) => {
      logger.debug(`[Mock Redis] Registered listener for event: ${event}`);
      // No-op for mock
      return redisClient as any; // Return mock client for chaining
    },
    // Add any other properties or methods accessed by your code
    options: {},
    disconnect: () => { 
        logger.debug("[Mock Redis] DISCONNECT");
        redisClient!.status = 'end';
    }
  } as any; // Use 'as any' for simplicity, or create a more robust mock interface
}

// Function to disconnect the client gracefully
export const disconnectRedis = async () => {
  // Check if redisClient is not null and has a quit method
  if (redisClient && typeof redisClient.quit === 'function') {
    // Check status before quitting for real client
    if (process.env.NODE_ENV !== 'test' && (redisClient.status === "ready" || redisClient.status === "connecting")) {
      logger.info("Disconnecting Redis client...");
      await redisClient.quit();
      logger.info("Redis client disconnected.");
    } else if (process.env.NODE_ENV === 'test') {
      // Call mock quit
      await redisClient.quit();
    }
  } else {
    logger.info("Redis client was not initialized or does not support quit.");
  }
};

// Optional: Graceful shutdown for the main process
process.on("SIGINT", async () => {
  await disconnectRedis();
  process.exit(0);
});

// Export the potentially null or mock client
// Code using this client must handle the possibility of it being null or the mock
export default redisClient;

