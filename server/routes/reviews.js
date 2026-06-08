// =====================================================
// REVIEW ROUTES - Product Reviews & Ratings
// =====================================================
// These routes handle product reviews:
//   GET    /api/reviews/product/:productId - Get reviews for a product (public)
//   POST   /api/reviews                    - Customer: create a review
//   PUT    /api/reviews/:id                - Customer: update own review
//   DELETE /api/reviews/:id                - Customer/Admin: delete a review
// =====================================================

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { verifyToken, authorize } = require('../middleware/auth');

// -------------------------------------------------
// GET /api/reviews/product/:productId (Public)
// -------------------------------------------------
// Get all reviews for a specific product.
// Includes the reviewer's name and the average rating.
// -------------------------------------------------
router.get('/product/:productId', async (req, res) => {
    try {
        const productId = parseInt(req.params.productId);

        // Check if the product exists
        const productCheck = await pool.query(
            'SELECT id, name FROM products WHERE id = $1',
            [productId]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Get all reviews for this product
        const result = await pool.query(
            `SELECT 
                r.*,
                u.name AS customer_name,
                u.avatar AS customer_avatar
             FROM reviews r
             JOIN users u ON r.customer_id = u.id
             WHERE r.product_id = $1
             ORDER BY r.created_at DESC`,
            [productId]
        );

        // Calculate the average rating
        const avgResult = await pool.query(
            'SELECT COALESCE(AVG(rating), 0) AS average_rating, COUNT(*) AS total_reviews FROM reviews WHERE product_id = $1',
            [productId]
        );

        res.json({
            product_name: productCheck.rows[0].name,
            average_rating: parseFloat(parseFloat(avgResult.rows[0].average_rating).toFixed(1)),
            total_reviews: parseInt(avgResult.rows[0].total_reviews),
            reviews: result.rows
        });

    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ message: 'Server error fetching reviews' });
    }
});

// -------------------------------------------------
// POST /api/reviews (Customers Only)
// -------------------------------------------------
// Create a new review for a product.
// Each customer can only review a product once.
//
// Expects: { product_id, rating (1-5), comment (optional) }
// -------------------------------------------------
router.post('/', verifyToken, authorize('customer'), async (req, res) => {
    try {
        const { product_id, rating, comment } = req.body;

        // Validate input
        if (!product_id) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Check if the product exists
        const productCheck = await pool.query(
            'SELECT id, seller_id, name FROM products WHERE id = $1',
            [product_id]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Prevent sellers from reviewing their own products
        if (productCheck.rows[0].seller_id === req.user.id) {
            return res.status(400).json({ message: 'You cannot review your own product' });
        }

        // Check if the customer already reviewed this product
        const existingReview = await pool.query(
            'SELECT id FROM reviews WHERE product_id = $1 AND customer_id = $2',
            [product_id, req.user.id]
        );

        if (existingReview.rows.length > 0) {
            return res.status(400).json({
                message: 'You have already reviewed this product. You can update your review instead.'
            });
        }

        // Create the review
        const result = await pool.query(
            `INSERT INTO reviews (product_id, customer_id, rating, comment) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [product_id, req.user.id, rating, comment || null]
        );

        // Notify the seller about the new review
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type) 
             VALUES ($1, $2, $3, $4)`,
            [
                productCheck.rows[0].seller_id,
                'New Product Review',
                `Your product "${productCheck.rows[0].name}" received a ${rating}-star review.`,
                'review'
            ]
        );

        res.status(201).json({
            message: 'Review submitted successfully!',
            review: result.rows[0]
        });

    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: 'Server error creating review' });
    }
});

// -------------------------------------------------
// PUT /api/reviews/:id (Customer Only)
// -------------------------------------------------
// Update an existing review. Customers can only
// update their own reviews.
// -------------------------------------------------
router.put('/:id', verifyToken, authorize('customer'), async (req, res) => {
    try {
        const reviewId = parseInt(req.params.id);
        const { rating, comment } = req.body;

        // Check if the review exists and belongs to this customer
        const reviewCheck = await pool.query(
            'SELECT * FROM reviews WHERE id = $1',
            [reviewId]
        );

        if (reviewCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (reviewCheck.rows[0].customer_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only update your own reviews' });
        }

        // Validate rating if provided
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Build update query
        const updates = [];
        const values = [];
        let paramCount = 0;

        if (rating) {
            paramCount++;
            updates.push(`rating = $${paramCount}`);
            values.push(rating);
        }
        if (comment !== undefined) {
            paramCount++;
            updates.push(`comment = $${paramCount}`);
            values.push(comment);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields provided to update' });
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);

        paramCount++;
        values.push(reviewId);

        const result = await pool.query(
            `UPDATE reviews SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        res.json({
            message: 'Review updated successfully!',
            review: result.rows[0]
        });

    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({ message: 'Server error updating review' });
    }
});

// -------------------------------------------------
// DELETE /api/reviews/:id (Customer/Admin)
// -------------------------------------------------
// Delete a review. Customers can delete their own
// reviews, and admins can delete any review.
// -------------------------------------------------
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const reviewId = parseInt(req.params.id);

        // Check if the review exists
        const reviewCheck = await pool.query(
            'SELECT * FROM reviews WHERE id = $1',
            [reviewId]
        );

        if (reviewCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Only the reviewer or an admin can delete a review
        if (req.user.role !== 'admin' && reviewCheck.rows[0].customer_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own reviews' });
        }

        await pool.query('DELETE FROM reviews WHERE id = $1', [reviewId]);

        res.json({ message: 'Review deleted successfully' });

    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ message: 'Server error deleting review' });
    }
});

module.exports = router;
