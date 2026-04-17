const pool = require('./db');

(async () => {
  try {
    await pool.query(`ALTER TABLE clients
      DROP CONSTRAINT IF EXISTS clients_type_client_check,
      ADD CONSTRAINT clients_type_client_check
        CHECK (type_client IN ('Particulier','PME','Entreprise','Autre','Tous'))
    `);
    console.log('✅ Client type constraint updated successfully.');
  } catch (error) {
    console.error('❌ Failed to update client type constraint:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
