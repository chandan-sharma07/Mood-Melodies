const Redis = require("ioredis");

const host = process.env.REDIS_HOST || process.env.Redis_HOST;
const port = Number(process.env.REDIS_PORT || process.env.Redis_PORT || 6379);
const password = process.env.REDIS_PASSWORD || process.env.Redis_PASSWORD;

let client = null;

if (host) {
    client = new Redis({
        host,
        port,
        password,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        retryStrategy: () => null,
        lazyConnect: true,
    });

    client.on("connect", () => {
        console.log("Server is connected to Redis");
    });

    client.on("error", (err) => {
        console.warn("Redis unavailable:", err.message);
    });

    client.connect().catch(() => {
        console.warn("Redis connection skipped — auth will use database blacklist only");
    });
}

const redisClient = {
    async get(key) {
        if (!client) return null;
        try {
            return await client.get(key);
        } catch {
            return null;
        }
    },
    async set(key, value, ...args) {
        if (!client) return null;
        try {
            return await client.set(key, value, ...args);
        } catch {
            return null;
        }
    },
};

module.exports = redisClient;
