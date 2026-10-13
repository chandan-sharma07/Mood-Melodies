const { Router } = require("express");
const router = Router();
const authMiddleware = require("../middlewares/auth.middlewares");
const eventControllers = require("../controllers/event.controllers");

router.use(authMiddleware);

router.post("/mood", eventControllers.logMoodEvent);
router.post("/play", eventControllers.startPlayEvent);
router.post("/play/:id/end", eventControllers.endPlayEvent);
router.get("/history", eventControllers.getHistory);
router.get("/export", eventControllers.exportEventsCsv);
router.delete("/me", eventControllers.deleteUserEvents);

module.exports = router;
