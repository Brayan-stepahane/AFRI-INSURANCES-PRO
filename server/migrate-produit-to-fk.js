require('dotenv').config();
const pool = require('./db');

const convertToForeignKey = async () => {
  try {
    console.log('📌 Converting ventes.produit to foreign key relationship...\n');

    // 1. Check current produit values
    console.log('🔍 Step 1: Analyzing current product data...');
    const currentResult = await pool.query(`
      SELECT DISTINCT produit, COUNT(*) as count
      FROM ventes
      WHERE produit IS NOT NULL
      GROUP BY produit
      ORDER BY count DESC
    `);
    
    console.log('Current products in ventes:');
    currentResult.rows.forEach(row => {
      console.log(`  • "${row.produit}" (${row.count} ventes)`);
    });

    // 2. Add produit_id column (nullable initially)
    console.log('\n✏️  Step 2: Adding produit_id column...');
    await pool.query(`
      ALTER TABLE ventes 
      ADD COLUMN IF NOT EXISTS produit_id INT REFERENCES produits(id)
    `);
    console.log('✅ Added produit_id column with foreign key');

    // 3. Populate produit_id from existing produit names
    console.log('\n🔗 Step 3: Mapping products to leur IDs...');
    const updateResult = await pool.query(`
      UPDATE ventes v
      SET produit_id = p.id
      FROM produits p
      WHERE LOWER(v.produit) = LOWER(p.nom)
      AND v.produit IS NOT NULL
      AND v.produit_id IS NULL
      RETURNING v.id, v.produit, p.nom
    `);
    
    console.log(`✅ Successfully mapped ${updateResult.rowCount} ventes to products`);
    
    if (updateResult.rowCount < currentResult.rows.length) {
      console.log('\n⚠️  Warning: Some products could not be matched');
      const unmappedResult = await pool.query(`
        SELECT DISTINCT produit FROM ventes 
        WHERE produit IS NOT NULL AND produit_id IS NULL
      `);
      console.log('Unmapped products:');
      unmappedResult.rows.forEach(row => {
        console.log(`  • "${row.produit}"`);
      });
    }

    // 4. Create index for performance
    console.log('\n📊 Step 4: Creating performance index...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_ventes_produit_id ON ventes(produit_id)
    `);
    console.log('✅ Created idx_ventes_produit_id index');

    // 5. Show summary
    console.log('\n📈 Summary:');
    const summary = await pool.query(`
      SELECT 
        COUNT(*) as total_ventes,
        COUNT(produit_id) as ventes_with_product_id,
        COUNT(CASE WHEN produit IS NOT NULL AND produit_id IS NULL THEN 1 END) as unmapped,
        COUNT(produit) as ventes_with_legacy_produit
      FROM ventes
    `);
    
    const stats = summary.rows[0];
    console.log(`  💰 Total ventes: ${stats.total_ventes}`);
    console.log(`  ✅ With produit_id: ${stats.ventes_with_product_id}`);
    console.log(`  ⚠️  Unmapped: ${stats.unmapped}`);
    console.log(`  📝 Still has legacy produit: ${stats.ventes_with_legacy_produit}`);

    console.log('\n✅ Foreign key conversion completed!');
    console.log('   • Both produit_id (new) and produit (legacy) columns exist');
    console.log('   • Next: Drop the legacy produit column when ready');
    console.log('   • SQL: ALTER TABLE ventes DROP COLUMN produit;');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during conversion:', error.message);
    console.error(error);
    process.exit(1);
  }
};

convertToForeignKey();
