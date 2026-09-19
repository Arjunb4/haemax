const db = require("./config/db");

async function checkUsers() {
  try {
    const [users] = await db.query("SELECT id, email, name FROM users");
    console.log("Users in DB:", users);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    process.exit(0);
  }
}
checkUsers();
