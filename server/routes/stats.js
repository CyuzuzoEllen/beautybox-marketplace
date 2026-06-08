// =====================================================
// STATS ROUTES - Dashboard Statistics
// =====================================================
// These routes provide dashboard data:
//   GET /api/stats/seller - Seller dashboard stats
//   GET /api/stats/admin  - Admin dashboard stats
// =====================================================

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { verifyToken, authorize } = require('../middleware/auth');

// All stats routes require authentication
router.use(verifyToken);

// -------------------------------------------------
// GET /api/stats/seller (Sellers Only)
// -------------------------------------------------
// Get dashboard statistics for the logged-in seller.
// Returns:
//   - Total products they have listed
//   - Total orders containing their products
//   - Total revenue earned
//   - Recent orders (last 5)
// -------------------------------------------------
router.get('/seller', authorize('seller'), async (req, res) => {
    try {
        const sellerId = req.user.id;

        // Count total products
        const productsResult = await pool.query(
            'SELECT COUNT(*) AS total_products FROM products WHERE seller_id = $1',
            [sellerId]
        );

        // Count total orders that include this seller's products
        const ordersResult = await pool.query(
            'SELECT COUNT(DISTINCT order_id) AS total_orders FROM order_items WHERE seller_id = $1',
            [sellerId]
        );

        // Calculate total revenue (sum of price * quantity for this seller's items)
        const revenueResult = await pool.query(
            'SELECT COALESCE(SUM(price * quantity), 0) AS total_revenue FROM order_items WHERE seller_id = $1',
            [sellerId]
        );

        // Get recent orders (last 5 orders containing this seller's products)
        const recentOrdersResult = await pool.query(
            `SELECT 
                o.id AS order_id,
                o.status,
                o.created_at AS order_date,
                cu.name AS customer_name,
                SUM(oi.price * oi.quantity) AS order_total
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             JOIN users cu ON o.customer_id = cu.id
             WHERE oi.seller_id = $1
             GROUP BY o.id, o.status, o.created_at, cu.name
             ORDER BY o.created_at DESC
             LIMIT 5`,
            [sellerId]
        );

        // Count products that are out of stock (stock = 0)
        const outOfStockResult = await pool.query(
            'SELECT COUNT(*) AS out_of_stock FROM products WHERE seller_id = $1 AND stock = 0',
            [sellerId]
        );

        res.json({
            stats: {
                total_products: parseInt(productsResult.rows[0].total_products),
                total_orders: parseInt(ordersResult.rows[0].total_orders),
                total_revenue: parseFloat(revenueResult.rows[0].total_revenue),
                out_of_stock: parseInt(outOfStockResult.rows[0].out_of_stock)
            },
            recent_orders: recentOrdersResult.rows
        });

    } catch (error) {
        console.error('Get seller stats error:', error);
        res.status(500).json({ message: 'Server error fetching seller statistics' });
    }
});

// -------------------------------------------------
// GET /api/stats/admin (Admins Only)
// -------------------------------------------------
// Get platform-wide dashboard statistics.
// Returns:
//   - Total users, sellers, customers
//   - Total products, categories
//   - Total orders and revenue
//   - Recent activity
// -------------------------------------------------
router.get('/admin', authorize('admin'), async (req, res) => {
    try {
        // Count users by role
        const usersResult = await pool.query(
            `SELECT 
                COUNT(*) AS total_users,
                COUNT(*) FILTER (WHERE role = 'customer') AS total_customers,
                COUNT(*) FILTER (WHERE role = 'seller') AS total_sellers,
                COUNT(*) FILTER (WHERE role = 'admin') AS total_admins,
                COUNT(*) FILTER (WHERE is_suspended = true) AS suspended_users
             FROM users`
        );

        // Count total products
        const productsResult = await pool.query(
            `SELECT 
                COUNT(*) AS total_products,
                COUNT(*) FILTER (WHERE is_active = true) AS active_products,
                COUNT(*) FILTER (WHERE stock = 0) AS out_of_stock
             FROM products`
        );

        // Count categories
        const categoriesResult = await pool.query(
            'SELECT COUNT(*) AS total_categories FROM categories'
        );

        // Order statistics
        const ordersResult = await pool.query(
            `SELECT 
                COUNT(*) AS total_orders,
                COALESCE(SUM(total_amount), 0) AS total_revenue,
                COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders,
                COUNT(*) FILTER (WHERE status = 'processing') AS processing_orders,
                COUNT(*) FILTER (WHERE status = 'shipped') AS shipped_orders,
                COUNT(*) FILTER (WHERE status = 'delivered') AS delivered_orders,
                COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_orders
             FROM orders`
        );

        // Recent orders (last 10)
        const recentOrdersResult = await pool.query(
            `SELECT 
                o.id AS order_id,
                o.total_amount,
                o.status,
                o.created_at AS order_date,
                u.name AS customer_name
             FROM orders o
             JOIN users u ON o.customer_id = u.id
             ORDER BY o.created_at DESC
             LIMIT 10`
        );

        // Recent users (last 5 new signups)
        const recentUsersResult = await pool.query(
            `SELECT id, name, email, role, created_at 
             FROM users 
             ORDER BY created_at DESC 
             LIMIT 5`
        );

        res.json({
            stats: {
                users: usersResult.rows[0],
                products: {
                    total_products: parseInt(productsResult.rows[0].total_products),
                    active_products: parseInt(productsResult.rows[0].active_products),
                    out_of_stock: parseInt(productsResult.rows[0].out_of_stock)
                },
                categories: parseInt(categoriesResult.rows[0].total_categories),
                orders: {
                    total_orders: parseInt(ordersResult.rows[0].total_orders),
                    total_revenue: parseFloat(ordersResult.rows[0].total_revenue),
                    pending: parseInt(ordersResult.rows[0].pending_orders),
                    processing: parseInt(ordersResult.rows[0].processing_orders),
                    shipped: parseInt(ordersResult.rows[0].shipped_orders),
                    delivered: parseInt(ordersResult.rows[0].delivered_orders),
                    cancelled: parseInt(ordersResult.rows[0].cancelled_orders)
                }
            },
            recent_orders: recentOrdersResult.rows,
            recent_users: recentUsersResult.rows
        });

    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ message: 'Server error fetching admin statistics' });
    }
});

module.exports = router;
