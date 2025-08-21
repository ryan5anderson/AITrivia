// controllers/questionsController.js
const questionStorage = require("../utils/questionStorage");

// POST /api/questions/cached
async function getCachedQuestions(req, res) {
  try {
    const { topic, count = 5 } = req.body || {};
    const t = (topic || "").trim();
    if (!t) return res.status(400).json({ error: "Topic is required and must be a non-empty string" });

    const qs = await questionStorage.getRandomQuestions(t, count);
    if (!qs || !qs.length) {
      return res.status(404).json({
        error: "No cached questions found for this topic",
        suggestion: "Try generating new questions first",
      });
    }
    // qs already in SP shape
    return res.status(200).json({ questions: qs, cached: true });
  } catch (err) {
    console.error("getCachedQuestions error:", err?.message || err);
    return res.status(500).json({ error: "Failed to fetch cached questions" });
  }
}

// GET /api/questions/stats/:topic
async function getTopicStats(req, res) {
  try {
    const { topic } = req.params || {};
    const t = (topic || "").trim();
    if (!t) return res.status(400).json({ error: "Topic is required" });

    const stats = await questionStorage.getTopicStats(t);
    if (!stats || stats.total_questions === "0") {
      return res.status(404).json({ error: "No questions found for this topic" });
    }
    return res.status(200).json({ topic: t, stats });
  } catch (err) {
    console.error("getTopicStats error:", err?.message || err);
    return res.status(500).json({ error: "Failed to get topic statistics" });
  }
}

module.exports = { getCachedQuestions, getTopicStats };