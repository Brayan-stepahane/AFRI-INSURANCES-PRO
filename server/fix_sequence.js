require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'afri-pro',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

(async () => {
  try {
    const res = await pool.query("SELECT setval('client_seq', (SELECT COALESCE(MAX(CAST(SUBSTRING(id, 5) AS INTEGER)), 0) + 1 FROM clients))");
    console.log('Sequence updated to:', res.rows[0].setval);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    pool.end();
  }
})();