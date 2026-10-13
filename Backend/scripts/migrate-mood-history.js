require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const connectDB = require("../src/config/database");
const User = require("../src/models/user.models");
const MoodEvent = require("../src/models/moodEvent.model");

async function migrate() {
  try {
    await connectDB();
    console.log("Connected to MongoDB for migration");

    const users = await User.find({ "moodHistory.0": { $exists: true } });
    console.log(`Found ${users.length} users with mood history entries.`);

    let totalMigrated = 0;
    let totalSkipped = 0;

    for (const user of users) {
      if (!Array.isArray(user.moodHistory)) continue;

      for (const entry of user.moodHistory) {
        if (!entry.mood) continue;
        const entryTime = entry.timestamp ? new Date(entry.timestamp) : new Date();

        // Idempotency check: see if MoodEvent already exists with same user, timestamp, and mood
        const exists = await MoodEvent.findOne({
          user: user._id,
          createdAt: entryTime,
          mood: entry.mood,
        });

        if (exists) {
          totalSkipped++;
          continue;
        }

        await MoodEvent.create({
          user: user._id,
          mood: entry.mood,
          source: entry.source === "manual" ? "manual" : "camera",
          createdAt: entryTime,
        });
        totalMigrated++;
      }
    }

    console.log(`Migration complete: ${totalMigrated} mood events migrated, ${totalSkipped} already existed.`);
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
