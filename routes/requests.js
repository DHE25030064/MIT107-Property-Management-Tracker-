const express = require('express');
const router = express.Router();
const db = require('../database/db');

// API to create a new maintenance request (Tenant)
router.post('/tenant/requests', (req, res) => {
    let { title, description, userId } = req.body;
    
    if (!title || !description || !userId) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    title = title.trim();
    description = description.trim();

    if (title.length < 5 || description.length < 10) {
        return res.status(400).json({ message: 'Title or description too short' });
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
router.get('/tenant/requests', (req, res) => {
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

// API to get all requests for admin
router.get('/admin/requests', (req, res) => {
    const query = `SELECT id, title, description, status, user_id FROM MaintenanceRequests ORDER BY id DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        res.json(rows);
    });
});

// API to update request status (Admin)
router.put('/admin/requests/:id', (req, res) => {
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

// API to get a single request by ID
router.get('/requests/:id', (req, res) => {
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

module.exports = router;
