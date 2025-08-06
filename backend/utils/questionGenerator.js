require("dotenv").config();
const { OpenAI } = require("openai");
const { openaiApiKey } = require("../config");

const openai = new OpenAI({ apiKey: openaiApiKey });

async function generateTriviaQuestions(topic) {
  const prompt = `
Generate exactly 5 trivia questions about "${topic}". 
Make them fun, interesting, and sometimes tricky. 
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
    model: "gpt-4",
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
    
    return questions;
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    console.error("Raw response:", responseText);
    throw new Error("Failed to parse trivia questions from OpenAI response");
  }
}

// Keep the old function for backward compatibility
async function generateTriviaQuestion(topic) {
  const questions = await generateTriviaQuestions(topic);
  return questions[0]; // Return first question in old format
}

module.exports = { generateTriviaQuestion, generateTriviaQuestions };
