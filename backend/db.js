const { Pool } = require('pg');

/**
 * Prefer DATABASE_URL_PGBOUNCER or DATABASE_URL from env.
 * For Supabase, SSL is required but we set rejectUnauthorized=false for Node clients.
 */
const connectionString =
  process.env.DATABASE_URL_PGBOUNCER ||
  process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "[db] DATABASE_URL/DATABASE_URL_PGBOUNCER not set. Provide a Postgres connection string (e.g., Supabase)."
  );
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

// Light logging to confirm which DB host we're targeting (no secrets)
try {
  const u = new URL(connectionString);
  const host = u.hostname;
  const port = u.port || "5432";
  const dbName = u.pathname ? u.pathname.replace(/^\//, "") : "";
  console.log(`[db] Connecting to host=${host} port=${port} db=${dbName} (ssl=on, rejectUnauthorized=false)`);
} catch (_) {
  console.log("[db] Using provided DATABASE_URL (could not parse for host info)");
}

module.exports = { pool };
