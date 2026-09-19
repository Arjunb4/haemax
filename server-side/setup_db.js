const db = require('./config/db');

async function updateSchema() {
    try {
        console.log("Adding role and status columns to users table...");
        try {
            await db.query("ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user'");
            console.log("Added role column.");
        } catch (e) {
            console.log("Role column might already exist:", e.message);
        }
        
        try {
            await db.query("ALTER TABLE users ADD COLUMN status ENUM('active', 'denied') DEFAULT 'active'");
            console.log("Added status column.");
        } catch (e) {
            console.log("Status column might already exist:", e.message);
        }
        
        console.log("Creating hospitals table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS hospitals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                contact VARCHAR(20) NOT NULL,
                available_beds INT DEFAULT 0,
                blood_inventory LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Hospitals table ready.");

        // Let's also make the first user an admin just for testing
        await db.query("UPDATE users SET role = 'admin' LIMIT 1");
        console.log("Set first user to admin.");
        
        console.log("Schema update complete!");
        process.exit(0);
    } catch (error) {
        console.error("Error updating schema:", error);
        process.exit(1);
    }
}

updateSchema();
