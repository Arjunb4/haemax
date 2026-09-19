const db = require("./config/db");

async function checkDB() {
  try {
    const [tables] = await db.query("SHOW TABLES");
    console.log("Tables in database:", tables);

    const [columns] = await db.query("DESCRIBE users");
    console.log("Columns in 'users' table:", columns);
  } catch (err) {
    console.error("Error accessing DB:", err.message);
  } finally {
    process.exit(0);
  }
}
checkDB();
