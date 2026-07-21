const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    artist: {
        type: String,
        required: true,
    },
    album: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
    releaseDate: {
        type: Date,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    posterPath: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    audioTags: {
        type: Object,
        required: true,
    },
    posterUrl: {
        type: String,
        required: true,
    },
    mood: {
        type: String,
        enum: ["happy", "sad", "energetic", "chill", "romantic", "angry", "nostalgic", "motivational", "relaxing", "uplifting", "melancholic", "dreamy", "introspective", "playful", "epic", "mysterious", "sentimental", "hopeful", "dark", "whimsical", "adventurous", "triumphant", "reflective", "passionate", "serene", "dramatic", "ethereal", "haunting", "joyful", "peaceful", "romantic-comedy", "suspenseful", "uplifting-ballad"],
        message: "enum must be one of the predefined moods",
        required: true,
    },
}, { timestamps: true });   

const songModel = mongoose.model('Song', songSchema);
module.exports = songModel;