-- =====================================================
-- BeautyBox Marketplace - Seed Data
-- =====================================================
-- This file inserts sample data so you can test the app
-- right away. Run after schema.sql:
-- psql -U postgres -d beautybox -f seed.sql
-- =====================================================

-- =====================================================
-- INSERT CATEGORIES
-- These are the main product categories on BeautyBox
-- =====================================================
INSERT INTO categories (name, description) VALUES
    ('Makeup', 'Foundation, lipstick, eyeshadow, mascara, and all things makeup'),
    ('Skincare', 'Cleansers, moisturizers, serums, and skincare essentials'),
    ('Hair Care', 'Shampoo, conditioner, styling products, and hair treatments'),
    ('Fragrances', 'Perfumes, body mists, and scented products'),
    ('Beauty Tools', 'Brushes, sponges, mirrors, and beauty accessories'),
    ('Personal Care', 'Body wash, deodorant, oral care, and daily essentials')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- INSERT ADMIN USER
-- Email: admin@beautybox.com
-- Password: password (bcrypt hashed)
-- =====================================================
INSERT INTO users (name, email, password, role) VALUES
    ('Admin User', 'admin@beautybox.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- INSERT SAMPLE SELLERS
-- These are example sellers with their shops
-- Password for both: password
-- =====================================================
INSERT INTO users (name, email, password, role, phone, address) VALUES
    ('Glamour Beauty Shop', 'glamour@beautybox.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'seller', '+1-555-0101', '123 Beauty Lane, New York, NY 10001'),
    ('Nature Glow Cosmetics', 'natureglow@beautybox.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'seller', '+1-555-0202', '456 Skincare Blvd, Los Angeles, CA 90001')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- INSERT SAMPLE CUSTOMER
-- A sample customer account for testing purchases
-- Password: password
-- =====================================================
INSERT INTO users (name, email, password, role, phone, address) VALUES
    ('Jane Customer', 'jane@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', '+1-555-0303', '789 Shopping Ave, Chicago, IL 60601')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- INSERT SAMPLE PRODUCTS
-- Products from our two sample sellers
-- Seller 1 (Glamour Beauty Shop) = user id 2
-- Seller 2 (Nature Glow Cosmetics) = user id 3
-- =====================================================

-- Products from Glamour Beauty Shop (seller_id = 2)
INSERT INTO products (seller_id, category_id, name, description, price, stock) VALUES
    (2, 1, 'Velvet Matte Lipstick', 'Long-lasting matte lipstick in a beautiful velvet finish. Available in 12 stunning shades. Enriched with vitamin E for smooth application.', 24.99, 50),
    (2, 1, 'HD Foundation', 'Full-coverage liquid foundation that lasts all day. Oil-free formula suitable for all skin types. SPF 15 protection included.', 34.99, 30),
    (2, 5, 'Professional Brush Set', 'Complete set of 12 professional-grade makeup brushes. Soft synthetic bristles, rose gold handles. Includes a stylish carrying case.', 49.99, 25),
    (2, 4, 'Rose Petal Perfume', 'A delicate floral fragrance with notes of Bulgarian rose, jasmine, and sandalwood. Long-lasting scent that turns heads.', 59.99, 20);

-- Products from Nature Glow Cosmetics (seller_id = 3)
INSERT INTO products (seller_id, category_id, name, description, price, stock) VALUES
    (3, 2, 'Vitamin C Glow Serum', 'Brightening serum with 20% Vitamin C, hyaluronic acid, and niacinamide. Reduces dark spots and gives your skin a natural glow.', 29.99, 40),
    (3, 2, 'Hydrating Night Cream', 'Rich overnight moisturizer with retinol and peptides. Wake up to plump, hydrated, and youthful-looking skin.', 39.99, 35),
    (3, 3, 'Argan Oil Hair Repair Mask', 'Deep conditioning hair mask with pure argan oil and keratin. Repairs damaged hair and adds incredible shine.', 22.99, 45),
    (3, 6, 'Natural Charcoal Body Wash', 'Activated charcoal body wash that detoxifies and deep cleans. Infused with tea tree oil and eucalyptus for a refreshing feel.', 14.99, 60);

-- =====================================================
-- INSERT SAMPLE REVIEWS
-- Some reviews from our sample customer (user id 4)
-- =====================================================
INSERT INTO reviews (product_id, customer_id, rating, comment) VALUES
    (1, 4, 5, 'Absolutely love this lipstick! The color is gorgeous and it lasts all day without drying out my lips.'),
    (5, 4, 4, 'Great serum! I noticed a difference in my skin brightness after just two weeks. Taking one star off because the dropper is a bit tricky to use.');

-- =====================================================
-- INSERT SAMPLE NOTIFICATIONS
-- Welcome notifications for our users
-- =====================================================
INSERT INTO notifications (user_id, title, message, type) VALUES
    (1, 'Welcome to BeautyBox Admin Panel', 'You have admin access. You can manage users, products, and orders from your dashboard.', 'system'),
    (2, 'Welcome, Glamour Beauty Shop!', 'Your seller account is ready. Start listing your products to reach thousands of beauty lovers!', 'system'),
    (3, 'Welcome, Nature Glow Cosmetics!', 'Your seller account is ready. Start listing your products to reach thousands of beauty lovers!', 'system'),
    (4, 'Welcome to BeautyBox!', 'Thanks for joining BeautyBox Marketplace. Discover amazing beauty products from trusted sellers!', 'system');

-- =====================================================
-- DONE! Your database now has sample data.
-- Test accounts:
--   Admin:    admin@beautybox.com / password
--   Seller 1: glamour@beautybox.com / password
--   Seller 2: natureglow@beautybox.com / password
--   Customer: jane@example.com / password
-- =====================================================
