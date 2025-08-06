const express = require("express");
const router = express.Router();
const { getTriviaQuestion, getTriviaQuestions } = require("./controllers/openaiController");

// Add logging middleware
router.use((req, res, next) => {
  console.log(`🌐 API Route hit: ${req.method} ${req.path}`);
  console.log("Query params:", req.query);
  console.log("Body:", req.body);
  next();
});

router.post("/generate-question", (req, res) => {
  console.log("📍 /generate-question route hit");
  getTriviaQuestion(req, res);
});

router.post("/generate-questions", (req, res) => {
  console.log("📍 /generate-questions route hit");
  getTriviaQuestions(req, res);
});

module.exports = router;
