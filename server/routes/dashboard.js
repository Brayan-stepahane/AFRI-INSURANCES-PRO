const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');
const { isManagerAdjointRole, buildHierarchyFilter, buildHierarchySubquery } = require('../utils/hierarchy');

// GET /api/dashboard  — données du tableau de bord selon le rôle
router.get('/', auth, async (req, res) => {
  try {
    const user = req.user;
    const moisActuel = new Date().toISOString().slice(0, 7); // 2026-04

    // CA mensuel par commercial
    let caQuery = 'SELECT * FROM v_ca_mensuel WHERE TO_CHAR(mois,\'YYYY-MM\') = $1';
    const caParams = [moisActuel];

    // Admin has access to all CA data
    if (user.role !== 'admin') {
      if (user.role === 'commercial') {
        caParams.push(user.id);
        caQuery += ` AND commercial_id = $2`;
      } else if (user.role === 'manager' || user.role === 'chef_agence' || user.role === 'manager_adjoint') {
        caParams.push(user.id);
        caQuery += ` AND commercial_id IN (${buildHierarchySubquery(caParams.length)})`;
      }
    }

    // Objectifs du mois
    const moisDate = `${moisActuel}-01`;
    let objQuery;
    const objParams = [moisDate];

    objQuery = `
WITH RECURSIVE user_hierarchy AS (
  SELECT id, parent_id, role, objectif_mensuel, nom
  FROM users
  WHERE active = true AND role IN ('commercial', 'manager_adjoint', 'manager', 'chef_agence')
),
descendants AS (
  SELECT id, id as root_id
  FROM user_hierarchy
  UNION ALL
  SELECT uh.id, d.root_id
  FROM user_hierarchy uh
  JOIN descendants d ON uh.parent_id = d.id
),
commercial_objectives AS (
  SELECT
    u.id,
    COALESCE(o.montant_mensuel, u.objectif_mensuel, 0) AS objectif_mensuel,
    COALESCE(o.montant_reporte, 0) AS montant_reporte
  FROM users u
  LEFT JOIN objectifs o ON o.commercial_id = u.id AND TO_CHAR(o.mois,'YYYY-MM') = TO_CHAR($1::date,'YYYY-MM')
  WHERE u.role = 'commercial' AND u.active = true
),
user_objectives AS (
  SELECT
    uh.id,
    uh.nom,
    uh.role,
    CASE
      WHEN uh.role = 'commercial' THEN co.objectif_mensuel
      ELSE COALESCE((SELECT SUM(co2.objectif_mensuel) FROM commercial_objectives co2 WHERE co2.id IN (SELECT id FROM descendants WHERE root_id = uh.id)), 0)
    END AS objectif_mensuel,
    CASE
      WHEN uh.role = 'commercial' THEN co.montant_reporte
      ELSE COALESCE((SELECT SUM(co2.montant_reporte) FROM commercial_objectives co2 WHERE co2.id IN (SELECT id FROM descendants WHERE root_id = uh.id)), 0)
    END AS montant_reporte
  FROM user_hierarchy uh
  LEFT JOIN commercial_objectives co ON co.id = uh.id
  WHERE uh.role IN ('commercial', 'manager_adjoint', 'manager', 'chef_agence')
),
user_ca AS (
  SELECT
    commercial_id,
    COALESCE(SUM(ca), 0) AS ca_realise
  FROM ventes
  WHERE DATE_TRUNC('month', date_vente) = DATE_TRUNC('month', $1::date)
    AND COALESCE(active::text, 'true') IN ('t','true','1')
  GROUP BY commercial_id
),
hierarchical_ca AS (
  SELECT
    d.root_id AS user_id,
    COALESCE(SUM(uc.ca_realise), 0) AS ca_realise
  FROM descendants d
  LEFT JOIN user_ca uc ON uc.commercial_id = d.id
  GROUP BY d.root_id
)
SELECT
  uo.id AS commercial_id,
  uo.nom AS commercial_nom,
  $1::date AS mois,
  uo.objectif_mensuel,
  uo.montant_reporte AS reporte,
  uo.objectif_mensuel + uo.montant_reporte AS total_objectif,
  COALESCE(hc.ca_realise, 0) AS ca_realise,
  GREATEST(0, uo.objectif_mensuel + uo.montant_reporte - COALESCE(hc.ca_realise, 0)) AS montant_restant,
  CASE
    WHEN uo.objectif_mensuel + uo.montant_reporte = 0 THEN 0
    ELSE LEAST(100, ROUND(COALESCE(hc.ca_realise, 0) / (uo.objectif_mensuel + uo.montant_reporte) * 100, 1))
  END AS pct_atteint
FROM user_objectives uo
LEFT JOIN hierarchical_ca hc ON hc.user_id = uo.id`;

    if (user.role === 'commercial') {
      objParams.push(user.id);
      objQuery += ` WHERE uo.id = $2`;
    } else {
      if (user.role !== 'admin') {
        objParams.push(user.id);
        objQuery += ` WHERE uo.id IN (${buildHierarchySubquery(objParams.length)})`;
      }
    }

    // Prospections en cours
    let prospQuery = `
      SELECT statut, COUNT(*) AS nb
      FROM prospections
      WHERE COALESCE(active::text, 'true') IN ('t','true','1')
        AND statut NOT IN ('Contrat conclu','Perdu')`;
    const prospParams = [];

    // Admin has access to all prospections
    if (user.role !== 'admin') {
      if (user.role === 'commercial') {
        prospParams.push(user.id);
        prospQuery += ` AND commercial_id = $1`;
      } else if (user.role === 'manager' || user.role === 'chef_agence' || user.role === 'manager_adjoint') {
        prospParams.push(user.id);
        prospQuery += ` AND commercial_id IN (${buildHierarchySubquery(prospParams.length)})`;
      }
    }
    prospQuery += ' GROUP BY statut ORDER BY nb DESC';

    // Relances urgentes (en retard)
    let relanceQuery = 'SELECT COUNT(*) AS nb FROM v_relances_urgentes WHERE COALESCE(active::text, \'true\') IN (\'t\',\'true\',\'1\')';
    const relanceParams = [];
    // Admin has access to all relances
    if (user.role !== 'admin') {
      if (user.role === 'commercial') {
        relanceParams.push(user.id);
        relanceQuery += ` AND commercial_id = $1`;
      } else if (user.role === 'manager' || user.role === 'chef_agence' || user.role === 'manager_adjoint') {
        relanceParams.push(user.id);
        relanceQuery += ` AND commercial_id IN (${buildHierarchySubquery(relanceParams.length)})`;
      }
    }

    const [ca, objectifsResult, prospStatuts, relances] = await Promise.all([
      pool.query(caQuery, caParams),
      pool.query(objQuery, objParams),
      pool.query(prospQuery, prospParams),
      pool.query(relanceQuery, relanceParams),
    ]);

    let objectifsRows = objectifsResult.rows;

    // If commercial has no objective row for the month, fall back to the user table objectif_mensuel
    if (user.role === 'commercial' && objectifsRows.length === 0) {
      const { rows: userRows } = await pool.query(
        'SELECT nom, objectif_mensuel FROM users WHERE id = $1',
        [user.id]
      );

      const userData = userRows[0];
      if (userData) {
        const { rows: caRows } = await pool.query(
          `SELECT COALESCE(SUM(ca), 0) AS ca_realise
           FROM ventes
           WHERE commercial_id = $1
             AND DATE_TRUNC('month', date_vente) = DATE_TRUNC('month', CURRENT_DATE)`,
          [user.id]
        );

        const caRealise = Number(caRows[0]?.ca_realise || 0);
        const montantMensuel = Number(userData.objectif_mensuel || 0);
        const totalObjectif = montantMensuel;
        const montantRestant = Math.max(0, totalObjectif - caRealise);
        const pctAtteint = totalObjectif > 0
          ? Math.min(100, Math.round((caRealise / totalObjectif) * 100))
          : 0;

        objectifsRows = [{
          id: null,
          commercial_id: user.id,
          commercial_nom: userData.nom,
          mois: `${moisActuel}-01`,
          montant_mensuel: montantMensuel,
          montant_reporte: 0,
          total_objectif: totalObjectif,
          ca_realise: caRealise,
          montant_restant: montantRestant,
          pct_atteint: pctAtteint,
        }];
      }
    }

    res.json({
      mois: moisActuel,
      ca_mensuel:        ca.rows,
      objectifs:         objectifsRows,
      prospections_statuts: prospStatuts.rows,
      relances_urgentes: parseInt(relances.rows[0]?.nb || 0),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/dashboard/ca-historique  — 6 derniers mois
router.get('/ca-historique', auth, async (req, res) => {
  try {
    let query = `
      SELECT
        TO_CHAR(mois,'YYYY-MM') AS mois,
        commercial_nom,
        ca_total,
        nb_ventes
      FROM v_ca_mensuel
      WHERE mois >= DATE_TRUNC('month', NOW() - INTERVAL '5 months')`;
    const params = [];

    // Admin has access to all historical CA data
    if (req.user.role !== 'admin') {
      if (req.user.role === 'commercial') {
        params.push(req.user.id);
        query += ` AND commercial_id = $1`;
      } else if (req.user.role === 'manager' || req.user.role === 'chef_agence' || req.user.role === 'manager_adjoint') {
        params.push(req.user.id);
        query += ` AND commercial_id IN (${buildHierarchySubquery(params.length)})`;
      }
    }
    query += ' ORDER BY mois ASC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
