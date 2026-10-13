const { z } = require("zod");
const mongoose = require("mongoose");
const MoodEvent = require("../models/moodEvent.model");
const PlayEvent = require("../models/playEvent.model");
const { formatEventsCsv } = require("../utils/csv.utils");

const moodSchema = z.object({
  mood: z.string().min(1, "Mood is required"),
  source: z.enum(["camera", "manual"], {
    errorMap: () => ({ message: "Source must be 'camera' or 'manual'" }),
  }),
});

const playStartSchema = z.object({
  trackId: z.string().min(1, "Track ID is required"),
  title: z.string().min(1, "Title is required"),
  artist: z.string().optional().default("Unknown"),
  mood: z.string().optional().default("happy"),
  durationSeconds: z.coerce.number().nonnegative().optional().default(0),
});

const playEndSchema = z.object({
  secondsListened: z.coerce.number().nonnegative("Seconds listened must be non-negative"),
  endedBy: z.enum(["completed", "skipped", "switched", "closed"], {
    errorMap: () => ({
      message: "endedBy must be 'completed', 'skipped', 'switched', or 'closed'",
    }),
  }),
});

const historyQuerySchema = z.object({
  type: z.enum(["mood", "play"]).default("play"),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const deleteConfirmSchema = z.object({
  confirm: z.union([z.literal(true), z.literal("true")]),
});

exports.logMoodEvent = async (req, res) => {
  try {
    const parseResult = moodSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0]?.message || "Invalid input" });
    }

    const { mood, source } = parseResult.data;
    const event = await MoodEvent.create({
      user: req.user.id,
      mood,
      source,
      createdAt: new Date(),
    });

    return res.status(201).json(event);
  } catch (err) {
    console.error("logMoodEvent error:", err);
    return res.status(500).json({ error: "Failed to record mood event" });
  }
};

exports.startPlayEvent = async (req, res) => {
  try {
    const parseResult = playStartSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0]?.message || "Invalid input" });
    }

    const { trackId, title, artist, mood, durationSeconds } = parseResult.data;
    const event = await PlayEvent.create({
      user: req.user.id,
      trackId,
      title,
      artist,
      mood,
      durationSeconds,
      startedAt: new Date(),
    });

    return res.status(201).json(event);
  } catch (err) {
    console.error("startPlayEvent error:", err);
    return res.status(500).json({ error: "Failed to start play event" });
  }
};

exports.endPlayEvent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid play event ID" });
    }

    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (_) {
        // continue with raw body
      }
    }

    const parseResult = playEndSchema.safeParse(body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0]?.message || "Invalid input" });
    }

    const { secondsListened, endedBy } = parseResult.data;
    const event = await PlayEvent.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!event) {
      return res.status(404).json({ error: "Play event not found" });
    }

    event.secondsListened = secondsListened;
    event.endedBy = endedBy;
    await event.save();

    return res.status(200).json(event);
  } catch (err) {
    console.error("endPlayEvent error:", err);
    return res.status(500).json({ error: "Failed to end play event" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const parseResult = historyQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0]?.message || "Invalid query parameters" });
    }

    const { type, from, to, page, limit } = parseResult.data;
    const skip = (page - 1) * limit;

    if (type === "mood") {
      const filter = { user: req.user.id };
      if (from || to) {
        filter.createdAt = {};
        if (from) filter.createdAt.$gte = new Date(from);
        if (to) filter.createdAt.$lte = new Date(to);
      }

      const [events, total] = await Promise.all([
        MoodEvent.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        MoodEvent.countDocuments(filter),
      ]);

      return res.status(200).json({
        events,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      });
    }

    // type === "play"
    const filter = { user: req.user.id };
    if (from || to) {
      filter.startedAt = {};
      if (from) filter.startedAt.$gte = new Date(from);
      if (to) filter.startedAt.$lte = new Date(to);
    }

    const [events, total] = await Promise.all([
      PlayEvent.find(filter).sort({ startedAt: -1 }).skip(skip).limit(limit).lean(),
      PlayEvent.countDocuments(filter),
    ]);

    return res.status(200).json({
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    console.error("getHistory error:", err);
    return res.status(500).json({ error: "Failed to fetch event history" });
  }
};

exports.exportEventsCsv = async (req, res) => {
  try {
    const [moodEvents, playEvents] = await Promise.all([
      MoodEvent.find({ user: req.user.id }).sort({ createdAt: -1 }).lean(),
      PlayEvent.find({ user: req.user.id }).sort({ startedAt: -1 }).lean(),
    ]);

    const csvData = formatEventsCsv(moodEvents, playEvents);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="events.csv"');
    return res.status(200).send(csvData);
  } catch (err) {
    console.error("exportEventsCsv error:", err);
    return res.status(500).json({ error: "Failed to export events" });
  }
};

exports.deleteUserEvents = async (req, res) => {
  try {
    const payload = {
      confirm: req.body?.confirm ?? req.query?.confirm,
    };

    const parseResult = deleteConfirmSchema.safeParse(payload);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Confirmation required to delete all events (confirm=true)",
      });
    }

    await Promise.all([
      MoodEvent.deleteMany({ user: req.user.id }),
      PlayEvent.deleteMany({ user: req.user.id }),
    ]);

    return res.status(200).json({
      message: "All user events deleted successfully",
    });
  } catch (err) {
    console.error("deleteUserEvents error:", err);
    return res.status(500).json({ error: "Failed to delete user events" });
  }
};
