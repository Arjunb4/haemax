const db = require("./config/db");

async function updateDb() {
  try {
    console.log("Adding resetToken and resetTokenExpiry to users table...");
    await db.query(
      "ALTER TABLE users ADD COLUMN resetToken VARCHAR(255), ADD COLUMN resetTokenExpiry DATETIME;"
    );
    console.log("Columns added successfully!");
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("Columns already exist, skipping...");
    } else {
      console.error("Error updating database:", error.message);
    }
  } finally {
    process.exit();
  }
}

updateDb();
