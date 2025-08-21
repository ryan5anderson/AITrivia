// config.js
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  // app
  host: process.env.HOST || "0.0.0.0",
  port: Number(process.env.PORT || 8080),
  isProduction,
  debug: process.env.DEBUG === "1",

  // frontend (for CORS + Socket.IO)
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
  socketPath: process.env.SOCKET_PATH || "/socket.io",

  // api prefix (in case you ever change it)
  apiPrefix: "/api",

  // DB
  databaseUrl: process.env.DATABASE_URL || "",
  dbSslMode: process.env.DB_SSL_MODE || "loose", // 'strict' | 'loose' | 'disable'
  dbCaFile: process.env.DB_CA_FILE || "",        // optional CA path (prod)

  // OpenAI (future use)
  openaiApiKey: process.env.OPENAI_API_KEY || "",

  // game defaults (can tune later)
  questionMs: Number(process.env.QUESTION_MS || 22000),
  revealMs: Number(process.env.REVEAL_MS || 1500),
  roundQuestions: Number(process.env.ROUND_QUESTIONS || 5),
  leaderboardMs: Number(process.env.LEADERBOARD_MS || 3500),
};
