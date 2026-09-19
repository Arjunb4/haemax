const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Ensure this is correctly imported
const authMiddleware = require("../middleware/authMiddleware");

// POST route to insert donor details
router.post("/", async (req, res) => {
  try {
    console.log("Received Data:", req.body); // Debugging log

    const { name, phone, email, blood_type, gender, weight, dob, lastDonatedDate, city, district } = req.body;

    // Check for missing required fields
    if (!name || !phone || !email || !blood_type || !gender || !weight || !dob || !city || !district) {
      return res.status(400).json({ success: false, error: "All required fields must be filled" });
    }

    // ✅ Corrected SQL Query with proper column names
    const sql = `INSERT INTO donors (name, phone, email, blood_type, gender, weight, dob, lastDonatedDate, city, district) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await pool.query(sql, [name, phone, email, blood_type, gender, weight, dob, lastDonatedDate || null, city, district]);

    res.json({ success: true, message: "Donor registered successfully!" });
  } catch (error) {
    console.error("Database Insert Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/search", async (req, res) => {
  try {
    let { blood_type, district, city } = req.query;

    // Trim and format inputs
    blood_type = blood_type.trim().toUpperCase();
    district = district.trim();
    city = city.trim();

    console.log("🔍 Cleaned Search Params:", { blood_type, district, city });

    // Validate that all parameters are provided
    if (!blood_type || !district || !city) {
      return res.status(400).json({ error: "All fields (blood_type, district, city) are required" });
    }

    // Build SQL query with strict matching and JOIN with users to get profilePic
    const query = `
      SELECT 
        d.id, d.name, d.dob, d.phone, d.blood_type, d.city, d.district, 
        d.availability, d.gender, d.weight, d.lastDonatedDate,
        u.profilePic 
      FROM donors d
      LEFT JOIN users u ON d.email = u.email
      WHERE d.blood_type = ? 
      AND LOWER(TRIM(d.district)) = LOWER(?) 
      AND LOWER(TRIM(d.city)) = LOWER(?)`;

    console.log("📝 SQL Query:", query);
    console.log("🔹 Query Params:", [blood_type, district, city]);

    // Execute query
    const [donors] = await pool.query(query, [blood_type, district, city]);

    console.log("📌 Query Result:", donors);

    if (donors.length === 0) {
      return res.status(404).json({ message: "No donors found" });
    }

    res.json(donors);
  } catch (error) {
    console.error("❌ Search Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// GET route to fetch logged-in user's donation record
router.get("/my-donations", authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user.email; // From JWT payload
    const query = `
      SELECT id, name, blood_type, district, city, availability, lastDonatedDate 
      FROM donors 
      WHERE email = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const [donors] = await pool.query(query, [userEmail]);

    if (donors.length === 0) {
      return res.status(404).json({ message: "No donation record found" });
    }

    res.json(donors[0]);
  } catch (error) {
    console.error("Fetch My Donations Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// GET route to fetch active donor counts by blood group and total registered counts
router.get("/stats", async (req, res) => {
  try {
    const query = `
      SELECT blood_type, COUNT(*) as count 
      FROM donors 
      GROUP BY blood_type
    `;
    const [rows] = await pool.query(query);
    
    // Format response as a neat object/map
    const stats = {
      "A+": 0, "A-": 0, "B+": 0, "B-": 0,
      "O+": 0, "O-": 0, "AB+": 0, "AB-": 0
    };
    
    rows.forEach(row => {
      if (row.blood_type) {
        const bt = row.blood_type.toUpperCase().trim();
        if (stats[bt] !== undefined) {
          stats[bt] = row.count;
        }
      }
    });

    // Also get total active donors count and total receivers count
    const [totalDonorsRows] = await pool.query("SELECT COUNT(*) as total FROM donors");
    const [totalReceiversRows] = await pool.query("SELECT COUNT(*) as total FROM receivers");

    res.json({
      success: true,
      bloodGroups: stats,
      totalDonors: totalDonorsRows[0]?.total || 0,
      totalReceivers: totalReceiversRows[0]?.total || 0
    });
  } catch (error) {
    console.error("Fetch Stats Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

module.exports = router;

