const { Router } = require("express");
const router = Router();

const { registerUser, loginUser, logoutUser, getMe, logMood, logSong, getRecommendedArtists } = require("../controllers/auth.controllers");
const authMiddleware = require("../middlewares/auth.middlewares");


// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/get-me", authMiddleware, getMe);
router.post("/log-mood", authMiddleware, logMood);
router.post("/log-song", authMiddleware, logSong);
router.get("/recommended-artists", authMiddleware, getRecommendedArtists);

module.exports = router;