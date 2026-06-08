// =====================================================
// DATABASE CONNECTION POOL
// =====================================================
// This file creates a connection "pool" to our PostgreSQL
// database. A pool keeps several database connections open
// and ready to use, which is much faster than opening a
// new connection for every single query.
//
// We use the 'pg' library (node-postgres) to connect.
// The connection settings come from our .env file.
// =====================================================

// Load environment variables from .env file
const { Pool } = require('pg');
require('dotenv').config();

// Create a new connection pool with our database settings
const pool = new Pool({
    user: process.env.DB_USER,         // Database username (default: postgres)
    host: process.env.DB_HOST,         // Database server address (default: localhost)
    database: process.env.DB_NAME,     // Database name (beautybox)
    password: process.env.DB_PASSWORD, // Database password
    port: process.env.DB_PORT,         // Database port (default: 5432)
});

// Test the connection when the app starts
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

// Log any unexpected errors on idle connections
pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
    process.exit(-1); // Exit the app if we lose the database
});

// Export the pool so other files can use it to run queries
// Usage: const pool = require('./db/pool');
//        const result = await pool.query('SELECT * FROM users');
module.exports = pool;
