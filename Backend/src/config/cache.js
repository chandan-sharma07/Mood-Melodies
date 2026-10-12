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

const memoryStore = new Map();

const redisClient = {
    async get(key) {
        if (client) {
            try {
                const val = await client.get(key);
                if (val !== null && val !== undefined) return val;
            } catch {
                // fall through to in-memory store
            }
        }
        const entry = memoryStore.get(key);
        if (!entry) return null;
        if (entry.expiry && Date.now() > entry.expiry) {
            memoryStore.delete(key);
            return null;
        }
        return entry.value;
    },
    async set(key, value, ...args) {
        let ttlMs = null;
        for (let i = 0; i < args.length; i++) {
            if (typeof args[i] === "string" && args[i].toUpperCase() === "EX" && typeof args[i + 1] === "number") {
                ttlMs = args[i + 1] * 1000;
                break;
            }
            if (typeof args[i] === "string" && args[i].toUpperCase() === "PX" && typeof args[i + 1] === "number") {
                ttlMs = args[i + 1];
                break;
            }
            if (typeof args[i] === "number") {
                ttlMs = args[i] * 1000;
                break;
            }
        }

        memoryStore.set(key, {
            value,
            expiry: ttlMs ? Date.now() + ttlMs : null,
        });

        if (client) {
            try {
                return await client.set(key, value, ...args);
            } catch {
                return null;
            }
        }
        return "OK";
    },
    async del(key) {
        memoryStore.delete(key);
        if (client) {
            try {
                return await client.del(key);
            } catch {
                return null;
            }
        }
        return 1;
    },
};

module.exports = redisClient;
