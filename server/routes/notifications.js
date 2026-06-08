// =====================================================
// NOTIFICATION ROUTES - In-App Notifications
// =====================================================
// These routes manage user notifications:
//   GET /api/notifications            - Get user's notifications
//   PUT /api/notifications/:id/read   - Mark one as read
//   PUT /api/notifications/read-all   - Mark all as read
// =====================================================

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { verifyToken } = require('../middleware/auth');

// All notification routes require authentication
router.use(verifyToken);

// -------------------------------------------------
// GET /api/notifications
// -------------------------------------------------
// Get the logged-in user's notifications.
// Most recent notifications come first.
// Also returns count of unread notifications.
// -------------------------------------------------
router.get('/', async (req, res) => {
    try {
        // Get all notifications for the user
        const result = await pool.query(
            `SELECT * FROM notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [req.user.id]
        );

        // Count unread notifications
        const unreadResult = await pool.query(
            'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
            [req.user.id]
        );

        res.json({
            unread_count: parseInt(unreadResult.rows[0].count),
            total_count: result.rows.length,
            notifications: result.rows
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
});

// -------------------------------------------------
// PUT /api/notifications/read-all
// -------------------------------------------------
// Mark ALL of the user's notifications as read.
// This must be defined BEFORE /:id/read to avoid
// "read-all" being treated as an ID!
// -------------------------------------------------
router.put('/read-all', async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE notifications 
             SET is_read = true 
             WHERE user_id = $1 AND is_read = false`,
            [req.user.id]
        );

        res.json({
            message: `${result.rowCount} notification(s) marked as read`
        });

    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ message: 'Server error updating notifications' });
    }
});

// -------------------------------------------------
// PUT /api/notifications/:id/read
// -------------------------------------------------
// Mark a single notification as read.
// Users can only mark their own notifications.
// -------------------------------------------------
router.put('/:id/read', async (req, res) => {
    try {
        const notificationId = parseInt(req.params.id);

        // Check if the notification exists and belongs to this user
        const notifCheck = await pool.query(
            'SELECT id, user_id FROM notifications WHERE id = $1',
            [notificationId]
        );

        if (notifCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (notifCheck.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only read your own notifications' });
        }

        // Mark as read
        await pool.query(
            'UPDATE notifications SET is_read = true WHERE id = $1',
            [notificationId]
        );

        res.json({ message: 'Notification marked as read' });

    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ message: 'Server error updating notification' });
    }
});

module.exports = router;
