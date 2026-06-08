// =====================================================
// USER ROUTES - Profile Management & Admin User Controls
// =====================================================
// These routes handle user profile operations:
//   GET    /api/users/profile      - Get own profile
//   PUT    /api/users/profile      - Update own profile
//   GET    /api/users              - Admin: list all users
//   DELETE /api/users/:id          - Admin: delete a user
//   PUT    /api/users/:id/suspend  - Admin: suspend/unsuspend
// =====================================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const { verifyToken, authorize } = require('../middleware/auth');

// All routes in this file require authentication
router.use(verifyToken);

// -------------------------------------------------
// GET /api/users/profile
// -------------------------------------------------
// Get the logged-in user's full profile.
// Any authenticated user can access this.
// -------------------------------------------------
router.get('/profile', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, phone, address, avatar, is_suspended, created_at, updated_at 
             FROM users WHERE id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user: result.rows[0] });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
});

// -------------------------------------------------
// PUT /api/users/profile
// -------------------------------------------------
// Update the logged-in user's profile.
// Can update: name, phone, address, avatar, password
// -------------------------------------------------
router.put('/profile', async (req, res) => {
    try {
        const { name, phone, address, avatar, password } = req.body;

        // Start building the update query dynamically
        // We only update fields that were actually provided
        const updates = [];  // Array of "column = $n" strings
        const values = [];   // Array of actual values
        let paramCount = 0;  // Keeps track of parameter numbers ($1, $2, etc.)

        // Add each provided field to the update
        if (name) {
            paramCount++;
            updates.push(`name = $${paramCount}`);
            values.push(name);
        }
        if (phone !== undefined) {
            paramCount++;
            updates.push(`phone = $${paramCount}`);
            values.push(phone);
        }
        if (address !== undefined) {
            paramCount++;
            updates.push(`address = $${paramCount}`);
            values.push(address);
        }
        if (avatar !== undefined) {
            paramCount++;
            updates.push(`avatar = $${paramCount}`);
            values.push(avatar);
        }
        if (password) {
            // Hash the new password before saving
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            paramCount++;
            updates.push(`password = $${paramCount}`);
            values.push(hashedPassword);
        }

        // If nothing to update, return early
        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields provided to update' });
        }

        // Always update the updated_at timestamp
        updates.push(`updated_at = CURRENT_TIMESTAMP`);

        // Add the user ID as the last parameter for the WHERE clause
        paramCount++;
        values.push(req.user.id);

        // Build and execute the query
        const query = `
            UPDATE users 
            SET ${updates.join(', ')} 
            WHERE id = $${paramCount}
            RETURNING id, name, email, role, phone, address, avatar, updated_at
        `;

        const result = await pool.query(query, values);

        res.json({
            message: 'Profile updated successfully!',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
});

// -------------------------------------------------
// GET /api/users (Admin Only)
// -------------------------------------------------
// Get a list of all users. Only admins can do this.
// Supports optional query params: ?role=seller&search=john
// -------------------------------------------------
router.get('/', authorize('admin'), async (req, res) => {
    try {
        const { role, search } = req.query;

        // Build the query with optional filters
        let query = `
            SELECT id, name, email, role, phone, address, avatar, is_suspended, created_at 
            FROM users WHERE 1=1
        `;
        const values = [];
        let paramCount = 0;

        // Filter by role if provided
        if (role) {
            paramCount++;
            query += ` AND role = $${paramCount}`;
            values.push(role);
        }

        // Search by name or email if provided
        if (search) {
            paramCount++;
            query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            values.push(`%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, values);

        res.json({
            count: result.rows.length,
            users: result.rows
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

// -------------------------------------------------
// DELETE /api/users/:id (Admin Only)
// -------------------------------------------------
// Delete a user account. Only admins can do this.
// Admins cannot delete themselves.
// -------------------------------------------------
router.delete('/:id', authorize('admin'), async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        // Prevent admin from deleting themselves
        if (userId === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        // Check if the user exists
        const userCheck = await pool.query('SELECT id, name FROM users WHERE id = $1', [userId]);

        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete the user (CASCADE will also delete their products, orders, etc.)
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        res.json({
            message: `User "${userCheck.rows[0].name}" has been deleted successfully`
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error deleting user' });
    }
});

// -------------------------------------------------
// PUT /api/users/:id/suspend (Admin Only)
// -------------------------------------------------
// Suspend or unsuspend a user. Only admins can do this.
// Send { is_suspended: true } to suspend
// Send { is_suspended: false } to unsuspend
// -------------------------------------------------
router.put('/:id/suspend', authorize('admin'), async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { is_suspended } = req.body;

        // Validate that is_suspended was provided
        if (typeof is_suspended !== 'boolean') {
            return res.status(400).json({
                message: 'Please provide is_suspended as true or false'
            });
        }

        // Prevent admin from suspending themselves
        if (userId === req.user.id) {
            return res.status(400).json({ message: 'You cannot suspend your own account' });
        }

        // Check if user exists
        const userCheck = await pool.query('SELECT id, name FROM users WHERE id = $1', [userId]);

        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the suspension status
        const result = await pool.query(
            `UPDATE users 
             SET is_suspended = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2
             RETURNING id, name, email, role, is_suspended`,
            [is_suspended, userId]
        );

        const action = is_suspended ? 'suspended' : 'unsuspended';

        // Notify the user about their account status change
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type) 
             VALUES ($1, $2, $3, $4)`,
            [
                userId,
                `Account ${action}`,
                is_suspended
                    ? 'Your account has been suspended. Contact support for more information.'
                    : 'Your account has been reactivated. You can now use all features.',
                'system'
            ]
        );

        res.json({
            message: `User "${result.rows[0].name}" has been ${action}`,
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Suspend user error:', error);
        res.status(500).json({ message: 'Server error updating user status' });
    }
});

module.exports = router;
