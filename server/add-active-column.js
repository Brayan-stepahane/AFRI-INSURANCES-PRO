require('dotenv').config();
const pool = require('./db');

const addActiveColumn = async () => {
  try {
    console.log('📌 Adding active column to prospections table...');

    // Add active column if it doesn't exist
    await pool.query(`
      ALTER TABLE prospections
      ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true
    `);
    console.log('✅ Added active column');

    // Create index for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_prospections_active ON prospections(active)
    `);
    console.log('✅ Created index on active column');

    // Update existing records to be active (in case column was added later)
    const result = await pool.query(`
      UPDATE prospections SET active = true WHERE active IS NULL
    `);
    console.log(`✅ Updated ${result.rowCount} existing records to active = true`);

    console.log('🎉 Active column setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding active column:', error.message);
    process.exit(1);
  }
};

addActiveColumn();