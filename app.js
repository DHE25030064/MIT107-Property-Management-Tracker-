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

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html'));
});

app.get('/request-details', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'request-details.html'));
});

// API Routes
const requestsRouter = require('./routes/requests');
app.use('/api', requestsRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
