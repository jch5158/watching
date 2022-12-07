import { createClient } from "redis";

const redisClient = createClient({
  url: `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASS}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
});

redisClient.on("connect", () => {
  console.info("Redis connected!");
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

(async () => {
  await redisClient.connect();
})();

export default redisClient;
