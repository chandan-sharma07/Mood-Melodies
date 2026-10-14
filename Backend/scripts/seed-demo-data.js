require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectDB = require("../src/config/database");
const User = require("../src/models/user.models");
const MoodEvent = require("../src/models/moodEvent.model");
const PlayEvent = require("../src/models/playEvent.model");

const DEMO_USER = {
  username: "demo_user",
  email: "demo@moodmelodies.com",
  passwordPlain: "demo1234",
};

const TRACK_CATALOG = [
  { trackId: "track_101", title: "Solar Resonance", artist: "Ambient Waves", mood: "chill", durationSeconds: 220 },
  { trackId: "track_102", title: "Velvet Horizon", artist: "Ambient Waves", mood: "chill", durationSeconds: 195 },
  { trackId: "track_103", title: "Golden Morning", artist: "Sunny Day Project", mood: "happy", durationSeconds: 180 },
  { trackId: "track_104", title: "Summer Breeze", artist: "Sunny Day Project", mood: "happy", durationSeconds: 210 },
  { trackId: "track_105", title: "Neon Midnight", artist: "Electric Groove", mood: "uplifting", durationSeconds: 245 },
  { trackId: "track_106", title: "Ascending Heights", artist: "Electric Groove", mood: "uplifting", durationSeconds: 205 },
  { trackId: "track_107", title: "Rain On Window", artist: "Muted Strings", mood: "sad", durationSeconds: 190 },
  { trackId: "track_108", title: "Grey Overcast", artist: "Muted Strings", mood: "sad", durationSeconds: 215 },
  { trackId: "track_109", title: "Distorted Drive", artist: "Heavy Pulse", mood: "angry", durationSeconds: 175 },
  { trackId: "track_110", title: "Iron Rhythm", artist: "Heavy Pulse", mood: "angry", durationSeconds: 185 },
];

async function seedDemoData() {
  try {
    await connectDB();
    console.log("Connected to MongoDB for demo data seeding.");

    // 1. Find or create demo user
    let user = await User.findOne({ email: DEMO_USER.email });
    if (!user) {
      const hashedPassword = await bcrypt.hash(DEMO_USER.passwordPlain, 10);
      user = await User.create({
        username: DEMO_USER.username,
        email: DEMO_USER.email,
        password: hashedPassword,
      });
      console.log(`Created new demo user: ${user.email} (${user._id})`);
    } else {
      console.log(`Found existing demo user: ${user.email} (${user._id})`);
      // Clean previous events for idempotent re-runs
      await Promise.all([
        MoodEvent.deleteMany({ user: user._id }),
        PlayEvent.deleteMany({ user: user._id }),
      ]);
      console.log("Cleared prior events for demo user.");
    }

    // 2. Generate 30 days of plausible events
    const now = new Date();
    const moodEvents = [];
    const playEvents = [];

    const moods = ["chill", "happy", "uplifting", "sad", "angry"];

    // Distribute events across past 30 days
    for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
      const dayDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      
      // 1 to 3 listening sessions per day
      const sessionsCount = (dayOffset % 5 === 0) ? 1 : (dayOffset % 2 === 0 ? 3 : 2);

      for (let s = 0; s < sessionsCount; s++) {
        // Stagger hours across the day (morning, afternoon, evening)
        const hour = 8 + (s * 5) + (dayOffset % 3);
        const minute = (dayOffset * 7 + s * 13) % 60;
        
        const eventTime = new Date(dayDate);
        eventTime.setHours(hour, minute, 0, 0);

        // Pick a mood with plausible weighting: chill and happy more frequent
        let mood = "chill";
        const roll = (dayOffset * 3 + s * 7) % 100;
        if (roll < 35) mood = "chill";
        else if (roll < 65) mood = "happy";
        else if (roll < 80) mood = "uplifting";
        else if (roll < 93) mood = "sad";
        else mood = "angry";

        // Mood Event
        moodEvents.push({
          user: user._id,
          mood,
          source: (s === 0 && dayOffset % 4 === 0) ? "manual" : "camera",
          createdAt: eventTime,
        });

        // Associated Play Event (track matching or related to the mood)
        const candidateTracks = TRACK_CATALOG.filter((t) => t.mood === mood);
        const track = candidateTracks.length > 0
          ? candidateTracks[(dayOffset + s) % candidateTracks.length]
          : TRACK_CATALOG[(dayOffset + s) % TRACK_CATALOG.length];

        const playStartTime = new Date(eventTime.getTime() + 5000); // 5s after mood detection

        // Plausible listening behavior:
        // 'sad' mood has higher skip rate (~50% skipped)
        // 'chill' and 'happy' mostly completed or switched
        let endedBy = "completed";
        let secondsListened = track.durationSeconds;

        if (mood === "sad" && (s % 2 === 0)) {
          // Skipped early (< 30s)
          secondsListened = 12 + (dayOffset % 15);
          endedBy = "skipped";
        } else if (dayOffset % 3 === 0) {
          // Switched track midway
          secondsListened = Math.round(track.durationSeconds * 0.6);
          endedBy = "switched";
        } else if (dayOffset % 7 === 0) {
          // Skipped
          secondsListened = 18;
          endedBy = "skipped";
        } else {
          // Completed
          secondsListened = track.durationSeconds;
          endedBy = "completed";
        }

        playEvents.push({
          user: user._id,
          trackId: track.trackId,
          title: track.title,
          artist: track.artist,
          mood: track.mood,
          startedAt: playStartTime,
          secondsListened,
          durationSeconds: track.durationSeconds,
          endedBy,
        });
      }
    }

    // Insert batches into MongoDB
    await Promise.all([
      MoodEvent.insertMany(moodEvents),
      PlayEvent.insertMany(playEvents),
    ]);

    console.log("==================================================");
    console.log("DEMO DATA SEEDED SUCCESSFULLY");
    console.log("==================================================");
    console.log(`User:     ${DEMO_USER.username}`);
    console.log(`Email:    ${DEMO_USER.email}`);
    console.log(`Password: ${DEMO_USER.passwordPlain}`);
    console.log(`Period:   Past 30 days`);
    console.log(`Moods:    ${moodEvents.length} events seeded`);
    console.log(`Plays:    ${playEvents.length} tracks recorded`);
    console.log("==================================================");
  } catch (err) {
    console.error("Failed to seed demo data:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

if (require.main === module) {
  seedDemoData();
}

module.exports = seedDemoData;
