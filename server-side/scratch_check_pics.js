const db = require("./config/db");

async function checkAllPics() {
  try {
    const [users] = await db.query("SELECT id, email, name, lname, phone, profilePic FROM users");
    console.log("All Users:");
    for (const u of users) {
      console.log(`ID: ${u.id}, Email: ${u.email}, Name: ${u.name} ${u.lname}, Phone: ${u.phone}`);
      console.log(`Pic (first 100 chars): ${u.profilePic ? u.profilePic.substring(0, 100) : "null"}`);
      console.log("-----------------------------------------");
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    process.exit(0);
  }
}
checkAllPics();
