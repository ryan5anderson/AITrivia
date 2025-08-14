require("dotenv").config();
const { OpenAI } = require("openai");
const { openaiApiKey } = require("../config");
const questionStorage = require('./questionStorage');

const openai = new OpenAI({ apiKey: openaiApiKey });

async function generateTriviaQuestions(topic, difficulty = 'medium', forceGenerate = false) {
  console.log(`Checking cache for topic: "${topic}" with difficulty: ${difficulty}`);
  
  // Check if we have cached questions (unless force generate is true)
  if (!forceGenerate) {
    const hasQuestions = await questionStorage.hasQuestionsForTopic(topic);
    if (hasQuestions) {
      console.log(`Found cached questions for topic: "${topic}"`);
      return await questionStorage.getRandomQuestions(topic, 5);
    }
  }
  
  console.log(`Generating new questions for topic: "${topic}"`);
  
  const difficultyPrompts = {
    easy: "Make them relatively easy, suitable for general knowledge.",
    medium: "Make them moderately challenging with some tricky elements.",
    hard: "Make them quite challenging and require specific knowledge.",
  };

  const prompt = `
Generate exactly 5 trivia questions about "${topic}". 
${difficultyPrompts[difficulty] || difficultyPrompts.medium}
Each question should have exactly 4 answer choices.

Return the response as a valid JSON array in this exact format:
[
  {
    "question": "The question text here?",
    "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": "The exact text of the correct choice"
  },
  {
    "question": "Another question text?",
    "choices": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "The exact text of the correct choice"
  }
]

Make sure the correctAnswer field contains the exact text that appears in the choices array.
Do not include any other text, just return the valid JSON array.
`;

  const completion = await openai.chat.completions.create({
    // Use a widely available model; allow override via env MODEL
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1500,
  });

  const responseText = completion.choices[0].message.content.trim();
  
  try {
    // Parse the JSON response
    const questions = JSON.parse(responseText);
    
    // Validate the structure
    if (!Array.isArray(questions) || questions.length !== 5) {
      throw new Error("Invalid number of questions generated");
    }
    
    // Validate each question structure
    questions.forEach((q, index) => {
      if (!q.question || !Array.isArray(q.choices) || q.choices.length !== 4 || !q.correctAnswer) {
        throw new Error(`Invalid question structure at index ${index}`);
      }
      
      // Ensure correctAnswer is one of the choices
      if (!q.choices.includes(q.correctAnswer)) {
        throw new Error(`Correct answer not found in choices for question ${index + 1}`);
      }
    });
    
    // Store the generated questions
    const storedQuestions = await questionStorage.storeQuestions(topic, questions, difficulty);
    
    return storedQuestions;
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    console.error("Raw response:", responseText);
    throw new Error("Failed to parse trivia questions from OpenAI response");
  }
}

// Keep the old function for backward compatibility
async function generateTriviaQuestion(topic, difficulty = 'medium') {
  const questions = await generateTriviaQuestions(topic, difficulty);
  return questions[0];
}

module.exports = { generateTriviaQuestion, generateTriviaQuestions };
