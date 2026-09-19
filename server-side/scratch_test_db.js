const db = require("./config/db");
const bcrypt = require("bcryptjs");

async function testInsert() {
  try {
    const saltRounds = 10;
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);
    
    const name = "Test";
    const lname = "User";
    const phone = "Not Provided";
    const userEmail = "test_google_" + Date.now() + "@gmail.com";
    const profilePic = "https://example.com/default-profile.png";

    const [result] = await db.query(
      "INSERT INTO users (name, lname, phone, email, password, profilePic) VALUES (?, ?, ?, ?, ?, ?)",
      [name, lname, phone, userEmail, hashedPassword, profilePic]
    );

    console.log("SUCCESS: Inserted user with ID:", result.insertId);

    // Clean up
    await db.query("DELETE FROM users WHERE id = ?", [result.insertId]);
    console.log("SUCCESS: Cleaned up test user");
    process.exit(0);
  } catch (error) {
    console.error("FAIL: Error inserting user:", error);
    process.exit(1);
  }
}

testInsert();
