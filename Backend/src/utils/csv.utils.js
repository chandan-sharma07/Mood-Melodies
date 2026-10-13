/**
 * Pure functions for CSV formatting of events.
 */

function escapeCsvField(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function formatEventsCsv(moodEvents = [], playEvents = []) {
  const headers = [
    "Type",
    "Timestamp",
    "Mood",
    "Source",
    "TrackId",
    "Title",
    "Artist",
    "SecondsListened",
    "DurationSeconds",
    "EndedBy",
  ];

  const rows = [];
  rows.push(headers.map(escapeCsvField).join(","));

  const normalized = [];

  for (const m of moodEvents) {
    const time = m.createdAt ? new Date(m.createdAt) : new Date();
    normalized.push({
      time,
      row: [
        "mood",
        time.toISOString(),
        m.mood || "",
        m.source || "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
    });
  }

  for (const p of playEvents) {
    const time = p.startedAt ? new Date(p.startedAt) : new Date();
    normalized.push({
      time,
      row: [
        "play",
        time.toISOString(),
        p.mood || "",
        "",
        p.trackId || "",
        p.title || "",
        p.artist || "",
        p.secondsListened ?? 0,
        p.durationSeconds ?? 0,
        p.endedBy || "",
      ],
    });
  }

  // Sort descending by timestamp
  normalized.sort((a, b) => b.time.getTime() - a.time.getTime());

  for (const item of normalized) {
    rows.push(item.row.map(escapeCsvField).join(","));
  }

  return rows.join("\r\n");
}

module.exports = {
  escapeCsvField,
  formatEventsCsv,
};
