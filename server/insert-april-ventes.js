require('dotenv').config();
const pool = require('./db');

const insertAprilVentes = async () => {
  try {
    console.log('📌 Inserting April 2026 ventes...');
    
    const aprilVentes = [
      [13, 1, null, 'CLI-0001', 1, '2026-04-05', 'NouVe', '', 150000, 10000, '', ''],
      [14, 2, null, 'CLI-0002', 1, '2026-04-08', 'NouVe', '', 75000, 5000, '', ''],
      [15, 10, null, 'CLI-0018', 5, '2026-04-10', 'NouVe', '', 120000, 15000, '', ''],
      [16, 3, null, 'CLI-0003', 2, '2026-04-07', 'NouVe', '', 85000, 5000, '', ''],
      [17, 7, null, 'CLI-0012', 1, '2026-04-12', 'NouVe', '', 120000, 10000, '', ''],
      [18, 13, null, 'CLI-0015', 3, '2026-04-09', 'NouVe', '', 65000, 5000, '', ''],
      [19, 14, null, 'CLI-0009', 4, '2026-04-11', 'NouVe', '', 180000, 15000, '', ''],
      [20, 6, null, 'CLI-0011', 1, '2026-04-06', 'NouVe', '', 250000, 5000, '', ''],
    ];

    const query = `
      INSERT INTO ventes (numero, prospection_id, cotation_id, client_id, commercial_id, 
                         date_vente, type_vente, no_police, prime_nette, accessoires, 
                         no_attestation, no_carte_rose)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING
    `;

    for (const vente of aprilVentes) {
      await pool.query(query, vente);
      console.log(`✅ Added vente #${vente[0]} - ${vente[4]} (commercial_id), ${vente[8] + vente[9]}K FCFA`);
    }

    console.log('\n✅ April ventes inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting ventes:', error.message);
    process.exit(1);
  }
};

insertAprilVentes();
