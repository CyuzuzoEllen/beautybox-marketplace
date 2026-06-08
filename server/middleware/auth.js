// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================
// This middleware does two important things:
//
// 1. verifyToken - Checks if the user is logged in by
//    verifying their JWT (JSON Web Token). Every time a
//    user makes a request to a protected route, we check
//    their token to make sure they're legit.
//
// 2. authorize - Checks if the user has the RIGHT ROLE
//    to access a route. For example, only admins can
//    delete users, only sellers can create products, etc.
//
// How JWT works (simplified):
//   - User logs in → server creates a token with user info
//   - User sends token with every request (in the header)
//   - Server verifies the token → knows who the user is
// =====================================================

const jwt = require('jsonwebtoken');
require('dotenv').config();

// -------------------------------------------------
// MIDDLEWARE: Verify JWT Token
// -------------------------------------------------
// This runs before protected routes to check if the
// user has a valid token. If yes, it adds the user
// info to req.user so route handlers can use it.
// -------------------------------------------------
const verifyToken = (req, res, next) => {
    try {
        // Step 1: Get the token from the Authorization header
        // The header looks like: "Bearer eyJhbGciOiJIUzI1NiIs..."
        const authHeader = req.headers['authorization'];

        // If there's no Authorization header, the user isn't logged in
        if (!authHeader) {
            return res.status(401).json({
                message: 'Access denied. No token provided. Please log in.'
            });
        }

        // Step 2: Extract just the token part (remove "Bearer ")
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: 'Access denied. Token format is invalid.'
            });
        }

        // Step 3: Verify the token using our secret key
        // If the token is valid, 'decoded' will contain the user info
        // we put in when we created the token (id, email, role)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Step 4: Attach the user info to the request object
        // Now any route handler can use req.user to know who's making the request
        req.user = decoded;

        // Step 5: Move on to the next middleware or route handler
        next();
    } catch (error) {
        // If the token is expired or tampered with, jwt.verify will throw an error
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token has expired. Please log in again.'
            });
        }
        return res.status(401).json({
            message: 'Invalid token. Please log in again.'
        });
    }
};

// -------------------------------------------------
// MIDDLEWARE: Role-Based Authorization
// -------------------------------------------------
// This checks if the logged-in user has the required
// role to access a route. Pass in the allowed roles.
//
// Usage examples:
//   authorize('admin')           → only admins
//   authorize('seller')          → only sellers
//   authorize('admin', 'seller') → admins OR sellers
// -------------------------------------------------
const authorize = (...roles) => {
    // Return a middleware function that checks the user's role
    return (req, res, next) => {
        // Make sure verifyToken ran first (req.user should exist)
        if (!req.user) {
            return res.status(401).json({
                message: 'Please log in first.'
            });
        }

        // Check if the user's role is in the list of allowed roles
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. This action requires one of these roles: ${roles.join(', ')}. Your role is: ${req.user.role}.`
            });
        }

        // User has the right role, let them through!
        next();
    };
};

// Export both middleware functions
module.exports = { verifyToken, authorize };
