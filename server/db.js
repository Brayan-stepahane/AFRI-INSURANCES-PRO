require('dotenv').config();
const { Pool } = require('pg');

const host = process.env.DB_HOST || 'localhost';
const sslSetting = process.env.DB_SSL?.toLowerCase();
const useSsl = sslSetting === 'true' || (sslSetting !== 'false' && !['localhost', '127.0.0.1'].includes(host));

const pool = new Pool({
  host,
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'afri-pro',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

// Test the connection once on startup
pool.connect()
  .then(client => {
    console.log('✅ PostgreSQL connecté:', process.env.DB_NAME || 'afri-pro');
    client.release();
  })
  .catch(err => {
    console.error('❌ Échec de connexion PostgreSQL:', err.message);
  });

pool.on('error', (err) => {
  console.error('Erreur PostgreSQL inattendue', err);
});

module.exports = pool;