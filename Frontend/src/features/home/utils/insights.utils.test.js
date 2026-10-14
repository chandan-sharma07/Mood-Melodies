import { describe, it, expect } from "vitest";
import {
  MOOD_COLORS,
  getMoodColor,
  formatListeningTime,
  buildInsightSentence,
  getGridCellOpacity,
  prepareMoodByHourGrid,
} from "./insights.utils";

describe("insights.utils pure functions", () => {
  describe("getMoodColor", () => {
    it("returns exact colors defined in specifications", () => {
      expect(getMoodColor("happy")).toBe("#c58b1f");
      expect(getMoodColor("sad")).toBe("#3f6fa6");
      expect(getMoodColor("angry")).toBe("#b24a3a");
      expect(getMoodColor("uplifting")).toBe("#7a62a8");
      expect(getMoodColor("chill")).toBe("#8a8982");
      expect(getMoodColor("neutral")).toBe("#8a8982");
      expect(getMoodColor("unknown_mood")).toBe("#8a8982");
      expect(getMoodColor(null)).toBe("#8a8982");
    });
  });

  describe("formatListeningTime", () => {
    it("formats minutes cleanly into minutes or hours and minutes", () => {
      expect(formatListeningTime(0)).toBe("0 min");
      expect(formatListeningTime(45)).toBe("45 min");
      expect(formatListeningTime(60)).toBe("1h");
      expect(formatListeningTime(125)).toBe("2h 5m");
      expect(formatListeningTime(120)).toBe("2h");
    });
  });

  describe("buildInsightSentence", () => {
    it("returns 'Not enough data yet' when tracksPlayed is under 20", () => {
      expect(buildInsightSentence(0, [])).toBe("Not enough data yet (0 of 20 plays).");
      expect(buildInsightSentence(19, [{ mood: "sad", plays: 10, skipRate: 40 }])).toBe(
        "Not enough data yet (19 of 20 plays)."
      );
    });

    it("returns formatted sentence when tracksPlayed is at least 20", () => {
      const skipData = [
        { mood: "happy", plays: 8, skipRate: 12.5 },
        { mood: "sad", plays: 12, skipRate: 41.2 },
        { mood: "chill", plays: 5, skipRate: 20 },
      ];
      expect(buildInsightSentence(25, skipData)).toBe(
        "You skip 'sad' recommendations most (41% of plays)."
      );
    });

    it("handles tie in skipRate by picking higher plays", () => {
      const skipData = [
        { mood: "angry", plays: 10, skipRate: 50 },
        { mood: "uplifting", plays: 4, skipRate: 50 },
      ];
      expect(buildInsightSentence(20, skipData)).toBe(
        "You skip 'angry' recommendations most (50% of plays)."
      );
    });

    it("handles empty skip list when plays >= 20", () => {
      expect(buildInsightSentence(25, [])).toBe("No skip patterns detected yet.");
    });
  });

  describe("getGridCellOpacity", () => {
    it("returns 0 for zero or negative counts", () => {
      expect(getGridCellOpacity(0, 10)).toBe(0);
      expect(getGridCellOpacity(-1, 10)).toBe(0);
    });

    it("scales opacity between 0.25 and 1 based on count ratio", () => {
      expect(getGridCellOpacity(10, 10)).toBe(1);
      expect(getGridCellOpacity(5, 10)).toBe(0.63);
      expect(getGridCellOpacity(1, 10)).toBe(0.33);
    });
  });

  describe("prepareMoodByHourGrid", () => {
    it("creates a 7x24 grid with 168 cells", () => {
      const sampleData = [
        { weekday: 1, hour: 14, dominantMood: "chill", count: 5 },
        { weekday: 3, hour: 9, dominantMood: "happy", count: 2 },
      ];

      const { grid, maxCount } = prepareMoodByHourGrid(sampleData);
      expect(maxCount).toBe(5);
      expect(grid).toHaveLength(7);

      let totalCells = 0;
      grid.forEach((dayRow) => {
        expect(dayRow.hours).toHaveLength(24);
        totalCells += dayRow.hours.length;
      });
      expect(totalCells).toBe(168);

      // Check matched cell: Monday (weekday 1), 14:00
      const monday = grid[1];
      const hour14 = monday.hours[14];
      expect(hour14.dominantMood).toBe("chill");
      expect(hour14.count).toBe(5);
      expect(hour14.opacity).toBe(1);

      // Check empty cell
      const hour0 = monday.hours[0];
      expect(hour0.dominantMood).toBeNull();
      expect(hour0.count).toBe(0);
      expect(hour0.opacity).toBe(0);
    });
  });
});
