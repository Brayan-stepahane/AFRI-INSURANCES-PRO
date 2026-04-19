const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');

// GET /api/dashboard  — données du tableau de bord selon le rôle
router.get('/', auth, async (req, res) => {
  try {
    const user = req.user;
    const moisActuel = new Date().toISOString().slice(0, 7); // 2026-04

    // CA mensuel par commercial
    let caQuery = 'SELECT * FROM v_ca_mensuel WHERE TO_CHAR(mois,\'YYYY-MM\') = $1';
    const caParams = [moisActuel];

    if (user.role === 'commercial') {
      caParams.push(user.id);
      caQuery += ` AND commercial_id = $2`;
    }

    // Objectifs du mois
    const moisDate = `${moisActuel}-01`;
    let objQuery;
    const objParams = [moisDate];

    if (user.role === 'commercial') {
      objQuery = `
        SELECT
          id,
          commercial_id,
          commercial_nom,
          mois,
          montant_mensuel AS objectif_mensuel,
          montant_reporte AS reporte,
          total_objectif,
          ca_realise,
          montant_restant,
          pct_atteint
        FROM v_objectifs_realises
        WHERE TO_CHAR(mois,'YYYY-MM') = $1`;
      objParams.push(user.id);
      objQuery += ` AND commercial_id = $2`;
    } else {
      objQuery = `
        SELECT
          COALESCE(o.id, 0) AS id,
          u.id AS commercial_id,
          u.nom AS commercial_nom,
          $1::date AS mois,
          COALESCE(o.montant_mensuel, u.objectif_mensuel, 0) AS objectif_mensuel,
          COALESCE(o.montant_reporte, 0) AS reporte,
          COALESCE(o.montant_mensuel, u.objectif_mensuel, 0) + COALESCE(o.montant_reporte, 0) AS total_objectif,
          COALESCE(v.ca_realise, 0) AS ca_realise,
          GREATEST(0, COALESCE(o.montant_mensuel, u.objectif_mensuel, 0) + COALESCE(o.montant_reporte, 0) - COALESCE(v.ca_realise, 0)) AS montant_restant,
          CASE
            WHEN COALESCE(o.montant_mensuel, u.objectif_mensuel, 0) + COALESCE(o.montant_reporte, 0) = 0 THEN 0
            ELSE LEAST(100, ROUND(COALESCE(v.ca_realise, 0) / (COALESCE(o.montant_mensuel, u.objectif_mensuel, 0) + COALESCE(o.montant_reporte, 0)) * 100, 1))
          END AS pct_atteint
        FROM users u
        LEFT JOIN objectifs o
          ON o.commercial_id = u.id
          AND TO_CHAR(o.mois,'YYYY-MM') = TO_CHAR($1::date,'YYYY-MM')
        LEFT JOIN (
          SELECT commercial_id, COALESCE(SUM(ca), 0) AS ca_realise
          FROM ventes
          WHERE DATE_TRUNC('month', date_vente) = DATE_TRUNC('month', $1::date)
          GROUP BY commercial_id
        ) v ON v.commercial_id = u.id
        WHERE u.role = 'commercial'`;

      if (user.role === 'manager_adj' || user.role === 'manager_adjoint') {
        objParams.push(user.id);
        objQuery += ` AND u.manager_adjoint_id = $${objParams.length}`;
      }
    }

    // Prospections en cours
    let prospQuery = `
      SELECT statut, COUNT(*) AS nb
      FROM prospections
      WHERE (COALESCE(active, active) IS NULL OR COALESCE(active, active) = true)
        AND statut NOT IN ('Contrat conclu','Perdu')`;
    const prospParams = [];

    if (user.role === 'commercial') {
      prospParams.push(user.id);
      prospQuery += ` AND commercial_id = $1`;
    }
    prospQuery += ' GROUP BY statut ORDER BY nb DESC';

    // Relances urgentes (en retard)
    let relanceQuery = 'SELECT COUNT(*) AS nb FROM v_relances_urgentes WHERE (active IS NULL OR active = true)';
    const relanceParams = [];
    if (user.role === 'commercial') {
      relanceParams.push(user.id);
      relanceQuery += ` AND commercial_id = $1`;
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

    if (req.user.role === 'commercial') {
      params.push(req.user.id);
      query += ` AND commercial_id = $1`;
    }
    query += ' ORDER BY mois ASC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
