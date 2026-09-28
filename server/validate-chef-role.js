require('dotenv').config();
const pool = require('./db');

async function validateChefEquipeRole() {
  const mgrId = `tmp_mgr_${Date.now()}`;
  const chefId = `tmp_chef_${Date.now()}`;

  try {
    await pool.query('BEGIN');

    await pool.query(
      `INSERT INTO users (nom, prenom, identifiant, email, mot_de_passe, role, objectif_mensuel, active, is_default_password, parent_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      ['Manager', 'Adjoint', mgrId, `${mgrId}@local.test`, 'hashed', 'manager_adjoint', 10000000, true, true, null]
    );

    await pool.query(
      `INSERT INTO users (nom, prenom, identifiant, email, mot_de_passe, role, objectif_mensuel, active, is_default_password, parent_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, (SELECT id FROM users WHERE identifiant = $10))`,
      ['Chef', 'Equipe', chefId, `${chefId}@local.test`, 'hashed', 'chef_equipe', 10000000, true, true, mgrId]
    );

    console.log('✅ Validation successful: chef_equipe is accepted by the live database constraint.');
    await pool.query('ROLLBACK');
  } catch (error) {
    await pool.query('ROLLBACK').catch(() => {});
    console.error('❌ Validation failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

validateChefEquipeRole();
