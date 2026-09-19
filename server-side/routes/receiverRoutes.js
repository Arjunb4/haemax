const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.post("/", async (req, res) => {
  try {
    const { name, phone, blood_type, district, city } = req.body;

    // Validate required fields
    if (!name || !phone || !blood_type || !district || !city) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const query = `
      INSERT INTO receivers (name, phone, blood_type, district, city)
      VALUES (?, ?, ?, ?, ?)
    `;

    await pool.query(query, [
      name.trim(),
      phone.trim(),
      blood_type.trim().toUpperCase(),
      district.trim(),
      city.trim()
    ]);

    res.status(201).json({ message: "Receiver registered successfully" });
  } catch (error) {
    console.error("Receiver Insert Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// GET route to fetch all receivers
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT id, name, phone, blood_type, district, city, created_at
      FROM receivers
      ORDER BY created_at DESC
    `;
    const [receivers] = await pool.query(query);
    res.json(receivers);
  } catch (error) {
    console.error("Fetch Receivers Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;
