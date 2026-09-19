const db = require("../config/db");

const adminMiddleware = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Fetch the user's role from the database
    const [users] = await db.query("SELECT role FROM users WHERE id = ?", [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    if (user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    // User is an admin, proceed to the route
    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error.message);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

module.exports = adminMiddleware;
