-- =====================================================
-- BeautyBox Marketplace - Database Schema
-- =====================================================
-- This file creates all the tables needed for the
-- BeautyBox Marketplace application.
-- Run this file in your PostgreSQL database to set up
-- the schema: psql -U postgres -d beautybox -f schema.sql
-- =====================================================

-- =====================================================
-- USERS TABLE
-- Stores all user accounts: customers, sellers, admins
-- The 'role' column determines what they can do:
--   - 'customer' can browse and buy products
--   - 'seller' can list and sell products
--   - 'admin' can manage the entire platform
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,                              -- Unique user ID (auto-increments)
    name VARCHAR(100) NOT NULL,                         -- User's full name
    email VARCHAR(255) UNIQUE NOT NULL,                 -- Email address (must be unique)
    password VARCHAR(255) NOT NULL,                     -- Hashed password (never store plain text!)
    role VARCHAR(20) DEFAULT 'customer'                 -- Role: 'customer', 'seller', or 'admin'
        CHECK (role IN ('customer', 'seller', 'admin')),
    phone VARCHAR(20),                                  -- Optional phone number
    address TEXT,                                       -- Optional shipping/business address
    avatar VARCHAR(255),                                -- Optional profile picture URL
    is_suspended BOOLEAN DEFAULT false,                 -- Admin can suspend bad users
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- When the account was created
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP      -- When the account was last updated
);

-- =====================================================
-- CATEGORIES TABLE
-- Product categories like Makeup, Skincare, etc.
-- Each product belongs to one category.
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,                              -- Unique category ID
    name VARCHAR(100) UNIQUE NOT NULL,                  -- Category name (must be unique)
    description TEXT,                                   -- Optional description of the category
    image VARCHAR(255),                                 -- Optional category image URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP      -- When the category was created
);

-- =====================================================
-- PRODUCTS TABLE
-- All products listed on the marketplace.
-- Each product belongs to a seller (user) and a category.
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,                              -- Unique product ID
    seller_id INTEGER NOT NULL                          -- The seller who listed this product
        REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL                        -- Which category this product belongs to
        REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,                         -- Product name
    description TEXT,                                   -- Detailed product description
    price DECIMAL(10, 2) NOT NULL                       -- Price in dollars (e.g., 29.99)
        CHECK (price >= 0),
    stock INTEGER DEFAULT 0                             -- How many items are in stock
        CHECK (stock >= 0),
    image VARCHAR(255),                                 -- Product image filename/URL
    is_active BOOLEAN DEFAULT true,                     -- Whether the product is visible to buyers
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- When the product was listed
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP      -- When the product was last updated
);

-- =====================================================
-- ORDERS TABLE
-- Tracks customer orders. Each order can contain
-- multiple items (stored in order_items table).
-- Status flow: pending → processing → shipped → delivered
--              (or → cancelled at any point)
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,                              -- Unique order ID
    customer_id INTEGER NOT NULL                        -- The customer who placed the order
        REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL                -- Total price of the entire order
        CHECK (total_amount >= 0),
    status VARCHAR(20) DEFAULT 'pending'                -- Order status
        CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    shipping_address TEXT NOT NULL,                     -- Where to ship the order
    payment_method VARCHAR(50) DEFAULT 'credit_card',   -- How the customer is paying
    notes TEXT,                                         -- Optional order notes from customer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- When the order was placed
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP      -- When the order was last updated
);

-- =====================================================
-- ORDER ITEMS TABLE
-- Individual items within an order.
-- Links orders to products with quantity and price info.
-- We store the price here because product prices can
-- change later, but the order price should stay the same.
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,                              -- Unique order item ID
    order_id INTEGER NOT NULL                           -- Which order this item belongs to
        REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL                         -- Which product was ordered
        REFERENCES products(id) ON DELETE SET NULL,
    seller_id INTEGER NOT NULL                          -- The seller of this product
        REFERENCES users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL                            -- How many of this product were ordered
        CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL                       -- Price per unit at time of purchase
        CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP      -- When this item was added
);

-- =====================================================
-- REVIEWS TABLE
-- Customer reviews and ratings for products.
-- Each customer can only review a product once.
-- Rating is 1-5 stars.
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,                              -- Unique review ID
    product_id INTEGER NOT NULL                         -- Which product is being reviewed
        REFERENCES products(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL                        -- Who wrote the review
        REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL                             -- Star rating (1-5)
        CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,                                       -- Optional review text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- When the review was written
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- When the review was last edited
    UNIQUE(product_id, customer_id)                     -- One review per customer per product
);

-- =====================================================
-- WISHLIST TABLE
-- Lets customers save products they want to buy later.
-- Each customer can only add a product once.
-- =====================================================
CREATE TABLE IF NOT EXISTS wishlist (
    id SERIAL PRIMARY KEY,                              -- Unique wishlist entry ID
    user_id INTEGER NOT NULL                            -- The customer who saved this product
        REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL                         -- The saved product
        REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     -- When it was added to wishlist
    UNIQUE(user_id, product_id)                         -- Can't add same product twice
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- In-app notifications for users (order updates,
-- new reviews, admin messages, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,                              -- Unique notification ID
    user_id INTEGER NOT NULL                            -- Who this notification is for
        REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,                        -- Short notification title
    message TEXT NOT NULL,                              -- Full notification message
    type VARCHAR(50) DEFAULT 'info'                     -- Type: 'info', 'order', 'review', 'system'
        CHECK (type IN ('info', 'order', 'review', 'system')),
    is_read BOOLEAN DEFAULT false,                      -- Has the user read this notification?
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP      -- When the notification was created
);

-- =====================================================
-- INDEXES
-- Indexes make database queries faster by creating
-- quick-lookup structures for commonly searched columns.
-- Think of them like an index in a book!
-- =====================================================

-- Speed up looking up users by email (used for login)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Speed up filtering products by seller
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);

-- Speed up filtering products by category
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- Speed up searching products by name
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Speed up looking up orders by customer
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);

-- Speed up looking up order items by order
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Speed up looking up order items by seller (for seller dashboard)
CREATE INDEX IF NOT EXISTS idx_order_items_seller ON order_items(seller_id);

-- Speed up looking up reviews by product
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

-- Speed up looking up wishlist items by user
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);

-- Speed up looking up notifications by user
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- =====================================================
-- DONE! Your database schema is ready.
-- Now run seed.sql to add sample data.
-- =====================================================
