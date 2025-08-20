// controllers/openaiController.js
const { generateTriviaQuestion, generateTriviaQuestions } = require("../utils/questionGenerator");

// POST /api/generate-question
async function getTriviaQuestion(req, res) {
  try {
    const { topic, difficulty = "medium", forceGenerate = false } = req.body || {};
    const t = (topic || "").trim();
    if (!t) return res.status(400).json({ error: "Topic is required and must be a non-empty string" });

    const q = await generateTriviaQuestion(t, difficulty, forceGenerate);
    // q is already { question, choices, correctAnswer }
    return res.status(200).json({ question: q });
  } catch (err) {
    console.error("getTriviaQuestion error:", err?.message || err);
    return res.status(500).json({ error: "Failed to generate trivia question" });
  }
}

// POST /api/generate-questions
async function getTriviaQuestions(req, res) {
  try {
    const { topic, difficulty = "medium", forceGenerate = false } = req.body || {};
    const t = (topic || "").trim();
    if (!t) return res.status(400).json({ error: "Topic is required and must be a non-empty string" });

    const list = await generateTriviaQuestions(t, difficulty, forceGenerate);
    // list is already an array of { question, choices, correctAnswer }
    return res.status(200).json({ questions: list });
  } catch (err) {
    console.error("getTriviaQuestions error:", err?.message || err);
    return res.status(500).json({ error: "Failed to generate trivia questions" });
  }
}

module.exports = { getTriviaQuestion, getTriviaQuestions };
