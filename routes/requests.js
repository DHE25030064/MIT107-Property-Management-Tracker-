const express = require('express');
const router = express.Router();
const db = require('../database/db');

// ==========================================
// Tenant Routes
// ==========================================

// API to create a new maintenance request (Tenant)
router.post('/tenant/requests', (req, res) => {
    let { title, description, userId } = req.body;
    
    // Ensure all required fields are present
    if (!title || !description || !userId) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    title = title.trim();
    description = description.trim();

    // Client and server-side validation to ensure content meets minimum length
    if (title.length < 5 || description.length < 10) {
        return res.status(400).json({ message: 'Title or description too short' });
    }

    // Parameterized query for inserting new request
    const query = `INSERT INTO MaintenanceRequests (title, description, user_id) VALUES (?, ?, ?)`;
    db.run(query, [title, description, userId], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        res.json({ message: 'Request created', id: this.lastID });
    });
});

// API to get requests for a specific tenant
router.get('/tenant/requests', (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ message: 'Missing userId' });
    }

    // Retrieve only the requests belonging to the logged-in tenant
    const query = `SELECT id, title, description, status FROM MaintenanceRequests WHERE user_id = ? ORDER BY id DESC`;
    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        res.json(rows);
    });
});

// ==========================================
// Admin Routes
// ==========================================

// API to get all requests across the system (Admin only)
router.get('/admin/requests', (req, res) => {
    // Retrieve all requests in descending order (newest first)
    const query = `SELECT id, title, description, status, user_id FROM MaintenanceRequests ORDER BY id DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        res.json(rows);
    });
});

// API to update request status (Admin only)
router.put('/admin/requests/:id', (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    
    if (!status) {
        return res.status(400).json({ message: 'Missing status' });
    }

    // Update the status of a specific request
    const query = `UPDATE MaintenanceRequests SET status = ? WHERE id = ?`;
    db.run(query, [status, id], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        res.json({ message: 'Status updated' });
    });
});

// ==========================================
// Shared Routes
// ==========================================

// API to get a single request by ID (Used by Request Details page)
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

// API to update a request (Tenant)
router.put('/tenant/requests/:id', (req, res) => {
    const id = req.params.id;
    let { title, description, userId } = req.body;
    
    if (!title || !description || !userId) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    title = title.trim();
    description = description.trim();

    if (title.length < 5 || description.length < 10) {
        return res.status(400).json({ message: 'Title or description too short' });
    }

    // Only allow update if status is Pending and it belongs to the user
    const checkQuery = `SELECT status FROM MaintenanceRequests WHERE id = ? AND user_id = ?`;
    db.get(checkQuery, [id, userId], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!row) return res.status(404).json({ message: 'Request not found or access denied' });
        if (row.status !== 'Pending') return res.status(400).json({ message: 'Cannot edit a request that is no longer pending' });

        const updateQuery = `UPDATE MaintenanceRequests SET title = ?, description = ? WHERE id = ?`;
        db.run(updateQuery, [title, description, id], function(err) {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json({ message: 'Request updated' });
        });
    });
});

// API to delete a request
router.delete('/requests/:id', (req, res) => {
    const id = req.params.id;
    const userId = req.query.userId;
    const role = req.query.role; // Pass role to allow admin to delete any

    if (!userId || !role) {
        return res.status(400).json({ message: 'Missing user context' });
    }

    const checkQuery = `SELECT user_id, status FROM MaintenanceRequests WHERE id = ?`;
    db.get(checkQuery, [id], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!row) return res.status(404).json({ message: 'Request not found' });
        
        // Tenant can only delete if it's theirs and pending
        if (role === 'tenant') {
            if (row.user_id != userId) return res.status(403).json({ message: 'Access denied' });
            if (row.status !== 'Pending') return res.status(400).json({ message: 'Cannot delete a request that is in progress or completed' });
        }

        const deleteQuery = `DELETE FROM MaintenanceRequests WHERE id = ?`;
        db.run(deleteQuery, [id], function(err) {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json({ message: 'Request deleted' });
        });
    });
});

module.exports = router;
