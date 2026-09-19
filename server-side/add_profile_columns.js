const db = require("./config/db");

async function addColumns() {
  try {
    console.log("Adding bloodGroup and lastDonated columns to users table...");
    
    // Check if columns exist first by attempting to select them, or just use ALTER TABLE and catch error
    try {
      await db.query("ALTER TABLE users ADD COLUMN bloodGroup VARCHAR(10) DEFAULT NULL");
      console.log("Added bloodGroup column!");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("bloodGroup column already exists.");
      } else {
        throw e;
      }
    }

    try {
      await db.query("ALTER TABLE users ADD COLUMN lastDonated VARCHAR(100) DEFAULT 'Never'");
      console.log("Added lastDonated column!");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("lastDonated column already exists.");
      } else {
        throw e;
      }
    }

    console.log("Database migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error.message);
  } finally {
    process.exit();
  }
}

addColumns();
