const { generateTriviaQuestion } = require("../utils/questionGenerator");

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

module.exports = { getTriviaQuestion };
