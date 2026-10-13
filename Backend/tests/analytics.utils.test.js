const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  parseRange,
  isValidTimeZone,
  formatDateInTimeZone,
  zeroFillDailyListening,
} = require("../src/utils/analytics.utils");

describe("analytics pure helpers", () => {
  it("parses supported ranges as inclusive local calendar days", () => {
    const now = new Date("2026-10-13T10:00:00.000Z");
    const sevenDays = parseRange("7d", now, "Asia/Kolkata");
    assert.equal(sevenDays.days, 7);
    assert.equal(sevenDays.startDay, "2026-10-07");
    assert.equal(sevenDays.endDay, "2026-10-13");
    assert.equal(formatDateInTimeZone(sevenDays.from, "Asia/Kolkata"), sevenDays.startDay);
    assert.equal(new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata", hour: "2-digit", hourCycle: "h23",
    }).format(sevenDays.from), "00");

    assert.equal(parseRange("30d", now, "UTC").days, 30);
    assert.equal(parseRange("90d", now, "UTC").days, 90);
    assert.throws(() => parseRange("14d", now, "UTC"), /Range must be/);
  });

  it("validates IANA time zones safely", () => {
    assert.equal(isValidTimeZone("Asia/Kolkata"), true);
    assert.equal(isValidTimeZone("UTC"), true);
    assert.equal(isValidTimeZone("Not/A-Timezone"), false);
    assert.equal(isValidTimeZone(""), false);
    assert.equal(isValidTimeZone(null), false);
    assert.throws(() => parseRange("7d", new Date(), "Bad/Zone"), /time zone/);
  });

  it("zero-fills missing days and rounds minutes to one decimal", () => {
    const result = zeroFillDailyListening(
      [
        { date: "2026-10-11", minutes: 1.26 },
        { date: "2026-10-13", minutes: 2 },
      ],
      "2026-10-11",
      "2026-10-13"
    );

    assert.deepEqual(result, [
      { date: "2026-10-11", minutes: 1.3 },
      { date: "2026-10-12", minutes: 0 },
      { date: "2026-10-13", minutes: 2 },
    ]);
  });

  it("adds duplicate daily rows and rejects an inverted fill range", () => {
    assert.deepEqual(
      zeroFillDailyListening(
        [
          { date: "2026-10-11", minutes: 1 },
          { date: "2026-10-11", minutes: 2 },
        ],
        "2026-10-11",
        "2026-10-11"
      ),
      [{ date: "2026-10-11", minutes: 3 }]
    );
    assert.throws(
      () => zeroFillDailyListening([], "2026-10-13", "2026-10-11"),
      /Start date/
    );
  });
});
