// db.js
const fs = require("fs");
const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";
const connectionString = process.env.DATABASE_URL;
let poolConfig;

if (connectionString) {
  console.log("[db] Using DATABASE_URL for cloud database connection");
  // If you mount a CA file (recommended in production), point PGSSLROOTCERT to it.
  // e.g. PGSSLROOTCERT=/app/certs/supabase-ca.crt
  const caPath = process.env.PGSSLROOTCERT;
  const hasCA = !!(caPath && fs.existsSync(caPath));

  poolConfig = {
    connectionString,
    ssl: isProduction
      ? (
          hasCA
            ? { ca: fs.readFileSync(caPath, "utf8"), rejectUnauthorized: true }
            : { require: true, rejectUnauthorized: false } // still encrypts, but skips CA validation
        )
      : { rejectUnauthorized: false }, // dev: allow self-signed (Supabase)
    max: Number(process.env.PG_POOL_MAX || 10),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT || 30000),
    connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT || 10000),
  };
} else {
  console.log("[db] Using local database configuration (env.json)");
  const envConfig = require("./env.json");
  poolConfig = {
    user: envConfig.user,
    host: envConfig.host,
    database: envConfig.database,
    password: envConfig.password,
    port: envConfig.port,
    max: Number(process.env.PG_POOL_MAX || 10),
    idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT || 30000),
    connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT || 10000),
  };
}

const pool = new Pool(poolConfig);

// Optional: central helpers
async function query(text, params) {
  return pool.query(text, params);
}
async function getClient() {
  return pool.connect();
}

// Diagnostics
pool.on("error", (err) => {
  console.error("[db] Unexpected error on idle client:", err.message);
});
(async () => {
  try {
    const r = await pool.query("select now() as now");
    console.log("[db] Connected. now():", r.rows?.[0]?.now);
  } catch (e) {
    console.error("[db] Initial connection failed:", e.message);
  }
})();

module.exports = Object.assign(pool, { query, getClient });
