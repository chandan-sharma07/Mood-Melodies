import { describe, it, expect } from "vitest";
import {
  computeEndedBy,
  addToQueue,
  removeFromQueue,
  loadQueue,
  saveQueue,
  QUEUE_STORAGE_KEY,
} from "./eventQueue.js";

describe("eventQueue - computeEndedBy", () => {
  it("returns completed if natural completion", () => {
    expect(computeEndedBy("completed", 120)).toBe("completed");
    expect(computeEndedBy("completed", 5)).toBe("completed");
  });

  it("returns closed on page closed/hide", () => {
    expect(computeEndedBy("closed", 15)).toBe("closed");
    expect(computeEndedBy("closed", 60)).toBe("closed");
  });

  it("marks next/previous before 30s as skipped", () => {
    expect(computeEndedBy("next", 0)).toBe("skipped");
    expect(computeEndedBy("next", 29)).toBe("skipped");
    expect(computeEndedBy("prev", 10)).toBe("skipped");
  });

  it("marks next/previous at or after 30s as switched", () => {
    expect(computeEndedBy("next", 30)).toBe("switched");
    expect(computeEndedBy("next", 45)).toBe("switched");
    expect(computeEndedBy("prev", 60)).toBe("switched");
  });
});

describe("eventQueue - Queue Storage Helpers", () => {
  it("adds items and removes items correctly", () => {
    const q1 = addToQueue([], { url: "/api/events/mood", data: { mood: "happy" } });
    expect(q1.length).toBe(1);
    expect(q1[0].data.mood).toBe("happy");
    expect(q1[0].id).toBeDefined();

    const q2 = addToQueue(q1, { url: "/api/events/play", data: { trackId: "t1" } });
    expect(q2.length).toBe(2);

    const q3 = removeFromQueue(q2, q1[0].id);
    expect(q3.length).toBe(1);
    expect(q3[0].data.trackId).toBe("t1");
  });

  it("loads and saves to mock storage", () => {
    const mockStore = {};
    const storage = {
      getItem: (key) => mockStore[key] || null,
      setItem: (key, val) => {
        mockStore[key] = val;
      },
    };

    expect(loadQueue(storage)).toEqual([]);
    saveQueue(storage, [{ id: "1", test: true }]);
    expect(JSON.parse(mockStore[QUEUE_STORAGE_KEY])).toEqual([{ id: "1", test: true }]);
    expect(loadQueue(storage)).toEqual([{ id: "1", test: true }]);
  });
});
