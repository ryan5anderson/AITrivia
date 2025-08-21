/** In-memory model; persist later if needed */
const rooms = {}; // { [code]: Room }

function makeCode(len = 4) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  while (s.length < len) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  if (rooms[s]) return makeCode(len);
  return s;
}

function getRoom(code) {
  if (!code) return;
  return rooms[String(code).toUpperCase()];
}

function createRoom() {
  const code = makeCode(4);
  rooms[code] = {
    code,
    order: [],           // socketIds in seat order
    hostIndex: 0,        // pointer into order
    players: {},         // sid -> Player
    state: "waiting",    // "waiting" | "topic" | "question" | "leaderboard" | "over"
  };
  return rooms[code];
}

function snapshot(room) {
  if (!room) return [];
  return room.order
    .map((sid, idx) => {
      const p = room.players[sid];
      if (!p) return null;
      const isHost = room.order[room.hostIndex] === sid;
      return {
        id: p.id,
        name: p.name,
        seat: p.seat ?? idx + 1,
        isHost,
        isReady: !!p.isReady,
        score: p.score ?? 0,
        connected: !!p.connected,
      };
    })
    .filter(Boolean);
}

function ensureConnectedHost(room) {
  const n = room.order.length;
  if (!n) return;
  const cur = room.order[room.hostIndex];
  if (room.players[cur]?.connected) return;

  for (let step = 1; step <= n; step++) {
    const idx = (room.hostIndex + step) % n;
    const sid = room.order[idx];
    if (room.players[sid]?.connected) {
      room.hostIndex = idx;
      return;
    }
  }
}

/** Controllers (pure logic) */

function ctrlCreateLobby({ name, socketId }) {
  if (!name?.trim()) return { error: "Name required" };
  const room = createRoom();
  room.players[socketId] = {
    id: socketId,
    name: name.trim(),
    seat: 1,
    isReady: false,
    score: 0,
    connected: true,
  };
  room.order.push(socketId);
  room.hostIndex = 0;
  return { lobbyCode: room.code, players: snapshot(room) };
}

function ctrlJoinLobby({ code, name, socketId }) {
  if (!name?.trim()) return { error: "Name required" };
  const room = getRoom(code);
  if (!room) return { error: "Room not found" };

  if (room.players[socketId]) {
    room.players[socketId].connected = true;
    room.players[socketId].name = name.trim();
  } else {
    const seat = room.order.length + 1;
    room.players[socketId] = {
      id: socketId,
      name: name.trim(),
      seat,
      isReady: false,
      score: 0,
      connected: true,
    };
    room.order.push(socketId);
  }
  return { ok: true, players: snapshot(room) };
}

function ctrlSyncLobby({ code }) {
  const room = getRoom(code);
  if (!room) return { error: "Room not found" };
  return { players: snapshot(room) };
}

function ctrlToggleReady({ code, socketId }) {
  const room = getRoom(code);
  if (!room) return { error: "Room not found" };
  const me = room.players[socketId];
  if (!me) return { error: "Not in room" };
  me.isReady = !me.isReady;
  return { isReady: me.isReady, players: snapshot(room) };
}

function ctrlStartGame({ code }) {
  const room = getRoom(code);
  if (!room) return { error: "Room not found" };
  const list = room.order.map((sid) => room.players[sid]).filter(Boolean);
  const connected = list.filter((p) => p.connected);
  if (connected.length < 1) return { error: "Need at least 1 player" };
  if (!list.every((p) => p.isReady)) return { error: "All players must be ready" };

  room.state = "topic";
  ensureConnectedHost(room);
  const hostSid = room.order[room.hostIndex];
  const hostSeat = room.players[hostSid]?.seat ?? 1;
  return { roomCode: room.code, hostSeat };
}

function ctrlDisconnect({ socketId }) {
  let touched = [];
  Object.values(rooms).forEach((r) => {
    if (r.players[socketId]) {
      r.players[socketId].connected = false;
      touched.push(r.code);
    }
  });
  return { rooms: touched };
}

function ctrlLeaveLobby({ code, socketId }) {
  const room = getRoom(code);
  if (!room || !room.players[socketId]) return { ok: true };
  room.players[socketId].connected = false; // keep seat for stability
  return { ok: true, players: snapshot(room) };
}

/** Optional: expose debug snapshot */
function ctrlGetRoomSnapshot({ code }) {
  const room = getRoom(code);
  if (!room) return null;
  return {
    code: room.code,
    hostIndex: room.hostIndex,
    order: room.order,
    state: room.state,
    players: room.order.map((sid) => room.players[sid]),
  };
}

module.exports = {
  // state
  getRoom,
  // controllers
  ctrlCreateLobby,
  ctrlJoinLobby,
  ctrlSyncLobby,
  ctrlToggleReady,
  ctrlStartGame,
  ctrlDisconnect,
  ctrlLeaveLobby,
  ctrlGetRoomSnapshot,
  // util for future phases
  snapshot,
  ensureConnectedHost,
};
