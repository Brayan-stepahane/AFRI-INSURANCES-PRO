require('dotenv').config();
const { Pool } = require('pg');

// Online (Vercel + Supabase integration): POSTGRES_URL is set automatically.
// Locally: falls back to the DB_* variables in server/.env.
const connectionUrl = process.env.POSTGRES_URL;

let pool;
if (connectionUrl) {
  // Drop sslmode from the URL: pg treats it as strict certificate checking,
  // which fails on Supabase's pooler certificate. SSL is set below instead.
  const url = new URL(connectionUrl);
  url.searchParams.delete('sslmode');
  pool = new Pool({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: false },
    max: 3, // serverless: keep few connections per instance
  });
} else {
  const host = process.env.DB_HOST || 'localhost';
  const sslSetting = process.env.DB_SSL?.toLowerCase();
  const useSsl = sslSetting === 'true' || (sslSetting !== 'false' && !['localhost', '127.0.0.1'].includes(host));

  pool = new Pool({
    host,
    port:     process.env.DB_PORT     || 5432,
    database: process.env.DB_NAME     || 'afri-pro',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });
}

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