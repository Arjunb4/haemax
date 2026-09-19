const db = require("./config/db");

async function fixDb() {
  try {
    console.log("Altering profilePic column to LONGTEXT...");
    await db.query("ALTER TABLE users MODIFY COLUMN profilePic LONGTEXT");
    console.log("Successfully altered profilePic column!");
  } catch (error) {
    console.error("Error altering column:", error.message);
  } finally {
    process.exit();
  }
}

fixDb();
