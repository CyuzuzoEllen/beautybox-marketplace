// =====================================================
// WISHLIST ROUTES - Save Products for Later
// =====================================================
// These routes let customers manage their wishlist:
//   GET    /api/wishlist              - Get user's wishlist
//   POST   /api/wishlist              - Add a product to wishlist
//   DELETE /api/wishlist/:productId   - Remove from wishlist
// =====================================================

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { verifyToken } = require('../middleware/auth');

// All wishlist routes require authentication
router.use(verifyToken);

// -------------------------------------------------
// GET /api/wishlist
// -------------------------------------------------
// Get the logged-in user's entire wishlist.
// Includes product details like name, price, image.
// -------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                w.id AS wishlist_id,
                w.created_at AS added_at,
                p.id AS product_id,
                p.name,
                p.description,
                p.price,
                p.image,
                p.stock,
                p.is_active,
                u.name AS seller_name,
                c.name AS category_name
             FROM wishlist w
             JOIN products p ON w.product_id = p.id
             LEFT JOIN users u ON p.seller_id = u.id
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE w.user_id = $1
             ORDER BY w.created_at DESC`,
            [req.user.id]
        );

        res.json({
            count: result.rows.length,
            wishlist: result.rows
        });

    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ message: 'Server error fetching wishlist' });
    }
});

// -------------------------------------------------
// POST /api/wishlist
// -------------------------------------------------
// Add a product to the user's wishlist.
// Expects: { product_id }
// -------------------------------------------------
router.post('/', async (req, res) => {
    try {
        const { product_id } = req.body;

        // Validate input
        if (!product_id) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        // Check if the product exists
        const productCheck = await pool.query(
            'SELECT id, name FROM products WHERE id = $1',
            [product_id]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the product is already in the wishlist
        const existingItem = await pool.query(
            'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
            [req.user.id, product_id]
        );

        if (existingItem.rows.length > 0) {
            return res.status(400).json({ message: 'Product is already in your wishlist' });
        }

        // Add to wishlist
        const result = await pool.query(
            `INSERT INTO wishlist (user_id, product_id) 
             VALUES ($1, $2) 
             RETURNING *`,
            [req.user.id, product_id]
        );

        res.status(201).json({
            message: `"${productCheck.rows[0].name}" added to your wishlist!`,
            wishlistItem: result.rows[0]
        });

    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ message: 'Server error adding to wishlist' });
    }
});

// -------------------------------------------------
// DELETE /api/wishlist/:productId
// -------------------------------------------------
// Remove a product from the user's wishlist.
// Uses the product ID (not the wishlist entry ID)
// for easier use on the frontend.
// -------------------------------------------------
router.delete('/:productId', async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);

        // Check if the item is in the user's wishlist
        const itemCheck = await pool.query(
            'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
            [req.user.id, productId]
        );

        if (itemCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found in your wishlist' });
        }

        // Remove from wishlist
        await pool.query(
            'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2',
            [req.user.id, productId]
        );

        res.json({ message: 'Product removed from your wishlist' });

    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ message: 'Server error removing from wishlist' });
    }
});

module.exports = router;
