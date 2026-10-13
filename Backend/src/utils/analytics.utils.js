const RANGE_DAYS = Object.freeze({
  "7d": 7,
  "30d": 30,
  "90d": 90,
});

function isValidTimeZone(timeZone) {
  if (typeof timeZone !== "string" || !timeZone.trim()) return false;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date(0));
    return true;
  } catch {
    return false;
  }
}

function getDateTimeParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  );
}

function formatDateInTimeZone(date, timeZone) {
  const parts = getDateTimeParts(date, timeZone);
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function parseDateOnly(dateString) {
  if (typeof dateString !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new RangeError("Date must use YYYY-MM-DD format");
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError("Invalid calendar date");
  }

  return { year, month, day };
}

function addCalendarDays(dateString, amount) {
  const { year, month, day } = parseDateOnly(dateString);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return `${String(date.getUTCFullYear()).padStart(4, "0")}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function startOfDayUtc(dateString, timeZone) {
  const { year, month, day } = parseDateOnly(dateString);
  const targetLocalAsUtc = Date.UTC(year, month - 1, day, 0, 0, 0);
  let guess = targetLocalAsUtc;

  // Resolve local midnight to UTC without a date/time dependency.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = getDateTimeParts(new Date(guess), timeZone);
    const seenLocalAsUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second
    );
    const adjustment = targetLocalAsUtc - seenLocalAsUtc;
    guess += adjustment;
    if (adjustment === 0) break;
  }

  return new Date(guess);
}

function parseRange(range, now = new Date(), timeZone = "UTC") {
  const days = RANGE_DAYS[range];
  if (!days) throw new RangeError("Range must be 7d, 30d, or 90d");
  if (!isValidTimeZone(timeZone)) throw new RangeError("Invalid IANA time zone");

  const end = now instanceof Date ? new Date(now.getTime()) : new Date(now);
  if (Number.isNaN(end.getTime())) throw new RangeError("Invalid current date");

  const endDay = formatDateInTimeZone(end, timeZone);
  const startDay = addCalendarDays(endDay, 1 - days);
  const from = startOfDayUtc(startDay, timeZone);

  return {
    range,
    days,
    from,
    to: end,
    startDay,
    endDay,
  };
}

function zeroFillDailyListening(rows, startDay, endDay) {
  parseDateOnly(startDay);
  parseDateOnly(endDay);
  if (startDay > endDay) throw new RangeError("Start date must be on or before end date");

  const minutesByDay = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    if (!row || typeof row.date !== "string") continue;
    parseDateOnly(row.date);
    const minutes = Number(row.minutes);
    if (!Number.isFinite(minutes)) continue;
    minutesByDay.set(row.date, (minutesByDay.get(row.date) || 0) + minutes);
  }

  const filled = [];
  for (let date = startDay; date <= endDay; date = addCalendarDays(date, 1)) {
    const minutes = minutesByDay.get(date) || 0;
    filled.push({ date, minutes: Number(minutes.toFixed(1)) });
  }

  return filled;
}

module.exports = {
  RANGE_DAYS,
  isValidTimeZone,
  formatDateInTimeZone,
  parseRange,
  zeroFillDailyListening,
};
