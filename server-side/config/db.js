const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "blooddonation",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  debug: process.env.DB_DEBUG === "true",
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function verifyDatabaseConnection(attempts = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const connection = await pool.getConnection();
      console.log("✅ Connected to MySQL Database");
      connection.release();
      return;
    } catch (err) {
      console.warn(
        `⚠️ MySQL connection attempt ${attempt} failed. ${attempt < attempts ? `Retrying in ${delayMs}ms...` : "No more retries."}`
      );
      console.warn(err.message || err);
      if (attempt < attempts) await sleep(delayMs);
    }
  }
  console.error("❌ MySQL is currently unavailable. The backend will continue starting, but database requests may fail until the service is available.");
}

// ✅ Verify DB connection on startup without terminating the server immediately
verifyDatabaseConnection(5, 2000).catch((err) => {
  console.error("Unexpected error while verifying MySQL connection:", err);
});

// ✅ Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🔻 Closing MySQL pool...");
  await pool.end();
  console.log("✅ MySQL pool closed");
  process.exit(0);
});

module.exports = pool; // ✅ Ensure we export pool
