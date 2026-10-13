const { Router } = require("express");
const router = Router();

const { registerUser, loginUser, logoutUser, getMe, getRecommendedArtists } = require("../controllers/auth.controllers");
const authMiddleware = require("../middlewares/auth.middlewares");


// Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/get-me", authMiddleware, getMe);
router.get("/recommended-artists", authMiddleware, getRecommendedArtists);

module.exports = router;