export const MOOD_COLORS = {
  happy: "#c58b1f",
  sad: "#3f6fa6",
  angry: "#b24a3a",
  uplifting: "#7a62a8",
  chill: "#8a8982",
};

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const FULL_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function getMoodColor(mood) {
  if (!mood) return "#8a8982";
  const norm = String(mood).toLowerCase().trim();
  return MOOD_COLORS[norm] || "#8a8982";
}

export function formatListeningTime(minutes) {
  const m = Number(minutes);
  if (!m || m <= 0) return "0 min";
  if (m < 60) {
    return `${Math.round(m)} min`;
  }
  const hrs = Math.floor(m / 60);
  const rem = Math.round(m % 60);
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export function buildInsightSentence(tracksPlayed, skipRateByMood) {
  const count = Number(tracksPlayed) || 0;
  if (count < 20) {
    return `Not enough data yet (${count} of 20 plays).`;
  }

  if (!Array.isArray(skipRateByMood) || skipRateByMood.length === 0) {
    return "No skip patterns detected yet.";
  }

  const active = skipRateByMood.filter((m) => (m.plays || 0) > 0);
  if (active.length === 0) {
    return "No skip patterns detected yet.";
  }

  const sorted = [...active].sort((a, b) => {
    if (b.skipRate !== a.skipRate) {
      return (b.skipRate || 0) - (a.skipRate || 0);
    }
    return (b.plays || 0) - (a.plays || 0);
  });

  const top = sorted[0];
  const rate = Math.round(top.skipRate || 0);
  return `You skip '${top.mood}' recommendations most (${rate}% of plays).`;
}

export function getGridCellOpacity(count, maxCount) {
  if (!count || count <= 0) return 0;
  if (!maxCount || maxCount <= 0) return 0.35;
  const ratio = Math.min(1, count / maxCount);
  return Number((0.25 + 0.75 * ratio).toFixed(2));
}

export function prepareMoodByHourGrid(moodByHour = []) {
  let maxCount = 0;
  const lookup = {};

  if (Array.isArray(moodByHour)) {
    for (const item of moodByHour) {
      const key = `${item.weekday}-${item.hour}`;
      lookup[key] = item;
      if (item.count > maxCount) {
        maxCount = item.count;
      }
    }
  }

  const grid = [];
  for (let weekday = 0; weekday < 7; weekday++) {
    const hours = [];
    for (let hour = 0; hour < 24; hour++) {
      const match = lookup[`${weekday}-${hour}`];
      hours.push({
        weekday,
        hour,
        dayName: DAYS_OF_WEEK[weekday],
        fullDayName: FULL_DAYS[weekday],
        dominantMood: match?.dominantMood || null,
        count: match?.count || 0,
        opacity: match ? getGridCellOpacity(match.count, maxCount) : 0,
      });
    }
    grid.push({
      weekday,
      dayName: DAYS_OF_WEEK[weekday],
      fullDayName: FULL_DAYS[weekday],
      hours,
    });
  }

  return { grid, maxCount };
}
