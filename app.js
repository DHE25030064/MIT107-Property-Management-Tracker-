const express = require('express');
const path = require('path');
const db = require('./database/db'); // This connects to SQLite

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (css, js, images)
app.use(express.static(path.join(__dirname, 'public')));

// Set up routes (Placeholders for Day 1)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Authentication API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    
    const query = 'SELECT id, username, role FROM Users WHERE username = ? AND password = ?';
    db.get(query, [username, password], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        
        if (row) {
            res.json({ message: 'Login successful', user: row });
        } else {
            res.status(401).json({ message: 'Invalid username or password.' });
        }
    });
});

app.get('/tenant-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'tenant-dashboard.html'));
});

// API to create a new maintenance request
app.post('/api/tenant/requests', (req, res) => {
    const { title, description, userId } = req.body;
    if (!title || !description || !userId) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    const query = `INSERT INTO MaintenanceRequests (title, description, user_id) VALUES (?, ?, ?)`;
    db.run(query, [title, description, userId], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        res.json({ message: 'Request created', id: this.lastID });
    });
});

// API to get requests for a tenant
app.get('/api/tenant/requests', (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ message: 'Missing userId' });
    }

    const query = `SELECT id, title, description, status FROM MaintenanceRequests WHERE user_id = ? ORDER BY id DESC`;
    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        res.json(rows);
    });
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html'));
});

// API to get all requests for admin
app.get('/api/admin/requests', (req, res) => {
    const query = `SELECT id, title, description, status, user_id FROM MaintenanceRequests ORDER BY id DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        res.json(rows);
    });
});

// API to update request status
app.put('/api/admin/requests/:id', (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    
    if (!status) {
        return res.status(400).json({ message: 'Missing status' });
    }

    const query = `UPDATE MaintenanceRequests SET status = ? WHERE id = ?`;
    db.run(query, [status, id], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        res.json({ message: 'Status updated' });
    });
});

app.get('/request-details', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'request-details.html'));
});

// API to get a single request by ID
app.get('/api/requests/:id', (req, res) => {
    const id = req.params.id;
    const query = `SELECT id, title, description, status, user_id, created_at FROM MaintenanceRequests WHERE id = ?`;
    
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        if (!row) {
            return res.status(404).json({ message: 'Request not found.' });
        }
        res.json(row);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
