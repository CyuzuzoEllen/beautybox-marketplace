// One-time script to set up the database tables on Neon
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
    console.log('Connecting to Neon PostgreSQL...');
    try {
        const schema = fs.readFileSync(path.resolve(__dirname, 'db/schema.sql'), 'utf8');
        await pool.query(schema);
        console.log('✅ All tables created successfully on Neon!');
    } catch (err) {
        console.error('❌ Error creating tables:', err.message);
    } finally {
        await pool.end();
        console.log('Database connection closed.');
    }
}

setupDatabase();
