import { describe, it, expect } from "vitest";
import {
  calculateWindowMajority,
  getWindowSize,
  getCooldownSeconds,
  MoodEngine,
} from "./moodEngine.js";

describe("moodEngine - Window Majority", () => {
  it("detects majority when a label holds at least 60% of the window", () => {
    // 3 out of 5 = 60%
    const samples = ["happy", "happy", "happy", "sad", "sad"];
    expect(calculateWindowMajority(samples, 0.6)).toBe("happy");
  });

  it("returns null when no label holds at least 60%", () => {
    // 2 happy (40%), 2 sad (40%), 1 neutral (20%)
    const samples = ["happy", "happy", "sad", "sad", "neutral"];
    expect(calculateWindowMajority(samples, 0.6)).toBe(null);
  });

  it("returns null for empty samples", () => {
    expect(calculateWindowMajority([])).toBe(null);
    expect(calculateWindowMajority(null)).toBe(null);
  });

  it("MoodEngine keeps previous mood when no label achieves 60% majority", () => {
    const engine = new MoodEngine({ sensitivity: 100, initialMood: "happy", initialTime: 0 });
    // Window size at 100 is 8 samples
    // Feed mixed samples
    engine.processSample("sad", 1000);
    engine.processSample("neutral", 1200);
    engine.processSample("angry", 1400);
    const res = engine.processSample("happy", 1600);

    expect(res.changed).toBe(false);
    expect(res.mood).toBe("happy");
  });
});

describe("moodEngine - Cooldown & Manual Override", () => {
  it("enforces minimum 20s cooldown between automatic mood changes", () => {
    const engine = new MoodEngine({ sensitivity: 100, initialMood: "happy", initialTime: 0 });
    // Window size at 100 is 8 samples. Cooldown at 100 is 20s = 20000ms.
    const t0 = 100000;

    // First 4 'sad' samples: 4/8 = 50% < 60% -> does not change yet
    for (let i = 0; i < 4; i++) {
      const res = engine.processSample("sad", t0 + i * 200);
      expect(res.changed).toBe(false);
    }
    // 5th 'sad' sample reaches 5/8 = 62.5% >= 60% -> triggers mood change!
    const changeRes = engine.processSample("sad", t0 + 4 * 200);
    expect(changeRes.changed).toBe(true);
    expect(changeRes.mood).toBe("sad");

    // Feed 8 'angry' samples 5 seconds later (well within 20s cooldown)
    const t1 = t0 + 5000;
    let blockedRes;
    for (let i = 0; i < 8; i++) {
      blockedRes = engine.processSample("angry", t1 + i * 200);
    }
    expect(blockedRes.changed).toBe(false);
    expect(blockedRes.mood).toBe("sad"); // retains 'sad'
    expect(blockedRes.inCooldown).toBe(true);

    // Feed 'angry' samples after cooldown (25s later)
    const t2 = t0 + 1400 + 21000;
    let triggered = false;
    for (let i = 0; i < 8; i++) {
      const res = engine.processSample("angry", t2 + i * 200);
      if (res.changed) triggered = true;
    }
    expect(triggered).toBe(true);
    expect(engine.currentMood).toBe("angry");
  });

  it("manual override bypasses cooldown immediately", () => {
    const engine = new MoodEngine({ sensitivity: 60, initialMood: "happy", initialTime: Date.now() });

    // Manually override to 'chill' immediately
    const res = engine.manualOverride("chill");
    expect(res.changed).toBe(true);
    expect(res.mood).toBe("chill");
    expect(res.source).toBe("manual");
    expect(engine.currentMood).toBe("chill");
  });
});

describe("moodEngine - No-face Ignored", () => {
  it("never changes mood on no_face sample and sets status to 'No face in frame'", () => {
    const engine = new MoodEngine({ sensitivity: 60, initialMood: "happy" });

    const res = engine.processSample("no_face");
    expect(res.changed).toBe(false);
    expect(res.mood).toBe("happy");
    expect(res.status).toBe("No face in frame");
  });

  it("ignores no_face in window majority calculations", () => {
    const samples = ["happy", "happy", "happy", "no_face", "no_face"];
    // 3 happy out of 3 valid = 100% majority
    expect(calculateWindowMajority(samples, 0.6)).toBe("happy");

    const onlyNoFace = ["no_face", "no_face", "no_face"];
    expect(calculateWindowMajority(onlyNoFace, 0.6)).toBe(null);
  });
});

describe("moodEngine - Sensitivity Effect", () => {
  it("higher sensitivity yields shorter window and shorter cooldown", () => {
    const winLow = getWindowSize(10);
    const winHigh = getWindowSize(100);
    expect(winHigh).toBeLessThan(winLow);

    const cdLow = getCooldownSeconds(10);
    const cdHigh = getCooldownSeconds(100);
    expect(cdHigh).toBeLessThan(cdLow);
  });

  it("cooldown is at least 20 seconds at maximum sensitivity", () => {
    expect(getCooldownSeconds(100)).toBeGreaterThanOrEqual(20);
    expect(getCooldownSeconds(50)).toBeGreaterThanOrEqual(20);
    expect(getCooldownSeconds(10)).toBeGreaterThanOrEqual(20);
  });
});
