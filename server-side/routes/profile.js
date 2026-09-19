const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");  // Correct import
const router = express.Router();

// Profile route with authentication middleware
// Get User Profile
router.get("/", authMiddleware, async (req, res) => {  // Use authMiddleware here
  try {
    console.log("Request received for user ID:", req.user.userId);  // Log user ID
    const [users] = await db.query("SELECT id, name as fname, lname, email, phone, profilePic, bloodGroup, lastDonated FROM users WHERE id = ?", [req.user.userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(users[0]);
  } catch (error) {
    console.error("Profile Fetch Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Update User Profile
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { fname, lname, phone, profilePic, bloodGroup, lastDonated } = req.body;
    const userId = req.user.userId;

    if (!fname || !lname || !phone) {
      return res.status(400).json({ error: "First name, last name, and phone are required" });
    }

    let query = "UPDATE users SET name = ?, lname = ?, phone = ?, bloodGroup = ?, lastDonated = ? WHERE id = ?";
    let params = [fname, lname, phone, bloodGroup || null, lastDonated || 'Never', userId];

    // If a new profile picture was uploaded (base64 string)
    if (profilePic && profilePic.startsWith("data:image")) {
      query = "UPDATE users SET name = ?, lname = ?, phone = ?, profilePic = ?, bloodGroup = ?, lastDonated = ? WHERE id = ?";
      params = [fname, lname, phone, profilePic, bloodGroup || null, lastDonated || 'Never', userId];
    }

    await db.query(query, params);
    
    res.status(200).json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Profile Update Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
