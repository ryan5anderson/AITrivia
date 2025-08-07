const { generateTriviaQuestion, generateTriviaQuestions } = require("../utils/questionGenerator");

async function getTriviaQuestion(req, res) {
  try {
    const { topic, difficulty } = req.body;
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
  console.log("Request headers:", req.headers);
  
  try {
    const { topic } = req.body;
    console.log("📝 Extracted topic:", topic);
    
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      console.log("Invalid topic provided");
      return res.status(400).json({ error: "Topic is required and must be a non-empty string" });
    }
    
    console.log("Calling OpenAI to generate questions for topic:", topic.trim());
    const questions = await generateTriviaQuestions(topic.trim());
    console.log("Successfully generated", questions.length, "questions");
    console.log("Generated questions:", JSON.stringify(questions, null, 2));
    
    res.status(200).json({ questions });
  } catch (err) {
    console.error("Error generating trivia questions:", err);
    res.status(500).json({ error: "Failed to generate trivia questions" });
  }
}

module.exports = { getTriviaQuestion, getTriviaQuestions };
