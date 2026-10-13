const mongoose = require("mongoose");

const moodEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ["camera", "manual"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

moodEventSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("MoodEvent", moodEventSchema);
