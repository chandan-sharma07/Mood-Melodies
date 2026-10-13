/**
 * Pure functions for event queuing and play transition tracking.
 */

export const QUEUE_STORAGE_KEY = "mm_offline_event_queue";

/**
 * Resolves the endedBy label based on reason and seconds listened.
 * Requirement: Next/previous before 30 s listened counts as endedBy "skipped".
 */
export function computeEndedBy(reason, secondsListened = 0) {
  if (reason === "completed") {
    return "completed";
  }
  if (reason === "closed") {
    return "closed";
  }
  if (reason === "next" || reason === "prev" || reason === "skipped" || reason === "switched") {
    return secondsListened < 30 ? "skipped" : "switched";
  }
  return secondsListened < 30 ? "skipped" : "switched";
}

export function addToQueue(queue = [], eventItem) {
  const item = {
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    ...eventItem,
  };
  // Cap at 100 queued events to prevent storage bloat
  const updated = [...queue, item];
  return updated.slice(-100);
}

export function removeFromQueue(queue = [], itemId) {
  return queue.filter((item) => item.id !== itemId);
}

export function loadQueue(storage = (typeof window !== "undefined" ? window.localStorage : null)) {
  if (!storage) return [];
  try {
    const raw = storage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveQueue(storage = (typeof window !== "undefined" ? window.localStorage : null), queue = []) {
  if (!storage) return;
  try {
    storage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn("Failed to persist event queue to storage:", e);
  }
}
