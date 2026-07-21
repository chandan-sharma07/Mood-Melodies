const express = require("express");
const router = express.Router();
const songController = require("../controllers/song.controllers");
const jamendoController = require("../controllers/jamendo.controller");
const authMiddleware = require("../middlewares/auth.middlewares");
const uploadMiddleware = require("../middlewares/upload.middlewares");


router.post("/", authMiddleware, uploadMiddleware.single("file"), songController.createSong);
router.get("/stream", jamendoController.streamSongs); // <-- Jamendo streaming API
router.get("/", songController.getAllSongs);
router.get("/:id", songController.getSongById);
router.put("/:id", authMiddleware, uploadMiddleware.single("file"), songController.updateSong);
router.delete("/:id", authMiddleware, songController.deleteSong);

module.exports = router;

