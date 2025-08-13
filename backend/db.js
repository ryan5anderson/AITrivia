const fs = require('fs');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[db] DATABASE_URL not set. Provide a Postgres connection string.');
}

const pool = new Pool({
  connectionString,
  ssl: {
    ca: fs.readFileSync('/app/certs/supabase-ca.crt', 'utf8'),
    rejectUnauthorized: true,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

module.exports = pool;
