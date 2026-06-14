const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    const res = await pool.query('SELECT * FROM categories');
    console.log('Categories count:', res.rows.length);
    if (res.rows.length === 0) {
      console.log('Seeding categories...');
      await pool.query("INSERT INTO categories (name) VALUES ('Makeup'), ('Skincare'), ('Hair Care'), ('Fragrances'), ('Beauty Tools')");
      console.log('Categories seeded successfully.');
    } else {
      console.log('Categories already exist.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
