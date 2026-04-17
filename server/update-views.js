require('dotenv').config();
const pool = require('./db');

const updateViews = async () => {
  try {
    console.log('📌 Updating database views to include active filter...');

    // Drop views that depend on v_prospections first
    // (no dependencies in this case, but good practice)
    
    // Drop and recreate v_prospections view
    await pool.query(`DROP VIEW IF EXISTS v_prospections CASCADE`);
    console.log('ℹ️ Dropped v_prospections view');
    
    await pool.query(`
      CREATE VIEW v_prospections AS
      SELECT
        p.id,
        p.numero,
        p.date_prospection,
        p.risque_prospecte,
        p.potentiel_ca,
        p.chance_realisation,
        p.statut,
        p.date_relance,
        p.date_visite_1,
        p.date_visite_2,
        p.date_visite_3,
        p.observations,
        p.ancien_assureur,
        p.date_effet_ancien,
        p.date_echeance_ancien,
        p.created_at,
        p.active,
        c.id          AS client_id,
        c.nom         AS client_nom,
        c.telephone   AS client_tel,
        c.type_client,
        c.activite    AS client_activite,
        u.id          AS commercial_id,
        u.nom         AS commercial_nom,
        u.equipe,
        cot.id        AS cotation_id,
        cot.numero    AS cotation_numero,
        cot.montant   AS cotation_montant,
        cot.statut    AS cotation_statut,
        v.id          AS vente_id,
        v.prime_nette,
        v.accessoires,
        v.ca,
        v.date_vente,
        v.type_vente,
        v.no_police
      FROM prospections p
      JOIN clients      c   ON p.client_id      = c.id
      JOIN users        u   ON p.commercial_id  = u.id
      LEFT JOIN cotations cot ON cot.prospection_id = p.id
      LEFT JOIN ventes  v   ON v.prospection_id = p.id
    `);
    console.log('✅ Recreated v_prospections view with active column');

    // Drop and recreate v_relances_urgentes view
    await pool.query(`DROP VIEW IF EXISTS v_relances_urgentes CASCADE`);
    console.log('ℹ️ Dropped v_relances_urgentes view');
    
    await pool.query(`
      CREATE VIEW v_relances_urgentes AS
      SELECT
        p.id,
        p.date_relance,
        p.statut,
        p.risque_prospecte,
        p.active,
        c.nom           AS client_nom,
        c.id            AS client_id,
        c.telephone,
        u.nom           AS commercial_nom,
        u.id            AS commercial_id,
        (CURRENT_DATE - p.date_relance) AS jours_retard
      FROM prospections p
      JOIN clients c ON p.client_id     = c.id
      JOIN users   u ON p.commercial_id = u.id
      WHERE (p.active IS NULL OR p.active = true)
        AND p.date_relance < CURRENT_DATE
        AND p.statut NOT IN ('Contrat conclu', 'Perdu')
      ORDER BY p.date_relance ASC
    `);
    console.log('✅ Recreated v_relances_urgentes view with active filter');

    console.log('🎉 Views updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating views:', error.message);
    process.exit(1);
  }
};

updateViews();