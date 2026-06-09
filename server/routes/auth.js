// =====================================================
// AUTH ROUTES - Registration, Login, and Current User
// =====================================================
// These routes handle user authentication:
//   POST /api/auth/register - Create a new account
//   POST /api/auth/login    - Log in to get a token
//   GET  /api/auth/me       - Get current user's info
//
// We use bcryptjs to hash passwords (never store plain
// text passwords!) and jsonwebtoken to create JWTs.
// =====================================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');
const { verifyToken } = require('../middleware/auth');

// -------------------------------------------------
// POST /api/auth/register
// -------------------------------------------------
// Creates a new user account.
// Expects: { name, email, password, role (optional) }
// Returns: { token, user }
// -------------------------------------------------
router.post(
    '/register',
    [
        // Validation rules using express-validator
        body('name')
            .trim()
            .notEmpty().withMessage('Name is required')
            .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
        body('email')
            .trim()
            .isEmail().withMessage('Please provide a valid email address')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('role')
            .optional()
            .isIn(['customer', 'seller']).withMessage('Role must be either customer or seller'),
    ],
    async (req, res) => {
        try {
            // Step 1: Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            // Step 2: Get the data from the request body
            const { name, email, password, role } = req.body;

            // Step 3: Check if a user with this email already exists
            const existingUser = await pool.query(
                'SELECT id FROM users WHERE email = $1',
                [email]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({
                    message: 'An account with this email already exists'
                });
            }

            // Step 4: Hash the password before saving
            // The number 10 is the "salt rounds" - higher = more secure but slower
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Step 5: Insert the new user into the database
            const newUser = await pool.query(
                `INSERT INTO users (name, email, password, role) 
                 VALUES ($1, $2, $3, $4)`,
                [name, email, hashedPassword, role || 'customer']
            );

            const user = newUser.rows[0];

            // Step 6: Create a JWT token for the new user
            // The token contains the user's id, email, and role
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' } // Token expires in 24 hours
            );

            // Step 7: Create a welcome notification
            await pool.query(
                `INSERT INTO notifications (user_id, title, message, type) 
                 VALUES ($1, $2, $3, $4)`,
                [user.id, 'Welcome to BeautyBox!', 'Thanks for creating your account. Enjoy shopping!', 'system']
            );

            // Step 8: Send back the token and user info
            res.status(201).json({
                message: 'Account created successfully!',
                token,
                user
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Server error during registration' });
        }
    }
);

// -------------------------------------------------
// POST /api/auth/login
// -------------------------------------------------
// Logs in an existing user.
// Expects: { email, password }
// Returns: { token, user }
// -------------------------------------------------
router.post(
    '/login',
    [
        // Validation rules
        body('email')
            .trim()
            .isEmail().withMessage('Please provide a valid email address')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        try {
            // Step 1: Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { email, password } = req.body;

            // Step 2: Find the user by email
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            // If no user found with that email
            if (result.rows.length === 0) {
                return res.status(401).json({
                    message: 'Invalid email or password'
                });
            }

            const user = result.rows[0];

            // Step 3: Check if the account is suspended
            if (user.is_suspended) {
                return res.status(403).json({
                    message: 'Your account has been suspended. Contact support for help.'
                });
            }

            // Step 4: Compare the provided password with the stored hash
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    message: 'Invalid email or password'
                });
            }

            // Step 5: Create a JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Step 6: Send back the token and user info (WITHOUT the password!)
            res.json({
                message: 'Login successful!',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    address: user.address,
                    avatar: user.avatar,
                    created_at: user.created_at
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login' });
        }
    }
);

// -------------------------------------------------
// GET /api/auth/me
// -------------------------------------------------
// Gets the currently logged-in user's info.
// Requires: Valid JWT token in Authorization header
// Returns: { user }
// -------------------------------------------------
router.get('/me', verifyToken, async (req, res) => {
    try {
        // req.user was set by the verifyToken middleware
        // It contains { id, email, role } from the JWT
        const result = await pool.query(
            'SELECT id, name, email, role, phone, address, avatar, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user: result.rows[0] });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Server error fetching user info' });
    }
});

module.exports = router;
