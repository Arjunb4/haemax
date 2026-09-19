const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function initDB() {
  try {
    // 1. Connect without specifying the database so we can run "CREATE DATABASE" if needed
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
      port: Number(process.env.DB_PORT) || 3306,
      multipleStatements: true, // Allow running the entire script at once
    });

    console.log("✅ Connected to MySQL Server...");

    // 2. Read the database.sql file
    const sqlPath = path.join(__dirname, "database.sql");
    const sqlScript = fs.readFileSync(sqlPath, "utf-8");

    console.log("⏳ Running database.sql...");

    // 3. Execute the SQL definitions
    await connection.query(sqlScript);

    console.log("🎉 Database and tables successfully created/updated!");

    // 4. Close the connection
    await connection.end();
  } catch (err) {
    console.error("❌ Failed to initialize database:");
    console.error(err.message);
  }
}

initDB();
