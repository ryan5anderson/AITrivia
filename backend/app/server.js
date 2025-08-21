// app/server.js
require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const crypto = require("crypto");
const argon2 = require("argon2");
const { Server } = require("socket.io");

const pool = require("../db");                              // shared DB pool
const apiRoutes = require("../routes");                     // unified REST routes
const lobbySockets = require("../sockets/lobbySockets");    // socket handlers
const config = require(path.join(__dirname, "..", "config"));

const hostname = process.env.HOST || "0.0.0.0";
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const isProduction = process.env.NODE_ENV === "production";
const frontendOrigin = config.frontendOrigin;
const socketPath = config.socketPath;

const app = express();

// ---------- CORS ----------
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors({
  origin: config.cors.origins || true,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// ---------- Dev logging ----------
app.use((req, _res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (Object.keys(req.body || {}).length) console.log("Body:", req.body);
  next();
});

// ---------- Static (for production SPA bundle) ----------
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// ---------- Health checks ----------
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/health/db", async (_req, res) => {
  try {
    const r = await pool.query("select now() as now");
    res.json({ ok: true, now: r.rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---------- REST API (mount under /api) ----------
app.use("/api", apiRoutes);

// ---------- SPA catch‑all (exclude /api/*) ----------
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// ---------- HTTP server + Socket.IO ----------
const server = http.createServer(app);

const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: config.cors.origins || true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ["websocket"],           // avoid xhr-polling issues in dev
});

console.log("[server] Socket.IO attached", { socketPath, origins: config.cors.origins });

io.engine.on("connection_error", (err) => {
  console.log("[io] engine connection_error:", {
    code: err.code,
    message: err.message,
    context: err.context,
  });
});

io.on("connection", (s) => {
  console.log("[io] connected", s.id, "ua:", s.handshake.headers["user-agent"]);
  s.on("disconnect", (reason) =>
    console.log("[io] disconnected", s.id, "reason:", reason)
  );
});

// Attach socket namespaces/handlers
lobbySockets(io);

// ---------- Simple demo auth  ----------
const tokenStorage = Object.create(null);
function makeToken() {
  return crypto.randomBytes(32).toString("hex");
}

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,      // secure only in prod so cookies work on localhost
  sameSite: "strict",
};

function validateLogin(body) {
  return body && typeof body.username === "string" && typeof body.password === "string";
}

app.post("/create", async (req, res) => {
  const { body } = req;
  if (!validateLogin(body)) return res.sendStatus(400);

  const { username, password } = body;
  try {
    const hash = await argon2.hash(password);
    const uid = crypto.randomUUID();
    await pool.query("INSERT INTO users (uid, username, password, games_played, wins, email) VALUES ($1, $2, $3, $4, $5, $6)", [uid, username, hash, 0, 0, '']);
    return res.status(200).send();
  } catch (e) {
    console.log("User create failed:", e.message);
    return res.sendStatus(500);
  }
});

app.post("/login", async (req, res) => {
  const { body } = req;
  if (!validateLogin(body)) return res.sendStatus(400);

  const { username, password } = body;
  try {
    const result = await pool.query("SELECT uid, password FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) return res.sendStatus(400);

    const { uid, password: hash } = result.rows[0];
    const ok = await argon2.verify(hash, password);
    if (!ok) return res.sendStatus(400);

    const token = makeToken();
    tokenStorage[token] = { username, uid };
    return res.cookie("token", token, cookieOptions).send();
  } catch (e) {
    console.log("Login failed:", e.message);
    return res.sendStatus(500);
  }
});

function authorize(req, res, next) {
  const { token } = req.cookies;
  if (!token || !Object.prototype.hasOwnProperty.call(tokenStorage, token)) {
    return res.sendStatus(403);
  }
  return next();
}

app.post("/logout", (req, res) => {
  const { token } = req.cookies;
  if (!token || !Object.prototype.hasOwnProperty.call(tokenStorage, token)) {
    return res.sendStatus(400);
  }
  delete tokenStorage[token];
  return res.clearCookie("token", cookieOptions).send();
});

app.get("/public", (_req, res) => res.send("A public message\n"));
app.get("/private", authorize, (_req, res) => res.send("A private message\n"));

// ---------- Start server ----------
server.listen(config.port, config.host, () => {
  console.log(`Server listening on ${config.port}`);
});

// Early DB connection check (non-fatal)
pool
  .connect()
  .then((client) => {
    client.release();
    console.log("Connected to database");
  })
  .catch((err) => {
    console.log("Database connection failed (server continues):", err.message);
  });

// Catch crashes
process.on("uncaughtException", (e) => console.error("[fatal] uncaughtException:", e));
process.on("unhandledRejection", (e) => console.error("[fatal] unhandledRejection:", e));
