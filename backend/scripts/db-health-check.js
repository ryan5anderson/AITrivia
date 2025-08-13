const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    ca: fs.readFileSync('/etc/ssl/certs/ca-certificates.crt', 'utf8'),
    rejectUnauthorized: true,
  },
});

client
  .connect()
  .then(() => client.query('select now() as now'))
  .then((r) => {
    console.log(r.rows[0]);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => client.end());


