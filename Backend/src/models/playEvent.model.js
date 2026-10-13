const mongoose = require("mongoose");

const playEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trackId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      default: "Unknown",
    },
    mood: {
      type: String,
      default: "happy",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    secondsListened: {
      type: Number,
      default: 0,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    endedBy: {
      type: String,
      enum: ["completed", "skipped", "switched", "closed", null],
      default: null,
    },
  },
  {
    versionKey: false,
  }
);

playEventSchema.index({ user: 1, startedAt: -1 });

module.exports = mongoose.model("PlayEvent", playEventSchema);
