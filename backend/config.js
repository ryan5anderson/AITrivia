// config.js
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const PORT = process.env.PORT || 8080;

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

module.exports = {
  // app
  host: '0.0.0.0',
  port: PORT,
  isProduction,
  debug: process.env.DEBUG === "1",

  // frontend (for CORS + Socket.IO)
  frontendOrigin: process.env.FRONTEND_ORIGIN || '',
  socketPath: process.env.SOCKET_PATH || '/socket.io',

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
  allowedOrigins: ALLOWED_ORIGINS,
  cors: { origins: ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : undefined },
};
