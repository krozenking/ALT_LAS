import Redis, { RedisOptions } from "ioredis";
import logger from "./logger";

let redisClient: Redis;

// Check if running in test environment
if (process.env.NODE_ENV === "test") {
  // Use a mock Redis client for testing to avoid actual connection
  // This mock needs to provide basic methods used in the app (get, set, on, quit, status)
  // to prevent runtime errors.
  logger.info("Running in test environment. Using mock Redis client.");
  redisClient = {
    get: async (key: string) => {
      // logger.debug(`Mock Redis GET: ${key}`);
      return null; // Simulate cache miss
    },
    set: async (key: string, value: string, mode?: string, duration?: number) => {
      // logger.debug(`Mock Redis SET: ${key}, Value: ${value}, Mode: ${mode}, Duration: ${duration}`);
      return "OK";
    },
    on: (event: string, listener: (...args: any[]) => void) => {
      // logger.debug(`Mock Redis ON: ${event}`);
      // No-op for mock
      return redisClient; // Return itself for chaining
    },
    quit: async () => {
      // logger.debug("Mock Redis QUIT");
      return "OK";
    },
    status: "end", // Simulate a non-ready status initially or always for tests
    // Add other methods used by your application if necessary
    // Example: del, exists, etc.
    connect: async () => { logger.debug("Mock Redis CONNECT called"); }, // Mock connect
    disconnect: () => { logger.debug("Mock Redis DISCONNECT called"); }, // Mock disconnect
    // Add any other properties or methods your code might access
  } as unknown as Redis; // Cast to Redis type, acknowledge it's a partial mock

} else {
  // Configure Redis connection using environment variables or defaults for non-test environments
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const options: RedisOptions = {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    // Add retry strategy for better resilience
    retryStrategy(times: number): number | void {
      const delay = Math.min(times * 50, 2000); // Exponential backoff up to 2 seconds
      logger.warn(`Redis connection failed. Retrying in ${delay}ms (attempt ${times})...`);
      return delay;
    },
  };

  redisClient = new Redis(redisUrl, options);

  redisClient.on("connect", () => {
    logger.info("Connected to Redis server.");
  });

  redisClient.on("ready", () => {
    logger.info("Redis client is ready.");
  });

  redisClient.on("error", (err: Error) => {
    logger.error("Redis connection error:", err);
    // Consider more robust error handling or application shutdown strategy
  });

  redisClient.on("close", () => {
    logger.warn("Redis connection closed.");
  });

  redisClient.on("reconnecting", (delay: number) => {
    logger.info(`Reconnecting to Redis in ${delay}ms...`);
  });
}

// Function to disconnect the client gracefully
export const disconnectRedis = async () => {
  // Check if it's the real client and connected/connecting before quitting
  if (redisClient && typeof redisClient.quit === 'function' && (redisClient.status === "ready" || redisClient.status === "connecting")) {
    logger.info("Disconnecting Redis client...");
    try {
      await redisClient.quit();
      logger.info("Redis client disconnected.");
    } catch (err) {
      logger.error("Error disconnecting Redis client:", err);
    }
  }
};

// Optional: Graceful shutdown for the main process
// Ensure this doesn't run or is handled differently in tests if needed
if (process.env.NODE_ENV !== "test") {
  process.on("SIGINT", async () => {
    await disconnectRedis();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    await disconnectRedis();
    process.exit(0);
  });
}

export default redisClient;

