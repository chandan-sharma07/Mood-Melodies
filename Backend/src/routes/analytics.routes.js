const express = require("express");
const authMiddleware = require("../middlewares/auth.middlewares");
const { getAnalyticsSummary } = require("../controllers/analytics.controllers");

const router = express.Router();
router.use(authMiddleware);
router.get("/summary", getAnalyticsSummary);

module.exports = router;
