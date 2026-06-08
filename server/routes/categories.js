// =====================================================
// CATEGORY ROUTES - Managing Product Categories
// =====================================================
// These routes handle product categories:
//   GET    /api/categories      - Get all categories (public)
//   POST   /api/categories      - Admin: create a category
//   PUT    /api/categories/:id  - Admin: update a category
//   DELETE /api/categories/:id  - Admin: delete a category
// =====================================================

const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const { verifyToken, authorize } = require('../middleware/auth');

// -------------------------------------------------
// GET /api/categories (Public)
// -------------------------------------------------
// Get all categories. Anyone can see categories.
// Also includes the count of products in each category.
// -------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                c.*,
                COUNT(p.id) AS product_count
             FROM categories c
             LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
             GROUP BY c.id
             ORDER BY c.name ASC`
        );

        res.json({
            count: result.rows.length,
            categories: result.rows
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Server error fetching categories' });
    }
});

// -------------------------------------------------
// POST /api/categories (Admin Only)
// -------------------------------------------------
// Create a new category. Only admins can do this.
// Expects: { name, description (optional), image (optional) }
// -------------------------------------------------
router.post('/', verifyToken, authorize('admin'), async (req, res) => {
    try {
        const { name, description, image } = req.body;

        // Validate that name is provided
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Category name is required' });
        }

        // Check if category already exists
        const existingCategory = await pool.query(
            'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)',
            [name.trim()]
        );

        if (existingCategory.rows.length > 0) {
            return res.status(400).json({ message: 'A category with this name already exists' });
        }

        // Insert the new category
        const result = await pool.query(
            `INSERT INTO categories (name, description, image) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [name.trim(), description || null, image || null]
        );

        res.status(201).json({
            message: 'Category created successfully!',
            category: result.rows[0]
        });

    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ message: 'Server error creating category' });
    }
});

// -------------------------------------------------
// PUT /api/categories/:id (Admin Only)
// -------------------------------------------------
// Update an existing category. Only admins can do this.
// -------------------------------------------------
router.put('/:id', verifyToken, authorize('admin'), async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);
        const { name, description, image } = req.body;

        // Check if the category exists
        const categoryCheck = await pool.query(
            'SELECT id FROM categories WHERE id = $1',
            [categoryId]
        );

        if (categoryCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // If name is being changed, check it's not a duplicate
        if (name) {
            const duplicateCheck = await pool.query(
                'SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id != $2',
                [name.trim(), categoryId]
            );

            if (duplicateCheck.rows.length > 0) {
                return res.status(400).json({ message: 'A category with this name already exists' });
            }
        }

        // Build dynamic update query
        const updates = [];
        const values = [];
        let paramCount = 0;

        if (name) {
            paramCount++;
            updates.push(`name = $${paramCount}`);
            values.push(name.trim());
        }
        if (description !== undefined) {
            paramCount++;
            updates.push(`description = $${paramCount}`);
            values.push(description);
        }
        if (image !== undefined) {
            paramCount++;
            updates.push(`image = $${paramCount}`);
            values.push(image);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields provided to update' });
        }

        paramCount++;
        values.push(categoryId);

        const query = `
            UPDATE categories 
            SET ${updates.join(', ')} 
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        res.json({
            message: 'Category updated successfully!',
            category: result.rows[0]
        });

    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ message: 'Server error updating category' });
    }
});

// -------------------------------------------------
// DELETE /api/categories/:id (Admin Only)
// -------------------------------------------------
// Delete a category. Only admins can do this.
// Products in this category will have their
// category_id set to NULL (due to ON DELETE SET NULL).
// -------------------------------------------------
router.delete('/:id', verifyToken, authorize('admin'), async (req, res) => {
    try {
        const categoryId = parseInt(req.params.id);

        // Check if the category exists
        const categoryCheck = await pool.query(
            'SELECT id, name FROM categories WHERE id = $1',
            [categoryId]
        );

        if (categoryCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Check how many products are in this category
        const productCount = await pool.query(
            'SELECT COUNT(*) FROM products WHERE category_id = $1',
            [categoryId]
        );

        // Delete the category
        await pool.query('DELETE FROM categories WHERE id = $1', [categoryId]);

        res.json({
            message: `Category "${categoryCheck.rows[0].name}" deleted. ${productCount.rows[0].count} product(s) were uncategorized.`
        });

    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Server error deleting category' });
    }
});

module.exports = router;
