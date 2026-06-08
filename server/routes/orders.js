// =====================================================
// ORDER ROUTES - Shopping Cart Checkout & Order Management
// =====================================================
// These routes handle orders:
//   POST   /api/orders                - Customer: place an order
//   GET    /api/orders/my-orders      - Customer: get order history
//   GET    /api/orders/seller/orders  - Seller: get orders for their products
//   GET    /api/orders/admin/all      - Admin: get all orders
//   GET    /api/orders/:id            - Get a single order with items
//   PUT    /api/orders/:id/status     - Seller/Admin: update order status
// =====================================================

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { verifyToken, authorize } = require('../middleware/auth');

// All order routes require authentication
router.use(verifyToken);

// -------------------------------------------------
// POST /api/orders (Customers Only)
// -------------------------------------------------
// Place a new order. The customer sends an array of
// items they want to buy.
//
// Expects:
// {
//   shipping_address: "123 Main St...",
//   payment_method: "credit_card",
//   notes: "Please gift wrap",
//   items: [
//     { product_id: 1, quantity: 2 },
//     { product_id: 5, quantity: 1 }
//   ]
// }
// -------------------------------------------------
router.post('/', authorize('customer'), async (req, res) => {
    // We'll use a database TRANSACTION here.
    // A transaction ensures that ALL queries succeed or NONE do.
    // This prevents situations like: order is created but items aren't added.
    const client = await pool.connect(); // Get a dedicated connection

    try {
        const { shipping_address, payment_method, notes, items } = req.body;

        // Validate input
        if (!shipping_address) {
            return res.status(400).json({ message: 'Shipping address is required' });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        // Start the transaction
        await client.query('BEGIN');

        // Step 1: Validate all products and calculate total
        let totalAmount = 0;
        const orderItems = []; // Will hold the validated items with prices

        for (const item of items) {
            // Get the product from database
            const productResult = await client.query(
                'SELECT id, seller_id, name, price, stock, is_active FROM products WHERE id = $1',
                [item.product_id]
            );

            if (productResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    message: `Product with ID ${item.product_id} not found`
                });
            }

            const product = productResult.rows[0];

            // Check if product is active
            if (!product.is_active) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    message: `Product "${product.name}" is no longer available`
                });
            }

            // Check stock availability
            if (product.stock < item.quantity) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    message: `Not enough stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
                });
            }

            // Calculate item total and add to order items
            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                product_id: product.id,
                seller_id: product.seller_id,
                quantity: item.quantity,
                price: product.price
            });

            // Step 2: Reduce the product stock
            await client.query(
                'UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [item.quantity, product.id]
            );
        }

        // Step 3: Create the order
        const orderResult = await client.query(
            `INSERT INTO orders (customer_id, total_amount, shipping_address, payment_method, notes) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [req.user.id, totalAmount, shipping_address, payment_method || 'credit_card', notes || null]
        );

        const order = orderResult.rows[0];

        // Step 4: Insert all order items
        for (const item of orderItems) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, seller_id, quantity, price) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [order.id, item.product_id, item.seller_id, item.quantity, item.price]
            );
        }

        // Step 5: Notify the sellers about the new order
        // Get unique seller IDs from the order items
        const sellerIds = [...new Set(orderItems.map(item => item.seller_id))];

        for (const sellerId of sellerIds) {
            await client.query(
                `INSERT INTO notifications (user_id, title, message, type) 
                 VALUES ($1, $2, $3, $4)`,
                [sellerId, 'New Order Received!', `You have a new order (#${order.id}). Check your dashboard for details.`, 'order']
            );
        }

        // Commit the transaction - everything succeeded!
        await client.query('COMMIT');

        res.status(201).json({
            message: 'Order placed successfully!',
            order: {
                ...order,
                items: orderItems
            }
        });

    } catch (error) {
        // If anything goes wrong, undo all changes
        await client.query('ROLLBACK');
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server error placing order' });
    } finally {
        // Always release the database connection back to the pool
        client.release();
    }
});

// -------------------------------------------------
// GET /api/orders/my-orders (Customers Only)
// -------------------------------------------------
// Get the logged-in customer's order history.
// -------------------------------------------------
router.get('/my-orders', authorize('customer'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                o.*,
                json_agg(
                    json_build_object(
                        'id', oi.id,
                        'product_id', oi.product_id,
                        'product_name', p.name,
                        'product_image', p.image,
                        'quantity', oi.quantity,
                        'price', oi.price,
                        'seller_name', u.name
                    )
                ) AS items
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             LEFT JOIN products p ON oi.product_id = p.id
             LEFT JOIN users u ON oi.seller_id = u.id
             WHERE o.customer_id = $1
             GROUP BY o.id
             ORDER BY o.created_at DESC`,
            [req.user.id]
        );

        res.json({
            count: result.rows.length,
            orders: result.rows
        });

    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
});

// -------------------------------------------------
// GET /api/orders/seller/orders (Sellers Only)
// -------------------------------------------------
// Get orders that contain the seller's products.
// -------------------------------------------------
router.get('/seller/orders', authorize('seller'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                o.id AS order_id,
                o.status,
                o.shipping_address,
                o.created_at AS order_date,
                cu.name AS customer_name,
                cu.email AS customer_email,
                json_agg(
                    json_build_object(
                        'item_id', oi.id,
                        'product_id', oi.product_id,
                        'product_name', p.name,
                        'product_image', p.image,
                        'quantity', oi.quantity,
                        'price', oi.price
                    )
                ) AS items,
                SUM(oi.price * oi.quantity) AS seller_total
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             JOIN products p ON oi.product_id = p.id
             JOIN users cu ON o.customer_id = cu.id
             WHERE oi.seller_id = $1
             GROUP BY o.id, o.status, o.shipping_address, o.created_at, cu.name, cu.email
             ORDER BY o.created_at DESC`,
            [req.user.id]
        );

        res.json({
            count: result.rows.length,
            orders: result.rows
        });

    } catch (error) {
        console.error('Get seller orders error:', error);
        res.status(500).json({ message: 'Server error fetching seller orders' });
    }
});

// -------------------------------------------------
// GET /api/orders/admin/all (Admin Only)
// -------------------------------------------------
// Get ALL orders in the system. Only admins can do this.
// -------------------------------------------------
router.get('/admin/all', authorize('admin'), async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let whereClause = '';
        const values = [];
        let paramCount = 0;

        if (status) {
            paramCount++;
            whereClause = `WHERE o.status = $${paramCount}`;
            values.push(status);
        }

        // Get total count for pagination
        const countResult = await pool.query(
            `SELECT COUNT(DISTINCT o.id) FROM orders o ${whereClause}`,
            values
        );
        const totalOrders = parseInt(countResult.rows[0].count);

        paramCount++;
        values.push(parseInt(limit));
        paramCount++;
        values.push(offset);

        const result = await pool.query(
            `SELECT 
                o.*,
                cu.name AS customer_name,
                cu.email AS customer_email,
                json_agg(
                    json_build_object(
                        'id', oi.id,
                        'product_id', oi.product_id,
                        'product_name', p.name,
                        'quantity', oi.quantity,
                        'price', oi.price,
                        'seller_name', su.name
                    )
                ) AS items
             FROM orders o
             JOIN users cu ON o.customer_id = cu.id
             LEFT JOIN order_items oi ON o.id = oi.order_id
             LEFT JOIN products p ON oi.product_id = p.id
             LEFT JOIN users su ON oi.seller_id = su.id
             ${whereClause}
             GROUP BY o.id, cu.name, cu.email
             ORDER BY o.created_at DESC
             LIMIT $${paramCount - 1} OFFSET $${paramCount}`,
            values
        );

        res.json({
            orders: result.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalOrders / parseInt(limit)),
                totalOrders
            }
        });

    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
});

// -------------------------------------------------
// GET /api/orders/:id
// -------------------------------------------------
// Get a single order with all its items.
// Customers can only see their own orders.
// Sellers can see orders containing their products.
// Admins can see any order.
// -------------------------------------------------
router.get('/:id', async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);

        // Get the order with items
        const result = await pool.query(
            `SELECT 
                o.*,
                cu.name AS customer_name,
                cu.email AS customer_email,
                json_agg(
                    json_build_object(
                        'id', oi.id,
                        'product_id', oi.product_id,
                        'product_name', p.name,
                        'product_image', p.image,
                        'quantity', oi.quantity,
                        'price', oi.price,
                        'seller_id', oi.seller_id,
                        'seller_name', su.name
                    )
                ) AS items
             FROM orders o
             JOIN users cu ON o.customer_id = cu.id
             LEFT JOIN order_items oi ON o.id = oi.order_id
             LEFT JOIN products p ON oi.product_id = p.id
             LEFT JOIN users su ON oi.seller_id = su.id
             WHERE o.id = $1
             GROUP BY o.id, cu.name, cu.email`,
            [orderId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = result.rows[0];

        // Check permissions: customers can only see their own orders
        if (req.user.role === 'customer' && order.customer_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only view your own orders' });
        }

        // Sellers can only see orders containing their products
        if (req.user.role === 'seller') {
            const sellerInOrder = order.items.some(item => item.seller_id === req.user.id);
            if (!sellerInOrder) {
                return res.status(403).json({ message: 'This order does not contain your products' });
            }
        }

        res.json({ order });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Server error fetching order' });
    }
});

// -------------------------------------------------
// PUT /api/orders/:id/status (Sellers/Admins)
// -------------------------------------------------
// Update an order's status.
// Valid statuses: pending, processing, shipped, delivered, cancelled
// -------------------------------------------------
router.put('/:id/status', authorize('seller', 'admin'), async (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;

        // Validate the status
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Check if the order exists
        const orderCheck = await pool.query(
            'SELECT * FROM orders WHERE id = $1',
            [orderId]
        );

        if (orderCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // If seller, verify they have products in this order
        if (req.user.role === 'seller') {
            const sellerItems = await pool.query(
                'SELECT id FROM order_items WHERE order_id = $1 AND seller_id = $2',
                [orderId, req.user.id]
            );

            if (sellerItems.rows.length === 0) {
                return res.status(403).json({
                    message: 'You can only update orders containing your products'
                });
            }
        }

        // Update the order status
        const result = await pool.query(
            `UPDATE orders 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2
             RETURNING *`,
            [status, orderId]
        );

        // Notify the customer about the status change
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type) 
             VALUES ($1, $2, $3, $4)`,
            [
                orderCheck.rows[0].customer_id,
                'Order Status Updated',
                `Your order #${orderId} has been updated to: ${status.toUpperCase()}.`,
                'order'
            ]
        );

        res.json({
            message: `Order status updated to "${status}"`,
            order: result.rows[0]
        });

    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Server error updating order status' });
    }
});

module.exports = router;
