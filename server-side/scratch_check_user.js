const db = require("./config/db");

async function checkUserPic() {
  try {
    const [users] = await db.query("SELECT id, email, name, profilePic FROM users WHERE email = 'aj777cr@gmail.com'");
    const user = users[0];
    if (user) {
      console.log("ID:", user.id);
      console.log("Email:", user.email);
      console.log("Name:", user.name);
      console.log("profilePic preview:", user.profilePic ? user.profilePic.substring(0, 100) : "null");
    } else {
      console.log("User not found");
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    process.exit(0);
  }
}
checkUserPic();
