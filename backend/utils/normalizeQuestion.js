// Always normalize to Single-Player (SP) shape:
// { question, choices, correctAnswer }
function toSP(q) {
  if (!q) throw new Error("empty question");

  if (q.question && Array.isArray(q.choices) && typeof q.correctAnswer === "string") return q;

  if (q.text && Array.isArray(q.options) && typeof q.correct === "string") {
    return { question: q.text, choices: q.options, correctAnswer: q.correct };
  }

  if (q.question && Array.isArray(q.options) && typeof q.answer === "string") {
    return { question: q.question, choices: q.options, correctAnswer: q.answer };
  }

  if (q.question && Array.isArray(q.choices) && Number.isInteger(q.answerIndex)) {
    const idx = q.answerIndex;
    if (idx < 0 || idx >= q.choices.length) throw new Error("answerIndex out of range");
    return { question: q.question, choices: q.choices, correctAnswer: q.choices[idx] };
  }

  if (q.prompt && Array.isArray(q.answers) && typeof q.correct === "string") {
    return { question: q.prompt, choices: q.answers, correctAnswer: q.correct };
  }

  throw new Error("Unknown question shape");
}

module.exports = { toSP };
