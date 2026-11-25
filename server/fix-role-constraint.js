require('dotenv').config();
const pool = require('./db');

async function updateRoleConstraint() {
  const sql = `
    ALTER TABLE users
      DROP CONSTRAINT IF EXISTS users_role_check;

    ALTER TABLE users
      ADD CONSTRAINT users_role_check
      CHECK (role IN ('admin', 'chef_agence', 'manager', 'manager_adjoint', 'chef_equipe', 'commercial'));
  `;

  try {
    await pool.query(sql);
    console.log('✅ users_role_check updated successfully.');
    console.log("Allowed roles: admin, chef_agence, manager, manager_adjoint, chef_equipe, commercial");
  } catch (error) {
    console.error('❌ Failed to update users_role_check');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

updateRoleConstraint();
