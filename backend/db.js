const fs = require('fs');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

let poolConfig;

if (connectionString) {
  // Cloud database configuration (Supabase)
  console.log('[db] Using DATABASE_URL for cloud database connection');
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // Production: Use certificate file
    poolConfig = {
      connectionString,
      ssl: {
        ca: fs.readFileSync('/app/certs/supabase-ca.crt', 'utf8'),
        rejectUnauthorized: true,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  } else {
    // Development: Use simple SSL for Supabase
    poolConfig = {
      connectionString,
      ssl: {
        rejectUnauthorized: false, // Allow self-signed certificates for development
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  }
} else {
  // Local development configuration
  console.log('[db] Using local database configuration');
  const envConfig = require('./env.json');
  poolConfig = {
    user: envConfig.user,
    host: envConfig.host,
    database: envConfig.database,
    password: envConfig.password,
    port: envConfig.port,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

const pool = new Pool(poolConfig);

module.exports = pool;
