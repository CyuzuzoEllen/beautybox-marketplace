// =====================================================
// DATABASE CONNECTION (PostgreSQL via Neon)
// =====================================================
// This file creates and exports a connection pool
// to our PostgreSQL database hosted on Neon.
// We use the 'pg' package (node-postgres).
//
// The connection string is stored in the .env file
// as DATABASE_URL for security.
// =====================================================

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test the connection when the server starts
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL database:', err.message);
    } else {
        console.log('Connected to PostgreSQL database on Neon!');
        release();
    }
});

// Export a simple query wrapper so all routes work the same as before
module.exports = {
    query: (text, params) => pool.query(text, params),
    connect: () => pool.connect()
};
