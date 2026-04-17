require('dotenv').config();
const pool = require('./db');

const updateChanceRealisationConstraint = async () => {
  try {
    console.log('📌 Updating chance_realisation constraint in prospections table...');

    // Drop the old constraint
    await pool.query(`
      ALTER TABLE prospections
      DROP CONSTRAINT IF EXISTS prospections_chance_realisation_check
    `);
    console.log('✅ Dropped old chance_realisation constraint');

    // Add the new constraint
    await pool.query(`
      ALTER TABLE prospections
      ADD CONSTRAINT prospections_chance_realisation_check
      CHECK (chance_realisation >= 0.0 AND chance_realisation <= 1.0)
    `);
    console.log('✅ Added new chance_realisation constraint');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run the migration
if (require.main === module) {
  updateChanceRealisationConstraint()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = updateChanceRealisationConstraint;