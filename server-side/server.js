const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
    
app.get('/', (req, res) => {
    res.send('Welcome to the Haemax API!');
});

// ✅ Enable CORS with proper settings
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        // or any local development origin
        if (!origin || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
            callback(null, true);
        } else if (origin === process.env.CLIENT_URL) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allows cookies & auth headers
}));

// ✅ Middleware to parse JSON & URL-encoded data
app.use(express.json({ limit: "50mb" })); // Replaces body-parser.json()
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Replaces body-parser.urlencoded()

// ✅ Import Routes
const donorRoutes = require("./routes/donorRoutes");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profile");
const receiverRoutes = require("./routes/receiverRoutes");
const adminRoutes = require("./routes/adminRoutes");

// ✅ Use Routes
app.use("/api/donors", donorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/receivers", receiverRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Default 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Server Error:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// ✅ Check for JWT_SECRET in .env
if (!process.env.JWT_SECRET) {
    console.warn("JWT_SECRET is not defined in the environment; auth routes may fail until it is configured.");
}

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
