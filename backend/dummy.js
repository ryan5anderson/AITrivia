let argon2 = require("argon2");
let { Pool } = require("pg");
// TODO move dummy.js inside app
let env = require("./env.json");

let pool = new Pool(env);

let dummyUsers = [
  ["abc", "mycoolpassword"],
  ["admin", "root"],
  ["fiddlesticks", "bibblebap"],
];

// client/pool.end stuff taken from here
// https://stackoverflow.com/a/50630792/6157047
// so script actually exits

pool.connect().then(async (client) => {
  for (let [username, password] of dummyUsers) {
    let hash;
    try {
      hash = await argon2.hash(password);
    } catch (error) {
      console.log(`Error when hashing '${password}':`, error);
      continue;
    }

    try {
      await client.query("INSERT INTO users (uid, username, password, games_played, wins, email) VALUES ($1, $2, $3, $4, $5, $6)", [crypto.randomUUID(), username, hash, 0, 0, '']);
    } catch (error) {
      console.log(`Error when INSERTING '${username}', '${hash}':`, error);
    }
    console.log(`Inserted ('${username}', '${password}') with hash '${hash}'`);
  }

  let result = await client.query("SELECT * FROM users");
  console.log(result.rows);

  await client.release();
});
// TODO why is this not a race condition
pool.end();
