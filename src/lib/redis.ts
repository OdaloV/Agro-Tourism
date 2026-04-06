// lib/redis.ts
import { Redis } from '@upstash/redis';

// Check if Redis credentials are available
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  console.warn('Redis credentials not found. Redis features will be disabled.');
}

// Create Redis client
export const redis = redisUrl && redisToken ? new Redis({
  url: redisUrl,
  token: redisToken,
}) : null;

//Helper function to check if Redis is available
export const isRedisAvailable = () => redis !== null;