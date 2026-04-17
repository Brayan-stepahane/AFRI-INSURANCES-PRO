require('dotenv').config();
const pool = require('./db');

const fixInvalidClientTypes = async () => {
  try {
    console.log('📌 Checking for invalid client types...');

    // Check current client types
    const { rows: clients } = await pool.query(
      'SELECT id, nom, type_client FROM clients WHERE type_client IS NOT NULL'
    );

    const validTypes = ['Particulier', 'PME', 'Entreprise', 'Autre', 'Tous'];
    const invalidClients = clients.filter(c => !validTypes.includes(c.type_client));

    if (invalidClients.length === 0) {
      console.log('✅ All clients have valid type_client values');
      return;
    }

    console.log(`❌ Found ${invalidClients.length} clients with invalid type_client:`);
    invalidClients.forEach(c => {
      console.log(`  - ${c.id}: "${c.nom}" has type_client = "${c.type_client}"`);
    });

    // Fix invalid types by setting them to 'Particulier'
    const result = await pool.query(
      `UPDATE clients
       SET type_client = 'Particulier'
       WHERE type_client NOT IN ('Particulier', 'PME', 'Entreprise', 'Autre', 'Tous')`
    );

    console.log(`✅ Fixed ${result.rowCount} clients by setting type_client to 'Particulier'`);

  } catch (error) {
    console.error('❌ Error fixing client types:', error.message);
    process.exit(1);
  }
};

fixInvalidClientTypes();