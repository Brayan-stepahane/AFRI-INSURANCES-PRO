const pool = require('./db');

const requiredColumns = [
  { name: 'montant_mensuel_vie', definition: 'DECIMAL(12, 2) DEFAULT 0' },
  { name: 'montant_mensuel_non_vie', definition: 'DECIMAL(12, 2) DEFAULT 0' },
  { name: 'montant_reporte_vie', definition: 'DECIMAL(12, 2) DEFAULT 0' },
  { name: 'montant_reporte_non_vie', definition: 'DECIMAL(12, 2) DEFAULT 0' },
];

async function migrate() {
  try {
    const result = await pool.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'objectifs' AND table_schema = 'public'`
    );

    const existingColumns = new Set(result.rows.map((row) => row.column_name));
    const missingColumns = requiredColumns.filter((col) => !existingColumns.has(col.name));

    if (missingColumns.length === 0) {
      console.log('✅ All objectifs columns are already present. No migration needed.');
      process.exit(0);
    }

    console.log('🔧 Adding missing objectifs columns:');
    for (const column of missingColumns) {
      console.log(`  - ${column.name}`);
      await pool.query(`ALTER TABLE objectifs ADD COLUMN ${column.name} ${column.definition}`);
    }

    console.log('✅ Migration complete. Missing objectifs columns have been added.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
