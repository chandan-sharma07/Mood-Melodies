const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false,
    },
    totalSongsPlayed: {
        type: Number,
        default: 0
    },
    favoriteMood: {
        type: String,
        default: "Neutral"
    },
    moodHistory: [
        {
            mood: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

const userModels = mongoose.model("User", userSchema);

module.exports = userModels;