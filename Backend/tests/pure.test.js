const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { normalizeMood, shuffleArray } = require("../src/controllers/jamendo.controller");
const cache = require("../src/config/cache");

describe("Jamendo Controller pure functions", () => {
    it("normalizeMood correctly normalizes mood tags", () => {
        assert.equal(normalizeMood("happy"), "happy");
        assert.equal(normalizeMood("  HAPPY  "), "happy");
        assert.equal(normalizeMood("very sad today"), "sad");
        assert.equal(normalizeMood("energetic beat"), "energetic");
        assert.equal(normalizeMood("unknown_vibe"), "happy");
        assert.equal(normalizeMood(undefined), "happy");
    });

    it("shuffleArray preserves length and elements", () => {
        const input = [1, 2, 3, 4, 5];
        const shuffled = shuffleArray(input);
        assert.equal(shuffled.length, input.length);
        assert.deepEqual([...shuffled].sort(), [...input].sort());
    });
});

describe("Cache with in-memory fallback", () => {
    it("stores and retrieves values with TTL", async () => {
        await cache.set("test_key", "test_value", "EX", 10);
        const val = await cache.get("test_key");
        assert.equal(val, "test_value");
    });

    it("returns null for non-existent key", async () => {
        const val = await cache.get("non_existent_key_12345");
        assert.equal(val, null);
    });
});
