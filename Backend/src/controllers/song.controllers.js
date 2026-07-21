const fs = require("fs");
const songModel = require("../models/song.model");
const storageService = require("../services/storage.service");

exports.createSong = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Audio file is required" });
        }

        const { title, artist, album, genre, releaseDate, duration, mood } = req.body;

        let url = req.body.url;
        if (!url) {
            const buffer = fs.readFileSync(req.file.path);
            url = await storageService.uploadFile({
                buffer,
                originalname: req.file.originalname,
                folder: "songs",
            });
        }

        const newSong = new songModel({
            title,
            artist,
            album,
            genre,
            releaseDate,
            duration,
            filePath: req.file.path,
            posterPath: req.body.posterPath,
            url,
            audioTags: req.body.audioTags || {},
            posterUrl: req.body.posterUrl || "https://via.placeholder.com/150",
            mood: mood || "happy",
        });

        await newSong.save();
        res.status(201).json(newSong);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllSongs = async (req, res) => {
    try {
        const songs = await songModel.find();
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSongById = async (req, res) => {
    try {
        const song = await songModel.findById(req.params.id);
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }
        res.status(200).json(song);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSong = async (req, res) => {
    try {
        const { title, artist, album, genre, releaseDate, duration } = req.body;
        const updates = {
            title,
            artist,
            album,
            genre,
            releaseDate,
            duration,
        };

        if (req.body.posterPath) updates.posterPath = req.body.posterPath;
        if (req.body.audioTags) updates.audioTags = req.body.audioTags;
        if (req.body.posterUrl) updates.posterUrl = req.body.posterUrl;
        if (req.body.mood) updates.mood = req.body.mood;
        if (req.body.url) updates.url = req.body.url;

        if (req.file) {
            const buffer = fs.readFileSync(req.file.path);
            updates.url = await storageService.uploadFile({
                buffer,
                originalname: req.file.originalname,
                folder: "songs",
            });
            updates.filePath = req.file.path;
        }

        const updatedSong = await songModel.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!updatedSong) {
            return res.status(404).json({ message: "Song not found" });
        }
        res.status(200).json(updatedSong);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteSong = async (req, res) => {
    try {
        const deletedSong = await songModel.findByIdAndDelete(req.params.id);
        if (!deletedSong) {
            return res.status(404).json({ message: "Song not found" });
        }
        res.status(200).json({ message: "Song deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
