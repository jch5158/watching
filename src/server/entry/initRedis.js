import { createClient } from "redis";

const redisClient = createClient({
  url: `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASS}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
  legacyMode: true,
});

redisClient.on("connect", () => {
  console.info("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

redisClient.connect();

export default redisClient;
