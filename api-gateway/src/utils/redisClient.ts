import Redis from "ioredis";
import logger from "./logger";

// Configure Redis connection using environment variables or defaults
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = new Redis(redisUrl, {
  // Optional: Add more configuration options here
  // e.g., password, db, retryStrategy
  maxRetriesPerRequest: 3, // Example: Retry commands up to 3 times
  enableReadyCheck: true,
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
});

redisClient.on("close", () => {
  logger.warn("Redis connection closed.");
});

redisClient.on("reconnecting", () => {
  logger.info("Reconnecting to Redis...");
});

// Optional: Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Disconnecting Redis client...");
  await redisClient.quit();
  logger.info("Redis client disconnected.");
  process.exit(0);
});

export default redisClient;

