// sockets/lobbySockets.js
const {
  ctrlCreateLobby,
  ctrlJoinLobby,
  ctrlSyncLobby,
  ctrlToggleReady,
  ctrlStartGame,
  ctrlDisconnect,
} = require("../controllers/lobbyController");

const { generateTriviaQuestions } = require("../utils/questionGenerator");

// In-memory game state per room
// games[code] = {
//   phase: 'topic'|'generating'|'question'|'leaderboard'|'over',
//   pickerSocketId,
//   pickerOrder: string[],
//   pickerCursor: number,
//   visited: Set<string>,
//   questions: Array<{ qid,text,choices,correctIndex,round,turn }> | null,
//   question: {...} | null,
//   turn: number,
//   submissions: Map(socketId -> { choiceIndex, at }),
//   totals: Map(socketId -> number),
//   revealed: boolean,
//   nameById: Record<socketId,string>,
//   settings: { questionMs, roundQuestions, revealMs, leaderboardMs },
// }
const games = new Map();

// timers per room
// jobs[code] = { questionTimer: Timeout|null, revealTimer: Timeout|null }
const jobs = new Map();

const DEFAULTS = {
  QUESTION_MS: 22000,
  REVEAL_MS: 1500,
  ROUND_QUESTIONS: 5,
  LEADERBOARD_MS: 3500,
};

function ensureJobs(code) {
  if (!jobs.has(code)) jobs.set(code, { questionTimer: null, revealTimer: null });
  return jobs.get(code);
}

function clearTimers(code) {
  const job = ensureJobs(code);
  clearTimeout(job.questionTimer);
  clearTimeout(job.revealTimer);
  job.questionTimer = null;
  job.revealTimer = null;
}

function redactedQuestion(q) {
  const { qid, text, choices, expiresAt, round, turn } = q;
  return { qid, text, choices, expiresAt, round, turn };
}

function getRoomPlayerIds(io, code) {
  const room = io.sockets.adapter.rooms.get(code);
  if (!room) return [];
  return Array.from(room);
}

function everyoneAnswered(io, code) {
  const state = games.get(code);
  if (!state) return false;
  const players = getRoomPlayerIds(io, code);
  if (players.length === 0) return false;
  return (state.submissions?.size || 0) >= players.length;
}

function nextPickerIndex(state) {
  const n = state.pickerOrder.length;
  return (state.pickerCursor + 1) % n;
}

function makeLeaderboard(state) {
  const nameById = state.nameById || {};
  const entries = [...(state.totals || new Map()).entries()];
  return entries
    .map(([sid, total]) => ({
      id: sid,
      name: nameById[sid] || sid.slice(0, 5),
      total,
    }))
    .sort((a, b) => b.total - a.total);
}

function startQuestion(io, code, question) {
  const state = games.get(code);
  if (!state) return;

  const ms = state.settings?.questionMs ?? DEFAULTS.QUESTION_MS;
  const expiresAt = Date.now() + ms;

  state.phase = "question";
  state.revealed = false;
  state.question = { ...question, expiresAt };
  state.submissions = new Map();
  state.totals = state.totals || new Map();

  console.log("[server] ↳ newQuestion emit", {
    code,
    qid: state.question.qid,
    expiresAt,
    turn: question.turn,
  });
  io.to(code).emit("newQuestion", { roomCode: code, question: redactedQuestion(state.question) });

  const job = ensureJobs(code);
  clearTimers(code);
  job.questionTimer = setTimeout(() => finishQuestion(io, code, "timeout"), ms);
}

function finishQuestion(io, code, reason = "manual") {
  const state = games.get(code);
  if (!state || state.phase !== "question" || !state.question) return;
  if (state.revealed) return; // already revealed
  state.revealed = true;

  const correctIndex = state.question.correctIndex;
  console.log("[server] ⏱️ finishQuestion", {
    code,
    qid: state.question.qid,
    correctIndex,
    submissions: state.submissions.size,
    reason,
  });

  // Score only first answer per player
  for (const [sid, sub] of state.submissions.entries()) {
    const isCorrect = Number(sub.choiceIndex) === Number(correctIndex);
    const prev = state.totals.get(sid) ?? 0;
    state.totals.set(sid, prev + (isCorrect ? 1 : 0));
  }

  const leaderboard = makeLeaderboard(state);

  io.to(code).emit("scoreUpdate", {
    roomCode: code,
    leaderboard,
    correctIndex,
    qid: state.question.qid,
  });

  const revealMs = state.settings?.revealMs ?? DEFAULTS.REVEAL_MS;
  const job = ensureJobs(code);
  clearTimeout(job.questionTimer);
  clearTimeout(job.revealTimer);
  job.revealTimer = setTimeout(() => advanceAfterReveal(io, code), revealMs);
}

function advanceAfterReveal(io, code) {
  const state = games.get(code);
  if (!state) return;

  // More questions left in this round?
  if (state.questions && state.turn < state.questions.length - 1) {
    state.turn += 1;
    console.log("[server] ➡️ next question", { code, turn: state.turn + 1 });
    startQuestion(io, code, state.questions[state.turn]);
    return;
  }

  // Round over → compute leaderboard
  const leaderboard = makeLeaderboard(state);

  // mark this picker as visited
  state.visited = state.visited || new Set();
  state.visited.add(state.pickerSocketId);

  // If everyone has hosted → game over
  const allPlayers = state.pickerOrder || [];
  const everyoneHosted = allPlayers.length > 0 && state.visited.size >= allPlayers.length;

  if (everyoneHosted) {
    console.log("[server] 🏁 game over", { code, players: allPlayers.length });
    state.phase = "over";
    clearTimers(code);
    io.to(code).emit("gameOver", { roomCode: code, final: leaderboard });
    // Also emit phase for any listeners expecting it
    io.to(code).emit("phase", { roomCode: code, phase: "over" });
    return;
  }

  // otherwise show round results briefly then rotate picker
  state.phase = "leaderboard";
  state.question = null;

  const nextIdx = nextPickerIndex(state);
  const nextPickerSocketId = state.pickerOrder[nextIdx];
  console.log("[server] 🧭 roundOver → next picker", { code, nextPickerSocketId });

  io.to(code).emit("roundOver", {
    roomCode: code,
    leaderboard,
    nextPickerSocketId,
  });

  const lbMs = state.settings?.leaderboardMs ?? DEFAULTS.LEADERBOARD_MS;
  setTimeout(() => {
    state.phase = "topic";
    state.questions = null;
    state.turn = 0;
    state.submissions = new Map();
    state.pickerCursor = nextIdx;
    state.pickerSocketId = nextPickerSocketId;

    console.log("[server] ↩︎ phase → topic", { code, pickerSocketId: nextPickerSocketId });
    io.to(code).emit("phase", {
      roomCode: code,
      phase: "topic",
      pickerSocketId: nextPickerSocketId,
    });
  }, lbMs);
}

function lobbySockets(io) {
  console.log("[server] lobbySockets attached");

  io.on("connection", (socket) => {
    console.log("[server] ⚡ connected", socket.id);

    // ---------------- CREATE ----------------
    socket.on("create-lobby", ({ name }, cb = () => {}) => {
      console.log("[server] ▶ create-lobby", { name, socket: socket.id });
      try {
        const res = ctrlCreateLobby({ name, socketId: socket.id });
        if (res?.error) {
          console.error("[server] create-lobby error:", res.error);
          return cb(res);
        }
        const roomCode = String(res.lobbyCode || res.roomCode).toUpperCase();
        socket.join(roomCode);
        io.to(roomCode).emit("lobby-update", res.players);
        console.log("[server] lobby created", { roomCode, players: res.players?.length || 0 });
        cb({ lobbyCode: roomCode });
      } catch (e) {
        console.error("[server] create-lobby exception:", e);
        cb({ error: "Server error creating lobby." });
      }
    });

    // ---------------- JOIN ----------------
    socket.on("join-lobby", ({ lobbyCode, name }, cb = () => {}) => {
      const code = String(lobbyCode || "").toUpperCase();
      console.log("[server] ▶ join-lobby", { code, name, socket: socket.id });
      try {
        const res = ctrlJoinLobby({ code, name, socketId: socket.id });
        if (res?.error) {
          console.error("[server] join-lobby error:", res.error);
          return cb(res);
        }
        socket.join(code);
        io.to(code).emit("lobby-update", res.players);
        console.log("[server] joined lobby", { code, players: res.players?.length || 0 });

        // If a game already exists for this room, refresh name map so scoreboards show proper display names
        const g = games.get(code);
        if (g) {
          g.nameById = g.nameById || {};
          (res.players || []).forEach((p) => {
            if (p?.id) g.nameById[p.id] = p.name || p.id.slice(0, 5);
          });
        }

        cb({ ok: true });
      } catch (e) {
        console.error("[server] join-lobby exception:", e);
        cb({ error: "Server error joining lobby." });
      }
    });

    // ---------------- SYNC LOBBY ----------------
    socket.on("sync-lobby", ({ lobbyCode }) => {
      const code = String(lobbyCode || "").toUpperCase();
      const res = ctrlSyncLobby({ code });
      if (!res?.players) {
        console.warn("[server] sync-lobby: no players for", code);
        return;
      }
      socket.join(code);
      io.to(code).emit("lobby-update", res.players);
      console.log("[server] lobby-update broadcast", { code, players: res.players.length });
    });

    // ---------------- READY TOGGLE ----------------
    socket.on("toggle-ready", ({ lobbyCode }, cb = () => {}) => {
      const code = String(lobbyCode || "").toUpperCase();
      console.log("[server] ▶ toggle-ready", { code, socket: socket.id });
      try {
        const res = ctrlToggleReady({ code, socketId: socket.id });
        if (res?.error) {
          console.error("[server] toggle-ready error:", res.error);
          return cb(res);
        }
        io.to(code).emit("lobby-update", res.players);
        console.log("[server] ready toggled; broadcast lobby-update", { code });
        cb({ isReady: res.isReady });
      } catch (e) {
        console.error("[server] toggle-ready exception:", e);
        cb({ error: "Server error toggling ready." });
      }
    });

    // ---------------- START GAME ----------------
    socket.on("start-game", ({ lobbyCode }, cb = () => {}) => {
      const code = String(lobbyCode || "").toUpperCase();
      console.log("[server] ▶ start-game", { code, caller: socket.id });
      try {
        const res = ctrlStartGame({ code });
        if (res?.error) {
          console.error("[server] start-game controller error:", res.error);
          return cb({ error: res.error });
        }

        const roomCode = String(res.roomCode || res.lobbyCode || code).toUpperCase();
        io.to(roomCode).emit("game-started", { roomCode });

        // snapshot order at start; host is first picker
        const order = getRoomPlayerIds(io, roomCode);
        const pickerSocketId = socket.id;
        const cursor = Math.max(0, order.indexOf(pickerSocketId));
        console.log("[server] game-started", { roomCode, players: order.length, pickerSocketId });

        // Build id->name map from the lobby snapshot
        const lobbySnap = ctrlSyncLobby({ code: roomCode }) || {};
        const nameById = {};
        (lobbySnap.players || []).forEach((p) => {
          if (p?.id) nameById[p.id] = p.name || p.id.slice(0, 5);
        });

        games.set(roomCode, {
          phase: "topic",
          pickerSocketId,
          pickerOrder: order,
          pickerCursor: cursor,
          visited: new Set(),
          question: null,
          questions: null,
          turn: 0,
          submissions: new Map(),
          totals: new Map(),
          revealed: false,
          nameById,
          settings: {
            questionMs: DEFAULTS.QUESTION_MS,
            roundQuestions: DEFAULTS.ROUND_QUESTIONS,
            revealMs: DEFAULTS.REVEAL_MS,
            leaderboardMs: DEFAULTS.LEADERBOARD_MS,
          },
        });

        io.to(roomCode).emit("phase", { roomCode, phase: "topic", pickerSocketId });
        io.to(pickerSocketId).emit("requestTopics", {
          roomCode,
          pickerSocketId,
          topics: ["Science", "Movies", "History"],
        });

        cb({ ok: true, roomCode });
      } catch (e) {
        console.error("[server] start-game exception:", e);
        cb({ error: "Server error starting game." });
      }
    });

    // ---------------- PICK TOPIC ----------------
    socket.on(
      "pickTopic",
      async ({ lobbyCode, topic, difficulty = "medium", forceGenerate = false, speedMs }, cb = () => {}) => {
        const code = String(lobbyCode || "").toUpperCase();
        console.log("[server] ▶ pickTopic", { code, topic, difficulty, speedMs, picker: socket.id });

        const state = games.get(code) || {};
        games.set(code, {
          ...state,
          pickerSocketId: state.pickerSocketId || socket.id,
          phase: "generating",
          settings: {
            ...(state.settings || {}),
            questionMs:
              Number(speedMs) > 3000
                ? Number(speedMs)
                : state.settings?.questionMs ?? DEFAULTS.QUESTION_MS,
          },
        });
        io.to(code).emit("phase", {
          roomCode: code,
          phase: "generating",
          pickerSocketId: state.pickerSocketId || socket.id,
        });

        try {
          const all = await generateTriviaQuestions(String(topic || "").trim(), difficulty, forceGenerate);
          if (!Array.isArray(all) || all.length === 0) throw new Error("no_questions_from_generator");

          const wanted = state.settings?.roundQuestions ?? DEFAULTS.ROUND_QUESTIONS;
          const qs = all.slice(0, wanted).map((sp, i) => {
            const idx = sp.choices.findIndex((c) => c === sp.correctAnswer);
            if (idx < 0) throw new Error("correct_not_in_choices");
            return {
              qid: `${Date.now()}_${i}`,
              text: sp.question,
              choices: sp.choices, // do not reshuffle separately; idx must match
              correctIndex: idx,
              round: 1,
              turn: i + 1,
            };
          });

          const st = games.get(code) || {};
          games.set(code, { ...st, questions: qs, turn: 0 });
          console.log("[server] ↳ starting question", {
            code,
            topic,
            count: qs.length,
            firstQ: qs[0]?.qid,
          });
          startQuestion(io, code, qs[0]);
          cb({ ok: true });
        } catch (err) {
          console.error("[server] pickTopic error:", err?.message || err);
          const prev = games.get(code) || {};
          games.set(code, { ...prev, phase: "topic" });
          io.to(code).emit("phase", {
            roomCode: code,
            phase: "topic",
            pickerSocketId: prev.pickerSocketId || socket.id,
            error: "question_build_failed",
          });
          cb({ ok: false, error: "question_build_failed" });
        }
      }
    );

    // ---------------- SUBMIT ANSWER ----------------
    socket.on("submit-answer", ({ lobbyCode, qid, choiceIndex }, ack = () => {}) => {
      const code = String(lobbyCode || "").toUpperCase();
      const state = games.get(code);
      if (!state || state.phase !== "question" || !state.question || state.question.qid !== qid) {
        console.warn("[server] submit-answer rejected", { code, qid, from: socket.id });
        return ack({ ok: false, error: "invalid_state" });
      }
      if (state.submissions.has(socket.id)) {
        return ack({ ok: true });
      }
      state.submissions.set(socket.id, { choiceIndex, at: Date.now() });
      console.log("[server] ✅ submit-answer", {
        code,
        qid,
        from: socket.id,
        choiceIndex,
        totalSubs: state.submissions.size,
      });
      ack({ ok: true });

      if (everyoneAnswered(io, code)) {
        console.log("[server] 🙌 everyone answered → finishQuestion", { code, qid });
        finishQuestion(io, code, "everyone-answered");
      }
    });

    // ---------------- SYNC GAME ----------------
    socket.on("sync-game", ({ lobbyCode }) => {
      const code = String(lobbyCode || "").toUpperCase();
      const g = games.get(code);
      console.log("[server] ▶ sync-game", { code, hasState: !!g, caller: socket.id });
      if (!g) return;

      socket.join(code);
      io.to(socket.id).emit("phase", {
        roomCode: code,
        phase: g.phase,
        pickerSocketId: g.pickerSocketId,
      });

      if (g.phase === "question" && g.question) {
        io.to(socket.id).emit("newQuestion", {
          roomCode: code,
          question: redactedQuestion(g.question),
        });
      }

      if (g.phase === "over") {
        const leaderboard = makeLeaderboard(g);
        io.to(socket.id).emit("gameOver", { roomCode: code, final: leaderboard });
      }
    });

    // ---------------- DISCONNECT ----------------
    socket.on("disconnect", (reason) => {
      console.log("[server] 🔌 disconnect", socket.id, "reason:", reason);
      const { rooms = [] } = ctrlDisconnect({ socketId: socket.id });
      rooms.forEach((code) => {
        const res = ctrlSyncLobby({ code });
        if (res?.players) {
          // Refresh name map so reconnects keep names
          const g = games.get(code);
          if (g) {
            g.nameById = g.nameById || {};
            (res.players || []).forEach((p) => {
              if (p?.id) g.nameById[p.id] = p.name || p.id.slice(0, 5);
            });
          }
          io.to(code).emit("lobby-update", res.players);
        }
      });
    });
  });
}

module.exports = lobbySockets;
