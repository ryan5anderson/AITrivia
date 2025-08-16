// backend/server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

// ==== EXPRESS APP ====
const app = express();
app.use(express.json());

// Allow your React dev server
app.use(
  cors({
    origin: "http://localhost:3000", // change if your frontend runs elsewhere
    credentials: true,
  })
);

// Simple request logger (optional)
app.use((req, _res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.query || {}).length) console.log("  query:", req.query);
  if (req.body && Object.keys(req.body).length) console.log("  body :", req.body);
  next();
});

// ==== TRIVIA CONTROLLERS ====
const {
  getTriviaQuestion,
  getTriviaQuestions,
  getCachedQuestions,
  getTopicStats,
} = require("./controllers/questionController");

// ==== TRIVIA ROUTES (mounted under /api) ====
const api = express.Router();

api.use((req, _res, next) => {
  console.log(`API Route hit: ${req.method} ${req.path}`);
  next();
});

api.post("/generate-question", (req, res) => {
  console.log("/generate-question route hit");
  getTriviaQuestion(req, res);
});

api.post("/generate-questions", (req, res) => {
  console.log("/generate-questions route hit");
  getTriviaQuestions(req, res);
});

api.post("/fetch-questions", (req, res) => {
  console.log("/fetch-questions route hit");
  getCachedQuestions(req, res);
});

api.get("/topic-stats/:topic", (req, res) => {
  console.log("/topic-stats route hit");
  getTopicStats(req, res);
});

app.use("/api", api);

// Health check
app.get("/health", (_req, res) => res.send("OK"));

// ==== HTTP SERVER + SOCKET.IO (Lobby) ====
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// In-memory lobbies (use Redis/DB in production)
const lobbies = {}; // { [code]: { hostId, players: [{id,name}], started:boolean } }

function makeLobbyCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase(); // e.g., ABC123
}

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("create-lobby", ({ name }, callback) => {
    if (!name || typeof name !== "string") {
      return callback?.({ error: "Name is required" });
    }
    const lobbyCode = makeLobbyCode();
    lobbies[lobbyCode] = {
      hostId: socket.id,
      players: [{ id: socket.id, name }],
      started: false,
    };
    socket.join(lobbyCode);
    callback?.({ lobbyCode });
    io.to(lobbyCode).emit("lobby-update", lobbies[lobbyCode].players);
  });

  socket.on("join-lobby", ({ lobbyCode, name }, callback) => {
    const code = (lobbyCode || "").toUpperCase();
    const lobby = lobbies[code];
    if (!lobby) {
      return callback?.({ error: "Lobby not found" });
    }
    if (!name || typeof name !== "string") {
      return callback?.({ error: "Name is required" });
    }
    // prevent duplicates
    if (!lobby.players.find((p) => p.id === socket.id)) {
      lobby.players.push({ id: socket.id, name });
    }
    socket.join(code);
    callback?.({ success: true });
    io.to(code).emit("lobby-update", lobby.players);
  });

  socket.on("start-game", ({ lobbyCode }) => {
    const code = (lobbyCode || "").toUpperCase();
    const lobby = lobbies[code];
    if (!lobby) return;
    if (lobby.hostId !== socket.id) return; // only host can start
    lobby.started = true;
    io.to(code).emit("game-started");
  });

  socket.on("disconnect", () => {
    // remove player from any lobby they were in
    for (const [code, lobby] of Object.entries(lobbies)) {
      const idx = lobby.players.findIndex((p) => p.id === socket.id);
      if (idx !== -1) {
        lobby.players.splice(idx, 1);
        io.to(code).emit("lobby-update", lobby.players);
        if (lobby.players.length === 0) {
          delete lobbies[code];
          console.log(`🗑️ Deleted empty lobby ${code}`);
        }
        break;
      }
    }
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

// ==== START ====
const HOST = "localhost";
const PORT = 3000;
server.listen(PORT, HOST, () => {
  console.log(`HTTP + Socket.IO listening at http://${HOST}:${PORT}`);
});
