const { OpenAI } = require("openai");
const { openaiApiKey } = require("../config");

const openai = new OpenAI({ apiKey: openaiApiKey });

async function generateTriviaQuestion(topic) {
  const prompt = `
Generate a trivia question about "${topic}". 
Make it fun, interesting, and sometimes tricky. 
Include four answer choices labeled A, B, C, and D, and clearly mark the correct answer.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 300,
  });

  return completion.choices[0].message.content.trim();
}

module.exports = { generateTriviaQuestion };
