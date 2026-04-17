require('dotenv').config();
const pool = require('./db');

const addProduitColumn = async () => {
  try {
    console.log('📌 Adding produit column to ventes table...');

    // Add produit column
    await pool.query(`
      ALTER TABLE ventes 
      ADD COLUMN IF NOT EXISTS produit VARCHAR(150)
    `);
    console.log('✅ Added produit column');

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_ventes_produit ON ventes(produit)
    `);
    console.log('✅ Created idx_ventes_produit index');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_ventes_cotation ON ventes(cotation_id)
    `);
    console.log('✅ Created idx_ventes_cotation index');

    // Populate produit from prospections
    const result = await pool.query(`
      UPDATE ventes v
      SET produit = p.risque_prospecte
      FROM prospections p
      WHERE v.prospection_id = p.id
      AND v.produit IS NULL
      RETURNING v.id
    `);
    console.log(`✅ Updated ${result.rowCount} ventes with produit data from prospections`);

    // Show summary
    const summary = await pool.query(`
      SELECT 
        COUNT(*) as total_ventes,
        COUNT(DISTINCT client_id) as unique_clients,
        COUNT(DISTINCT commercial_id) as unique_commercials,
        MIN(date_vente) as first_sale,
        MAX(date_vente) as latest_sale,
        COUNT(CASE WHEN produit IS NOT NULL THEN 1 END) as ventes_with_produit
      FROM ventes
    `);

    const stats = summary.rows[0];
    console.log('\n📊 Database Summary:');
    console.log(`  💰 Total ventes: ${stats.total_ventes}`);
    console.log(`  👥 Unique clients: ${stats.unique_clients}`);
    console.log(`  💼 Unique commercials: ${stats.unique_commercials}`);
    console.log(`  📅 First sale: ${stats.first_sale}`);
    console.log(`  📅 Latest sale: ${stats.latest_sale}`);
    console.log(`  ✅ Ventes with produit: ${stats.ventes_with_produit}/${stats.total_ventes}`);

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    process.exit(1);
  }
};

addProduitColumn();
