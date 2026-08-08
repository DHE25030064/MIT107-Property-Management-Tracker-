const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Create schema
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'tenant'
            )`, (err) => {
                if (!err) {
                    db.get(`SELECT COUNT(*) as count FROM Users`, (err, row) => {
                        if (!err && row.count === 0) {
                            const insert = db.prepare(`INSERT INTO Users (username, password, role) VALUES (?, ?, ?)`);
                            insert.run('admin', 'admin123', 'admin');
                            insert.run('tenant', 'tenant123', 'tenant');
                            insert.finalize();
                            console.log('Database seeded with initial users.');
                        }
                    });
                }
            });

            db.run(`CREATE TABLE IF NOT EXISTS MaintenanceRequests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Pending',
                user_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES Users(id)
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS StatusHistory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_id INTEGER,
                old_status TEXT,
                new_status TEXT,
                changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(request_id) REFERENCES MaintenanceRequests(id)
            )`);
            
            console.log('Database schema created successfully.');
        });
    }
});

module.exports = db;
