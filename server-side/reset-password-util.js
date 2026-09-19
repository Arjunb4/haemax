const db = require("./config/db");
const bcrypt = require("bcryptjs");

async function resetPasswords() {
  const emails = [
    "aj777cr@gmail.com",
    "sharathvvsharath@gmail.com",
    "abhi@gmail.com",
    "sachin123@gmail.com",
    "jane.doe@example.com"
  ];
  
  const newPassword = "Password123!";
  
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    for (const email of emails) {
      const [users] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
      if (users.length > 0) {
        await db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]);
        console.log(`🔑 Successfully updated password for ${email} to "${newPassword}"`);
      } else {
        console.log(`⚠️ User ${email} does not exist in the database.`);
      }
    }
  } catch (error) {
    console.error("Error resetting passwords:", error);
  } finally {
    process.exit(0);
  }
}

resetPasswords();
