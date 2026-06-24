import { createClient } from "redis";

let redisClient = null;
let isRedisConnected = false;

// Fallback in-memory blocklist for local dev without Redis
const memoryBlocklist = new Set();

export const initRedis = async () => {
  try {
    redisClient = createClient({ url: process.env.REDIS_URL || "redis://127.0.0.1:6379" });
    
    redisClient.on("error", (err) => {
      console.warn("Redis connection error (falling back to memory blocklist):", err.message);
      isRedisConnected = false;
    });

    await redisClient.connect();
    isRedisConnected = true;
    console.log("Connected to Redis successfully for token revocation");
  } catch (error) {
    console.warn("Could not connect to Redis, using in-memory token blocklist for logout.");
    isRedisConnected = false;
  }
};

export const blockToken = async (token, expiresInSeconds) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.setEx(`bl_${token}`, expiresInSeconds, "true");
      return;
    } catch (error) {
      console.warn("Redis setEx failed, using memory blocklist");
    }
  }
  // Fallback
  memoryBlocklist.add(token);
  setTimeout(() => memoryBlocklist.delete(token), expiresInSeconds * 1000);
};

export const isTokenBlocked = async (token) => {
  if (isRedisConnected && redisClient) {
    try {
      const result = await redisClient.get(`bl_${token}`);
      return result === "true";
    } catch (error) {
      console.warn("Redis get failed, checking memory blocklist");
    }
  }
  // Fallback
  return memoryBlocklist.has(token);
};
