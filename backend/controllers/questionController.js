const { generateTriviaQuestion, generateTriviaQuestions } = require("../utils/questionGenerator");
const questionStorage = require("../utils/questionStorage");

async function getTriviaQuestion(req, res) {
  try {
    const { topic, difficulty = 'medium' } = req.body;
    const question = await generateTriviaQuestion(topic, difficulty);
    res.status(200).json({ question });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate trivia question" });
  }
}

async function getTriviaQuestions(req, res) {
  console.log("getTriviaQuestions endpoint hit!");
  console.log("Request body:", req.body);
  
  try {
    const { topic, difficulty = 'medium', forceGenerate = false } = req.body;
    console.log("Extracted topic:", topic, "difficulty:", difficulty);
    
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      console.log("Invalid topic provided");
      return res.status(400).json({ error: "Topic is required and must be a non-empty string" });
    }
    
    const questions = await generateTriviaQuestions(topic.trim(), difficulty, forceGenerate);
    console.log("Successfully generated/retrieved", questions.length, "questions");
    
    res.status(200).json({ questions });
  } catch (err) {
    console.error("Error generating trivia questions:", err);
    res.status(500).json({ error: "Failed to generate trivia questions" });
  }
}

// New endpoint: Fetch cached questions only
async function getCachedQuestions(req, res) {
  try {
    const { topic, count = 5 } = req.body;
    
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: "Topic is required and must be a non-empty string" });
    }
    
    const questions = await questionStorage.getRandomQuestions(topic.trim(), count);
    
    if (questions.length === 0) {
      return res.status(404).json({ 
        error: "No cached questions found for this topic",
        suggestion: "Try generating new questions first"
      });
    }
    
    res.status(200).json({ questions, cached: true });
  } catch (err) {
    console.error("Error fetching cached questions:", err);
    res.status(500).json({ error: "Failed to fetch cached questions" });
  }
}

// Get topic statistics
async function getTopicStats(req, res) {
  try {
    const { topic } = req.params;
    
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: "Topic is required" });
    }
    
    const stats = await questionStorage.getTopicStats(topic.trim());
    
    if (!stats || stats.total_questions === '0') {
      return res.status(404).json({ error: "No questions found for this topic" });
    }
    
    res.status(200).json({ topic, stats });
  } catch (err) {
    console.error("Error getting topic stats:", err);
    res.status(500).json({ error: "Failed to get topic statistics" });
  }
}

module.exports = { 
  getTriviaQuestion, 
  getTriviaQuestions, 
  getCachedQuestions, 
  getTopicStats 
};