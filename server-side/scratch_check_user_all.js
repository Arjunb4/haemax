const db = require("./config/db");

async function checkUserAll() {
  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = 'aj777cr@gmail.com'");
    const user = users[0];
    if (user) {
      for (const [key, val] of Object.entries(user)) {
        if (key === 'profilePic') {
          console.log(key, ":", val ? val.substring(0, 50) + "..." : "null");
        } else {
          console.log(key, ":", val);
        }
      }
    } else {
      console.log("User not found");
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    process.exit(0);
  }
}
checkUserAll();
