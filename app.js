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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
