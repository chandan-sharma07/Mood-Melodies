const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { escapeCsvField, formatEventsCsv } = require("../src/utils/csv.utils");

describe("CSV Utility pure functions", () => {
  it("escapes fields correctly", () => {
    assert.equal(escapeCsvField("simple"), '"simple"');
    assert.equal(escapeCsvField('with "quotes"'), '"with ""quotes"""');
    assert.equal(escapeCsvField("with, comma"), '"with, comma"');
    assert.equal(escapeCsvField(null), '""');
    assert.equal(escapeCsvField(123), '"123"');
  });

  it("formats mixed events sorted by timestamp descending", () => {
    const moodEvents = [
      {
        mood: "happy",
        source: "camera",
        createdAt: new Date("2026-10-10T12:00:00Z"),
      },
    ];
    const playEvents = [
      {
        trackId: "track_1",
        title: "Song One",
        artist: "Artist A",
        mood: "happy",
        startedAt: new Date("2026-10-10T12:05:00Z"),
        secondsListened: 120,
        durationSeconds: 180,
        endedBy: "completed",
      },
    ];

    const csv = formatEventsCsv(moodEvents, playEvents);
    const lines = csv.split("\r\n");

    assert.equal(lines.length, 3);
    // Header
    assert.ok(lines[0].includes("Type"));
    assert.ok(lines[0].includes("EndedBy"));
    // First row should be play (12:05:00)
    assert.ok(lines[1].includes('"play"'));
    assert.ok(lines[1].includes('"Song One"'));
    assert.ok(lines[1].includes('"completed"'));
    // Second row should be mood (12:00:00)
    assert.ok(lines[2].includes('"mood"'));
    assert.ok(lines[2].includes('"happy"'));
    assert.ok(lines[2].includes('"camera"'));
  });
});
