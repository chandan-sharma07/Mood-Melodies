const mongoose = require("mongoose");
const { z } = require("zod");
const MoodEvent = require("../models/moodEvent.model");
const PlayEvent = require("../models/playEvent.model");
const {
  isValidTimeZone,
  parseRange,
  zeroFillDailyListening,
} = require("../utils/analytics.utils");

const summaryQuerySchema = z.object({
  range: z.enum(["7d", "30d", "90d"]).default("7d"),
  tz: z.string().default("UTC").refine(isValidTimeZone, "Invalid IANA time zone"),
});

async function getAnalyticsSummary(req, res) {
  const parsed = summaryQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message || "Invalid analytics query parameters",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(req.user?.id)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { range, tz } = parsed.data;
    const bounds = parseRange(range, new Date(), tz);
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Keep the indexed user/date match first in each pipeline.
    const playMatch = {
      user: userId,
      startedAt: { $gte: bounds.from, $lte: bounds.to },
    };
    const moodMatch = {
      user: userId,
      createdAt: { $gte: bounds.from, $lte: bounds.to },
    };

    const [playFacets, moodDistribution, moodByHour] = await Promise.all([
      PlayEvent.aggregate([
        { $match: playMatch },
        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,
                  tracksPlayed: { $sum: 1 },
                  totalSeconds: { $sum: { $ifNull: ["$secondsListened", 0] } },
                  skipped: {
                    $sum: {
                      $cond: [{ $eq: ["$endedBy", "skipped"] }, 1, 0],
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  tracksPlayed: 1,
                  minutesListened: { $round: [{ $divide: ["$totalSeconds", 60] }, 1] },
                  skipRate: {
                    $round: [
                      { $multiply: [{ $divide: ["$skipped", "$tracksPlayed"] }, 100] },
                      1,
                    ],
                  },
                },
              },
            ],
            dailyListening: [
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$startedAt",
                      timezone: tz,
                    },
                  },
                  seconds: { $sum: { $ifNull: ["$secondsListened", 0] } },
                },
              },
              {
                $project: {
                  _id: 0,
                  date: "$_id",
                  minutes: { $round: [{ $divide: ["$seconds", 60] }, 1] },
                },
              },
              { $sort: { date: 1 } },
            ],
            skipRateByMood: [
              {
                $group: {
                  _id: { $ifNull: ["$mood", "neutral"] },
                  plays: { $sum: 1 },
                  skipped: {
                    $sum: {
                      $cond: [{ $eq: ["$endedBy", "skipped"] }, 1, 0],
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  mood: "$_id",
                  plays: 1,
                  skipRate: {
                    $round: [
                      { $multiply: [{ $divide: ["$skipped", "$plays"] }, 100] },
                      1,
                    ],
                  },
                },
              },
              { $sort: { plays: -1, mood: 1 } },
            ],
            topArtists: [
              {
                $group: {
                  _id: { $ifNull: ["$artist", "Unknown"] },
                  plays: { $sum: 1 },
                },
              },
              { $sort: { plays: -1, _id: 1 } },
              { $limit: 5 },
              { $project: { _id: 0, artist: "$_id", plays: 1 } },
            ],
          },
        },
      ]),
      MoodEvent.aggregate([
        { $match: moodMatch },
        { $group: { _id: "$mood", count: { $sum: 1 } } },
        {
          $group: {
            _id: null,
            total: { $sum: "$count" },
            moods: { $push: { mood: "$_id", count: "$count" } },
          },
        },
        { $unwind: "$moods" },
        {
          $project: {
            _id: 0,
            mood: "$moods.mood",
            count: "$moods.count",
            share: {
              $round: [
                { $multiply: [{ $divide: ["$moods.count", "$total"] }, 100] },
                1,
              ],
            },
          },
        },
        { $sort: { count: -1, mood: 1 } },
      ]),
      MoodEvent.aggregate([
        { $match: moodMatch },
        {
          $addFields: {
            timeParts: { $dateToParts: { date: "$createdAt", timezone: tz } },
          },
        },
        {
          $group: {
            _id: {
              weekday: { $subtract: ["$timeParts.dayOfWeek", 1] },
              hour: "$timeParts.hour",
              mood: "$mood",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1, "_id.mood": 1 } },
        {
          $group: {
            _id: { weekday: "$_id.weekday", hour: "$_id.hour" },
            dominantMood: { $first: "$_id.mood" },
            count: { $first: "$count" },
          },
        },
        {
          $project: {
            _id: 0,
            weekday: "$_id.weekday",
            hour: "$_id.hour",
            dominantMood: 1,
            count: 1,
          },
        },
        { $sort: { weekday: 1, hour: 1 } },
      ]),
    ]);

    const playSummary = playFacets[0] || {};
    const rawTotals = (playSummary.totals || [])[0] || {};
    const totals = {
      tracksPlayed: rawTotals.tracksPlayed || 0,
      minutesListened: rawTotals.minutesListened || 0,
      mostFrequentMood: moodDistribution[0]?.mood || null,
      // Percentage in the 0–100 range, not a fraction.
      skipRate: rawTotals.skipRate || 0,
    };

    return res.status(200).json({
      totals,
      moodDistribution,
      moodByHour,
      dailyListening: zeroFillDailyListening(
        playSummary.dailyListening || [],
        bounds.startDay,
        bounds.endDay
      ),
      skipRateByMood: playSummary.skipRateByMood || [],
      topArtists: playSummary.topArtists || [],
    });
  } catch {
    console.error("getAnalyticsSummary failed");
    return res.status(500).json({ error: "Failed to fetch analytics summary" });
  }
}

module.exports = { getAnalyticsSummary };
