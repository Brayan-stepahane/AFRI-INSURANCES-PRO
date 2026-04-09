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
    let objQuery = `
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
    const objParams = [moisActuel];

    if (user.role === 'commercial') {
      objParams.push(user.id);
      objQuery += ` AND commercial_id = $2`;
    }

    // Prospections en cours
    let prospQuery = `
      SELECT statut, COUNT(*) AS nb
      FROM prospections
      WHERE statut NOT IN ('Contrat conclu','Perdu')`;
    const prospParams = [];

    if (user.role === 'commercial') {
      prospParams.push(user.id);
      prospQuery += ` AND commercial_id = $1`;
    }
    prospQuery += ' GROUP BY statut ORDER BY nb DESC';

    // Relances urgentes (en retard)
    let relanceQuery = 'SELECT COUNT(*) AS nb FROM v_relances_urgentes WHERE 1=1';
    const relanceParams = [];
    if (user.role === 'commercial') {
      relanceParams.push(user.id);
      relanceQuery += ` AND commercial_id = $1`;
    }

    const [ca, objectifs, prospStatuts, relances] = await Promise.all([
      pool.query(caQuery, caParams),
      pool.query(objQuery, objParams),
      pool.query(prospQuery, prospParams),
      pool.query(relanceQuery, relanceParams),
    ]);

    res.json({
      mois: moisActuel,
      ca_mensuel:        ca.rows,
      objectifs:         objectifs.rows,
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
