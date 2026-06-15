require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function testOrder() {
  try {
    const res = await pool.query("SELECT * FROM users WHERE role = 'customer' LIMIT 1");
    if (res.rows.length === 0) {
      console.log('No customer found');
      return;
    }
    const user = res.rows[0];
    
    const prodRes = await pool.query('SELECT * FROM products LIMIT 1');
    if (prodRes.rows.length === 0) {
      console.log('No products found');
      return;
    }
    const product = prodRes.rows[0];

    await pool.query('BEGIN');
    
    let totalAmount = product.price * 1;
    
    const orderResult = await pool.query(
      `INSERT INTO orders (customer_id, total_amount, shipping_address, payment_method, notes) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [user.id, totalAmount, 'test addr', 'credit_card', null]
    );
    const order = orderResult.rows[0];

    await pool.query(
      `INSERT INTO order_items (order_id, product_id, seller_id, quantity, price) 
       VALUES ($1, $2, $3, $4, $5)`,
      [order.id, product.id, product.seller_id, 1, product.price]
    );

    const sellerIds = [product.seller_id];

    for (const sellerId of sellerIds) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type) 
         VALUES ($1, $2, $3, $4)`,
        [sellerId, 'New Order Received!', `You have a new order (#${order.id}). Check your dashboard for details.`, 'order']
      );
    }

    await pool.query('COMMIT');
    console.log('Order fully inserted and committed with notifications!');

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Test Order Error:', err);
  } finally {
    pool.end();
  }
}
testOrder();
