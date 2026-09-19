const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Apply auth and admin middleware to all routes in this file
router.use(authMiddleware);
router.use(adminMiddleware);

// --- User Management ---

// Get all users
router.get("/users", async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name as fname, lname, email, phone, profilePic, role, status, created_at FROM users"
    );
    res.status(200).json(users);
  } catch (error) {
    console.error("Fetch Users Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Update user status (block/unblock)
router.put("/users/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'denied'].includes(status)) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  try {
    await db.query("UPDATE users SET status = ? WHERE id = ?", [status, id]);
    res.status(200).json({ message: `User status updated to ${status}.` });
  } catch (error) {
    console.error("Update User Status Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// --- Hospital Availability ---

// Get all hospitals
router.get("/hospitals", async (req, res) => {
  try {
    const [hospitals] = await db.query("SELECT * FROM hospitals ORDER BY created_at DESC");
    res.status(200).json(hospitals);
  } catch (error) {
    console.error("Fetch Hospitals Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Add a new hospital
router.post("/hospitals", async (req, res) => {
  const { name, location, contact, available_beds, blood_inventory } = req.body;

  if (!name || !location || !contact) {
    return res.status(400).json({ error: "Name, location, and contact are required." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO hospitals (name, location, contact, available_beds, blood_inventory) VALUES (?, ?, ?, ?, ?)",
      [name, location, contact, available_beds || 0, blood_inventory || '']
    );
    res.status(201).json({ id: result.insertId, message: "Hospital added successfully." });
  } catch (error) {
    console.error("Add Hospital Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Delete a hospital
router.delete("/hospitals/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM hospitals WHERE id = ?", [id]);
    res.status(200).json({ message: "Hospital deleted successfully." });
  } catch (error) {
    console.error("Delete Hospital Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// --- Donation Requests (Receivers) ---

// Get all donation requests
router.get("/requests", async (req, res) => {
  try {
    const [requests] = await db.query("SELECT * FROM receivers ORDER BY created_at DESC");
    res.status(200).json(requests);
  } catch (error) {
    console.error("Fetch Requests Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// --- Match & Fulfill (Donors & Hospitals) ---

// Get matches for a receiver request
router.get("/match", async (req, res) => {
  const { blood_type, district, city } = req.query;

  if (!blood_type) {
    return res.status(400).json({ error: "Blood type is required." });
  }

  try {
    // 1. Fetch matching active donors
    // Prioritizes matching city first, then district, then any matching blood type
    const donorQuery = `
      SELECT id, name, phone, email, city, district, availability, blood_type, gender 
      FROM donors 
      WHERE blood_type = ? AND availability = 1
      ORDER BY 
        CASE 
          WHEN LOWER(TRIM(city)) = LOWER(?) THEN 1
          WHEN LOWER(TRIM(district)) = LOWER(?) THEN 2
          ELSE 3
        END ASC
    `;
    const [donors] = await db.query(donorQuery, [blood_type, city || '', district || '']);

    // 2. Fetch matching hospitals
    // Prioritizes hospitals in the same district/city
    const hospitalQuery = `
      SELECT id, name, location, contact, available_beds, blood_inventory 
      FROM hospitals 
      ORDER BY 
        CASE 
          WHEN LOWER(TRIM(location)) LIKE LOWER(CONCAT('%', ?, '%')) THEN 1
          ELSE 2
        END ASC
    `;
    const [hospitals] = await db.query(hospitalQuery, [city || district || '']);

    res.status(200).json({ donors, hospitals });
  } catch (error) {
    console.error("Match Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
