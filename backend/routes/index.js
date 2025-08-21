// routes/index.js
const express = require("express");
const router = express.Router();

const { ctrlGetRoomSnapshot } = require("../controllers/lobbyController");
const openai = require("../controllers/openaiController");
const questions = require("../controllers/questionsController");
const { getUserData } = require('../controllers/userController');

/**
 * Debug/admin:
 * GET /api/lobby/rooms/:code
 */
router.get("/lobby/rooms/:code", (req, res) => {
  const snap = ctrlGetRoomSnapshot({ code: req.params.code });
  if (!snap) return res.status(404).json({ error: "Not found" });
  res.json(snap);
});

/**
 * Generation (OpenAI)
 */
router.post("/generate-question", openai.getTriviaQuestion);
router.post("/generate-questions", openai.getTriviaQuestions);

/**
 * Cache & stats
 */
router.post("/questions/cached", questions.getCachedQuestions);
router.get("/questions/stats/:topic", questions.getTopicStats);

/**
 * User Data
 */
router.get('/user/data', getUserData);

module.exports = router;
