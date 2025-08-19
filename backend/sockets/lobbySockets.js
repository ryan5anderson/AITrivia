const {
  ctrlCreateLobby,
  ctrlJoinLobby,
  ctrlSyncLobby,
  ctrlToggleReady,
  ctrlStartGame,
  ctrlDisconnect,
  ctrlLeaveLobby,
  snapshot,
} = require("../controllers/lobbyController");

function lobbySockets(io) {
  io.on("connection", (socket) => {
    // CREATE
    socket.on("create-lobby", ({ name }, cb = () => {}) => {
      const res = ctrlCreateLobby({ name, socketId: socket.id });
      if (res.error) return cb(res);
      socket.join(res.lobbyCode);
      io.to(res.lobbyCode).emit("lobby-update", res.players);
      cb({ lobbyCode: res.lobbyCode });
    });

    // JOIN (and reconnect)
    socket.on("join-lobby", ({ lobbyCode, name }, cb = () => {}) => {
      const res = ctrlJoinLobby({ code: lobbyCode, name, socketId: socket.id });
      if (res.error) return cb(res);
      socket.join(String(lobbyCode).toUpperCase());
      io.to(String(lobbyCode).toUpperCase()).emit("lobby-update", res.players);
      cb({ ok: true });
    });

    // SYNC (refresh/direct link)
    socket.on("sync-lobby", ({ lobbyCode }) => {
      const res = ctrlSyncLobby({ code: lobbyCode });
      if (!res?.players) return;
      socket.join(String(lobbyCode).toUpperCase());
      io.to(String(lobbyCode).toUpperCase()).emit("lobby-update", res.players);
    });

    // READY TOGGLE
    socket.on("toggle-ready", ({ lobbyCode }, cb = () => {}) => {
      const res = ctrlToggleReady({ code: lobbyCode, socketId: socket.id });
      if (res.error) return cb(res);
      io.to(String(lobbyCode).toUpperCase()).emit("lobby-update", res.players);
      cb({ isReady: res.isReady });
    });

    // START GAME (guarded)
    socket.on("start-game", ({ lobbyCode }, cb = () => {}) => {
      const res = ctrlStartGame({ code: lobbyCode });
      if (res.error) return cb(res);
      io.to(res.roomCode).emit("game-started", { roomCode: res.roomCode, hostSeat: res.hostSeat });
      cb({ ok: true });
    });

    // LEAVE (optional explicit)
    socket.on("leave-lobby", ({ lobbyCode }, cb = () => {}) => {
      const res = ctrlLeaveLobby({ code: lobbyCode, socketId: socket.id });
      if (res?.players) {
        io.to(String(lobbyCode).toUpperCase()).emit("lobby-update", res.players);
      }
      cb({ ok: true });
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      const { rooms = [] } = ctrlDisconnect({ socketId: socket.id });
      rooms.forEach((code) => {
        const res = ctrlSyncLobby({ code });
        if (res?.players) io.to(code).emit("lobby-update", res.players);
      });
    });

    // ---------------- placeholders for game loop ----------------
    socket.on("pickTopic", ({ lobbyCode, topic }) => {
      // TODO: validate host; generate question; io.to(code).emit("newQuestion", {...})
    });

    socket.on("submitAnswer", ({ lobbyCode, questionId, choiceIndex }) => {
      // TODO: accept answers; on timeout: io.to(code).emit("scoreUpdate", {...})
    });
  });
}

module.exports = lobbySockets;
