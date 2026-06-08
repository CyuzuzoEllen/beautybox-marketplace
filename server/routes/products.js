// =====================================================
// PRODUCT ROUTES - CRUD Operations for Products
// =====================================================
// These routes handle everything related to products:
//   GET    /api/products                - Get all products (public, with search/filter/pagination)
//   GET    /api/products/seller/my-products - Seller: get their own products
//   GET    /api/products/:id            - Get single product (public)
//   POST   /api/products                - Seller: create a product
//   PUT    /api/products/:id            - Seller: update a product
//   DELETE /api/products/:id            - Seller: delete a product
// =====================================================

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');
const { verifyToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// -------------------------------------------------
// GET /api/products (Public)
// -------------------------------------------------
// Get all active products with filtering, searching,
// sorting, and pagination.
//
// Query parameters:
//   ?search=lipstick    - Search by product name
//   ?category=1         - Filter by category ID
//   ?min_price=10       - Minimum price filter
//   ?max_price=50       - Maximum price filter
//   ?sort=price_asc     - Sort order (price_asc, price_desc, newest, oldest, name)
//   ?page=1             - Page number (default: 1)
//   ?limit=12           - Items per page (default: 12)
// -------------------------------------------------
router.get('/', async (req, res) => {
    try {
        // Extract query parameters with defaults
        const {
            search,
            category,
            min_price,
            max_price,
            sort = 'newest',
            page = 1,
            limit = 12
        } = req.query;

        // Calculate how many items to skip for pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build the WHERE clause dynamically based on filters
        let whereClause = 'WHERE p.is_active = true';
        const values = [];
        let paramCount = 0;

        // Search filter - searches product name and description
        if (search) {
            paramCount++;
            whereClause += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
            values.push(`%${search}%`);
        }

        // Category filter
        if (category) {
            paramCount++;
            whereClause += ` AND p.category_id = $${paramCount}`;
            values.push(parseInt(category));
        }

        // Price range filters
        if (min_price) {
            paramCount++;
            whereClause += ` AND p.price >= $${paramCount}`;
            values.push(parseFloat(min_price));
        }
        if (max_price) {
            paramCount++;
            whereClause += ` AND p.price <= $${paramCount}`;
            values.push(parseFloat(max_price));
        }

        // Determine sort order
        let orderClause;
        switch (sort) {
            case 'price_asc':
                orderClause = 'ORDER BY p.price ASC';
                break;
            case 'price_desc':
                orderClause = 'ORDER BY p.price DESC';
                break;
            case 'oldest':
                orderClause = 'ORDER BY p.created_at ASC';
                break;
            case 'name':
                orderClause = 'ORDER BY p.name ASC';
                break;
            case 'newest':
            default:
                orderClause = 'ORDER BY p.created_at DESC';
                break;
        }

        // Count total matching products (for pagination info)
        const countQuery = `SELECT COUNT(*) FROM products p ${whereClause}`;
        const countResult = await pool.query(countQuery, values);
        const totalProducts = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalProducts / parseInt(limit));

        // Get the actual products with seller and category info
        paramCount++;
        const limitParam = paramCount;
        values.push(parseInt(limit));

        paramCount++;
        const offsetParam = paramCount;
        values.push(offset);

        const query = `
            SELECT 
                p.*,
                u.name AS seller_name,
                c.name AS category_name,
                COALESCE(AVG(r.rating), 0) AS average_rating,
                COUNT(DISTINCT r.id) AS review_count
            FROM products p
            LEFT JOIN users u ON p.seller_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN reviews r ON p.id = r.product_id
            ${whereClause}
            GROUP BY p.id, u.name, c.name
            ${orderClause}
            LIMIT $${limitParam} OFFSET $${offsetParam}
        `;

        const result = await pool.query(query, values);

        // Send back products with pagination info
        res.json({
            products: result.rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalProducts,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
});

// -------------------------------------------------
// GET /api/products/seller/my-products
// -------------------------------------------------
// Get all products belonging to the logged-in seller.
// This must be defined BEFORE /:id to avoid conflicts!
// -------------------------------------------------
router.get('/seller/my-products', verifyToken, authorize('seller'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                p.*,
                c.name AS category_name,
                COALESCE(AVG(r.rating), 0) AS average_rating,
                COUNT(DISTINCT r.id) AS review_count
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN reviews r ON p.id = r.product_id
             WHERE p.seller_id = $1
             GROUP BY p.id, c.name
             ORDER BY p.created_at DESC`,
            [req.user.id]
        );

        res.json({
            count: result.rows.length,
            products: result.rows
        });

    } catch (error) {
        console.error('Get seller products error:', error);
        res.status(500).json({ message: 'Server error fetching your products' });
    }
});

// -------------------------------------------------
// GET /api/products/:id (Public)
// -------------------------------------------------
// Get a single product by ID with full details.
// Includes seller info, category, and review stats.
// -------------------------------------------------
router.get('/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        const result = await pool.query(
            `SELECT 
                p.*,
                u.name AS seller_name,
                u.email AS seller_email,
                u.phone AS seller_phone,
                c.name AS category_name,
                COALESCE(AVG(r.rating), 0) AS average_rating,
                COUNT(DISTINCT r.id) AS review_count
             FROM products p
             LEFT JOIN users u ON p.seller_id = u.id
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN reviews r ON p.id = r.product_id
             WHERE p.id = $1
             GROUP BY p.id, u.name, u.email, u.phone, c.name`,
            [productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ product: result.rows[0] });

    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Server error fetching product' });
    }
});

// -------------------------------------------------
// POST /api/products (Sellers Only)
// -------------------------------------------------
// Create a new product. Only sellers can do this.
// Supports image upload via multipart/form-data.
// -------------------------------------------------
router.post(
    '/',
    verifyToken,
    authorize('seller'),
    upload.single('image'), // Handle single image upload (field name: 'image')
    [
        // Validation rules
        body('name')
            .trim()
            .notEmpty().withMessage('Product name is required')
            .isLength({ min: 2, max: 255 }).withMessage('Name must be 2-255 characters'),
        body('price')
            .notEmpty().withMessage('Price is required')
            .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
        body('category_id')
            .notEmpty().withMessage('Category is required')
            .isInt({ min: 1 }).withMessage('Invalid category'),
        body('stock')
            .optional()
            .isInt({ min: 0 }).withMessage('Stock must be 0 or more'),
    ],
    async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { name, description, price, category_id, stock } = req.body;

            // Check if the category exists
            const categoryCheck = await pool.query(
                'SELECT id FROM categories WHERE id = $1',
                [category_id]
            );

            if (categoryCheck.rows.length === 0) {
                return res.status(400).json({ message: 'Category not found' });
            }

            // Get the image filename if one was uploaded
            const image = req.file ? req.file.filename : null;

            // Insert the new product
            const result = await pool.query(
                `INSERT INTO products (seller_id, category_id, name, description, price, stock, image) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) 
                 RETURNING *`,
                [req.user.id, category_id, name, description || null, price, stock || 0, image]
            );

            res.status(201).json({
                message: 'Product created successfully!',
                product: result.rows[0]
            });

        } catch (error) {
            console.error('Create product error:', error);
            res.status(500).json({ message: 'Server error creating product' });
        }
    }
);

// -------------------------------------------------
// PUT /api/products/:id (Sellers Only)
// -------------------------------------------------
// Update an existing product. Sellers can only update
// their own products. Supports optional image upload.
// -------------------------------------------------
router.put(
    '/:id',
    verifyToken,
    authorize('seller'),
    upload.single('image'),
    async (req, res) => {
        try {
            const productId = parseInt(req.params.id);

            // Check if the product exists and belongs to this seller
            const productCheck = await pool.query(
                'SELECT * FROM products WHERE id = $1',
                [productId]
            );

            if (productCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (productCheck.rows[0].seller_id !== req.user.id) {
                return res.status(403).json({ message: 'You can only update your own products' });
            }

            // Build update query dynamically (only update provided fields)
            const { name, description, price, category_id, stock, is_active } = req.body;
            const updates = [];
            const values = [];
            let paramCount = 0;

            if (name) {
                paramCount++;
                updates.push(`name = $${paramCount}`);
                values.push(name);
            }
            if (description !== undefined) {
                paramCount++;
                updates.push(`description = $${paramCount}`);
                values.push(description);
            }
            if (price) {
                paramCount++;
                updates.push(`price = $${paramCount}`);
                values.push(price);
            }
            if (category_id) {
                paramCount++;
                updates.push(`category_id = $${paramCount}`);
                values.push(category_id);
            }
            if (stock !== undefined) {
                paramCount++;
                updates.push(`stock = $${paramCount}`);
                values.push(stock);
            }
            if (is_active !== undefined) {
                paramCount++;
                updates.push(`is_active = $${paramCount}`);
                values.push(is_active);
            }
            // If a new image was uploaded, update the image field
            if (req.file) {
                paramCount++;
                updates.push(`image = $${paramCount}`);
                values.push(req.file.filename);
            }

            if (updates.length === 0) {
                return res.status(400).json({ message: 'No fields provided to update' });
            }

            // Always update the timestamp
            updates.push(`updated_at = CURRENT_TIMESTAMP`);

            // Add product ID for WHERE clause
            paramCount++;
            values.push(productId);

            const query = `
                UPDATE products 
                SET ${updates.join(', ')} 
                WHERE id = $${paramCount}
                RETURNING *
            `;

            const result = await pool.query(query, values);

            res.json({
                message: 'Product updated successfully!',
                product: result.rows[0]
            });

        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({ message: 'Server error updating product' });
        }
    }
);

// -------------------------------------------------
// DELETE /api/products/:id (Sellers Only)
// -------------------------------------------------
// Delete a product. Sellers can only delete their own.
// Admins can also delete any product.
// -------------------------------------------------
router.delete('/:id', verifyToken, authorize('seller', 'admin'), async (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        // Check if the product exists
        const productCheck = await pool.query(
            'SELECT * FROM products WHERE id = $1',
            [productId]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Sellers can only delete their own products; admins can delete any
        if (req.user.role === 'seller' && productCheck.rows[0].seller_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own products' });
        }

        // Delete the product (CASCADE will also delete reviews, wishlist entries, etc.)
        await pool.query('DELETE FROM products WHERE id = $1', [productId]);

        res.json({ message: 'Product deleted successfully' });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error deleting product' });
    }
});

module.exports = router;
