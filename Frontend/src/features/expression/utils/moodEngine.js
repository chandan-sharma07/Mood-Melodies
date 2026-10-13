/**
 * Pure module for mood inference and temporal stabilization.
 * No React dependencies.
 */

export const VALID_LABELS = ["happy", "sad", "angry", "neutral", "surprised"];

export const LABEL_TO_MOOD = {
  happy: "happy",
  sad: "sad",
  angry: "angry",
  neutral: "chill",
  surprised: "uplifting",
};

export const MOOD_DISPLAY = {
  happy: "Happy",
  sad: "Sad",
  angry: "Angry",
  chill: "Chill (Neutral)",
  uplifting: "Uplifting (Surprised)",
};

/**
 * Returns window size (in samples) based on sensitivity (10-100).
 * Higher sensitivity = shorter window (reacts faster).
 * At ~5 fps:
 * Sensitivity 10  -> 25 samples (~5.0s)
 * Sensitivity 60  -> 15 samples (~3.0s)
 * Sensitivity 100 -> 8 samples (~1.6s)
 */
export function getWindowSize(sensitivity = 60) {
  const s = Math.max(10, Math.min(100, Number(sensitivity) || 60));
  return Math.max(5, Math.round(25 - ((s - 10) / 90) * 17));
}

/**
 * Returns cooldown in seconds based on sensitivity (10-100).
 * Minimum cooldown is 20s as required.
 * Higher sensitivity = shorter cooldown.
 * Sensitivity 10  -> 60s
 * Sensitivity 60  -> ~38s
 * Sensitivity 100 -> 20s (minimum 20s)
 */
export function getCooldownSeconds(sensitivity = 60) {
  const s = Math.max(10, Math.min(100, Number(sensitivity) || 60));
  return Math.max(20, Math.round(60 - ((s - 10) / 90) * 40));
}

export function getCooldownMs(sensitivity = 60) {
  return getCooldownSeconds(sensitivity) * 1000;
}

/**
 * Computes whether a single label holds at least threshold (default 60%) of the window.
 * Ignores 'no_face' and invalid labels.
 * Returns the majority label if threshold is met, otherwise null.
 */
export function calculateWindowMajority(samples, threshold = 0.6, windowSize = null) {
  if (!Array.isArray(samples) || samples.length === 0) return null;

  // Filter out no_face and invalid labels
  const valid = samples.filter((s) => s && s !== "no_face" && LABEL_TO_MOOD[s]);
  if (valid.length === 0) return null;

  const denominator = windowSize && windowSize > 0 ? windowSize : valid.length;

  const counts = {};
  let maxCount = 0;
  let topLabel = null;

  for (const s of valid) {
    counts[s] = (counts[s] || 0) + 1;
    if (counts[s] > maxCount) {
      maxCount = counts[s];
      topLabel = s;
    }
  }

  // A label must hold at least 60% of the window
  if (maxCount / denominator >= threshold) {
    return topLabel;
  }
  return null;
}

export class MoodEngine {
  constructor(options = {}) {
    this.sensitivity = options.sensitivity ?? 60;
    this.currentMood = options.initialMood ?? "happy";
    this.lastChangeTime = options.initialTime ?? 0;
    this.samples = [];
    this.status = "Initializing";
  }

  setSensitivity(s) {
    this.sensitivity = Math.max(10, Math.min(100, Number(s) || 60));
    const maxWin = getWindowSize(this.sensitivity);
    if (this.samples.length > maxWin) {
      this.samples = this.samples.slice(-maxWin);
    }
  }

  getWindowSize() {
    return getWindowSize(this.sensitivity);
  }

  getCooldownSeconds() {
    return getCooldownSeconds(this.sensitivity);
  }

  /**
   * Process a single detection sample (e.g. from ~5 fps webcam feed).
   * 'no_face' never changes mood and sets status to 'No face in frame'.
   */
  processSample(label, now = Date.now()) {
    if (!label || label === "no_face") {
      this.status = "No face in frame";
      return {
        mood: this.currentMood,
        changed: false,
        status: this.status,
        candidate: null,
      };
    }

    if (!LABEL_TO_MOOD[label]) {
      return {
        mood: this.currentMood,
        changed: false,
        status: this.status,
        candidate: null,
      };
    }

    this.status = "Tracking";
    const maxWin = getWindowSize(this.sensitivity);
    this.samples.push(label);
    if (this.samples.length > maxWin) {
      this.samples.shift();
    }

    const majority = calculateWindowMajority(this.samples, 0.6, maxWin);
    if (!majority) {
      return {
        mood: this.currentMood,
        changed: false,
        status: this.status,
        candidate: null,
      };
    }

    const candidateMood = LABEL_TO_MOOD[majority];
    if (!candidateMood || candidateMood === this.currentMood) {
      return {
        mood: this.currentMood,
        changed: false,
        status: this.status,
        candidate: candidateMood || null,
      };
    }

    const cooldownMs = getCooldownMs(this.sensitivity);
    const elapsed = now - this.lastChangeTime;

    if (elapsed >= cooldownMs) {
      this.currentMood = candidateMood;
      this.lastChangeTime = now;
      return {
        mood: this.currentMood,
        changed: true,
        status: this.status,
        candidate: candidateMood,
        source: "camera",
      };
    }

    return {
      mood: this.currentMood,
      changed: false,
      status: this.status,
      candidate: candidateMood,
      inCooldown: true,
      remainingCooldown: Math.max(0, Math.round((cooldownMs - elapsed) / 1000)),
    };
  }

  /**
   * Manual override bypasses cooldown immediately.
   */
  manualOverride(mood, now = Date.now()) {
    if (!mood || mood === this.currentMood) {
      return { mood: this.currentMood, changed: false };
    }
    this.currentMood = mood;
    this.lastChangeTime = now;
    this.samples = []; // reset window on manual change
    return {
      mood: this.currentMood,
      changed: true,
      source: "manual",
      status: this.status,
    };
  }
}
