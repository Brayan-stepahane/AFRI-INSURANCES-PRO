const pool = require('./db');

// Manual categorization for your specific products
const productCategories = {
  // VIE (Life Insurance)
  'Afrilife étude': 'vie',
  'Afrilife Pension': 'vie',
  'Afrilife retraite plus': 'vie',
  'Afrilife prévoyance individuelle': 'vie',
  'Afrilife Prévoyance groupe': 'vie',
  'Afrilife Indemnité de fin de carrière': 'vie',
  'Afrilife retraite individuelle': 'vie',
  'Afrilife libre retraite': 'vie',
  'Afrilife retraite complémentaire': 'vie',
  'Assurance Santé Groupe': 'vie',
  
  // NON-VIE (Property & Casualty)
  'Assurance Maritime': 'non_vie',
  'Automobile': 'non_vie',
  'Assurance Voyage': 'non_vie',
  'Flotte Automobile': 'non_vie',
  'Global Dommages': 'non_vie',
  'Individuelle Accident': 'non_vie',
  'Individuelle Accident Groupe': 'non_vie',
  'Multirisque Habitation': 'non_vie',
  'Responsabilité Civile Chef Entreprise': 'non_vie',
  'Transport Marchandise': 'non_vie',
  'Tous Risques Chantiers': 'non_vie',
  'Vol': 'non_vie',
  'Bris de Machine': 'non_vie',
  'Tous Risques Informatiques': 'non_vie',
  'Tous Risques Montages': 'non_vie',
  'Responsabilité civile scolaire': 'non_vie',
  'Assurance evenement': 'non_vie',
  'Caution de soumission': 'non_vie',
  'Avance de Démarrage': 'non_vie',
  'Fin de Gurantie': 'non_vie',
  'Bonne Fin de guarantie': 'non_vie',
  'Retenu de Guarantie': 'non_vie',
};

async function migrateProductCategories() {
  try {
    console.log('🔄 Fetching products from database...');
    const result = await pool.query('SELECT id, nom FROM produits ORDER BY id');
    
    if (result.rows.length === 0) {
      console.log('✅ No products in database');
      process.exit(0);
    }

    console.log(`📦 Found ${result.rows.length} products:\n`);
    
    let categorized = 0;
    let uncategorized = [];

    for (const product of result.rows) {
      // Try exact match first
      let categorie = productCategories[product.nom];
      
      // Try partial match if no exact match
      if (!categorie) {
        const lowerNom = product.nom.toLowerCase();
        for (const [key, cat] of Object.entries(productCategories)) {
          if (lowerNom.includes(key.toLowerCase())) {
            categorie = cat;
            break;
          }
        }
      }

      if (categorie) {
        await pool.query(
          'UPDATE produits SET categorie = $1 WHERE id = $2',
          [categorie, product.id]
        );
        console.log(`✅ ID ${product.id}: "${product.nom}" → ${categorie.toUpperCase()}`);
        categorized++;
      } else {
        console.log(`⚠️  ID ${product.id}: "${product.nom}" → NOT CATEGORIZED (manual review needed)`);
        uncategorized.push({ id: product.id, nom: product.nom });
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Categorized: ${categorized}/${result.rows.length}`);
    console.log(`   ⚠️  Uncategorized: ${uncategorized.length}/${result.rows.length}`);

    if (uncategorized.length > 0) {
      console.log(`\n💡 Uncategorized products (please update manually):`);
      uncategorized.forEach(p => {
        console.log(`   UPDATE produits SET categorie = 'vie' OR 'non_vie' WHERE id = ${p.id}; -- "${p.nom}"`);
      });
    }

    console.log('\n✨ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

migrateProductCategories();
