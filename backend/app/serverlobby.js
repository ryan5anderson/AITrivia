// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { nanoid } = require("nanoid");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const lobbies = {}; // In-memory, use Redis/DB in production

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("create-lobby", ({ name }, callback) => {
    const lobbyCode = nanoid(6).toUpperCase();
    lobbies[lobbyCode] = {
      hostId: socket.id,
      players: [{ id: socket.id, name }],
      started: false,
    };
    socket.join(lobbyCode);
    callback({ lobbyCode });
    io.to(lobbyCode).emit("lobby-update", lobbies[lobbyCode].players);
  });

  socket.on("join-lobby", ({ lobbyCode, name }, callback) => {
    const lobby = lobbies[lobbyCode];
    if (!lobby) {
      return callback({ error: "Lobby not found" });
    }
    lobby.players.push({ id: socket.id, name });
    socket.join(lobbyCode);
    callback({ success: true });
    io.to(lobbyCode).emit("lobby-update", lobby.players);
  });

  socket.on("start-game", ({ lobbyCode }) => {
    const lobby = lobbies[lobbyCode];
    if (lobby && lobby.hostId === socket.id) {
      lobby.started = true;
      io.to(lobbyCode).emit("game-started");
    }
  });

  socket.on("disconnect", () => {
    for (const [code, lobby] of Object.entries(lobbies)) {
      const index = lobby.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        lobby.players.splice(index, 1);
        io.to(code).emit("lobby-update", lobby.players);
        if (lobby.players.length === 0) {
          delete lobbies[code];
        }
        break;
      }
    }
  });
});

server.listen(3000, () => console.log("Server listening on port 3000"));
