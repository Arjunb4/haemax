const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
require("dotenv").config();

const router = express.Router();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not defined in .env");
  process.exit(1);
}

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

// User Signup
router.post("/signup", async (req, res) => {
  console.log("Signup Request Received:", req.body);
  let { fname, lname, phone, email, password, profilePic } = req.body;

  // Check if all required fields are present
  if (!fname || !lname || !phone || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    email = email.toLowerCase();

    // Check if user already exists
    const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Set default profile picture if not provided
    if (!profilePic) {
      profilePic = "https://example.com/default-profile.png"; // Replace with your default image URL
    }

    // Insert new user into the database
    await db.query(
      "INSERT INTO users (name, lname, phone, email, password, profilePic) VALUES (?, ?, ?, ?, ?, ?)",
      [fname, lname, phone, email, hashedPassword, profilePic]
    );

    console.log("User registered:", email);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// User Login
router.post("/login", async (req, res) => {
  console.log("Login Request Received:", req.body);
  let { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    email = email.toLowerCase();

    // Fetch user data (including profilePic, status, role)
    const [users] = await db.query("SELECT id, email, password, profilePic, status, role FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      console.log("Invalid credentials for:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    // Compare password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid credentials for:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.status === 'denied') {
      return res.status(403).json({ error: "Your account has been deactivated. Please contact support." });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",  // Token expiration time
    });

    // Set the JWT token in an HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure cookies in production (HTTPS)
      sameSite: "Strict",  // Prevent CSRF attacks
    });

    console.log("Login successful, token generated for:", email);
    res.status(200).json({
      message: "Login successful",
      token,
      profilePic: user.profilePic, // Include profile picture in the response
      role: user.role, // Return role
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Get User Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // Get user details based on user ID extracted from the JWT token
    const [users] = await db.query("SELECT id, name as fname, lname, email, phone, profilePic FROM users WHERE id = ?", [req.user.userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user profile details
    res.status(200).json(users[0]);
  } catch (error) {
    console.error("Profile Fetch Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const userEmail = email.toLowerCase();
    const [users] = await db.query("SELECT id FROM users WHERE email = ?", [userEmail]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a simple random token (for local testing)
    const resetToken = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    // Set expiry to 1 hour from now
    const resetTokenExpiry = new Date(Date.now() + 3600000); 

    await db.query(
      "UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?",
      [resetToken, resetTokenExpiry, userEmail]
    );

    // MOCK FLOW: Return token directly in the response so we can test it locally
    // In production, you would send this token in an email!
    res.status(200).json({ 
      message: "Password reset token generated",
      mockToken: resetToken 
    });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ error: "Token and new password are required" });

  try {
    // Find user with this token and ensure it's not expired
    const [users] = await db.query(
      "SELECT id, email FROM users WHERE resetToken = ? AND resetTokenExpiry > NOW()",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token fields
    await db.query(
      "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Google Login/Signup
router.post("/google", async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    // Fetch user info from Google using the access token
    const googleResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!googleResponse.ok) {
      return res.status(401).json({ error: "Invalid Google token" });
    }

    const userInfo = await googleResponse.json();
    const { email, given_name, family_name, picture } = userInfo;
    
    if (!email) {
      return res.status(400).json({ error: "Could not fetch email from Google" });
    }

    const userEmail = email.toLowerCase();
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [userEmail]);

    let user;

    if (users.length === 0) {
      // User doesn't exist, create a new one
      // Generate random secure password
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);
      
      const phone = "Not Provided";
      const name = given_name || "User";
      const lname = family_name || "";
      const profilePic = picture || "https://example.com/default-profile.png";

      const [result] = await db.query(
        "INSERT INTO users (name, lname, phone, email, password, profilePic) VALUES (?, ?, ?, ?, ?, ?)",
        [name, lname, phone, userEmail, hashedPassword, profilePic]
      );
      
      user = { id: result.insertId, email: userEmail, profilePic, role: 'user', status: 'active' };
      console.log("New user registered via Google:", userEmail);
    } else {
      user = users[0];
      if (user.status === 'denied') {
        return res.status(403).json({ error: "Your account has been deactivated. Please contact support." });
      }
      console.log("User logged in via Google:", userEmail);
    }

    // Generate JWT token
    const jwtToken = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.status(200).json({
      message: "Google Authentication successful",
      token: jwtToken,
      profilePic: user.profilePic,
      role: user.role,
    });

  } catch (error) {
    console.error("Google Auth Error:", error.message);
    res.status(500).json({ error: "Server error during Google Auth", details: error.message });
  }
});

module.exports = router;
