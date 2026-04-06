const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');

// GET /api/prospections  (filtre par rôle automatiquement)
router.get('/', auth, async (req, res) => {
  try {
    const { statut, commercial_id } = req.query;
    const user = req.user;

    let query = 'SELECT * FROM v_prospections WHERE 1=1';
    const params = [];

    // Un commercial ne voit que ses propres prospections
    if (user.role === 'commercial') {
      params.push(user.id);
      query += ` AND commercial_id = $${params.length}`;
    } else if (user.role === 'manager_adjoint') {
      // Voit son équipe
      params.push(user.equipe);
      query += ` AND equipe = $${params.length}`;
    }
    // manager, chef_agence, admin voient tout

    if (statut) {
      params.push(statut);
      query += ` AND statut = $${params.length}`;
    }
    if (commercial_id && user.role !== 'commercial') {
      params.push(commercial_id);
      query += ` AND commercial_id = $${params.length}`;
    }

    query += ' ORDER BY date_prospection DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/prospections/relances  (relances urgentes)
router.get('/relances', auth, async (req, res) => {
  try {
    let query = 'SELECT * FROM v_relances_urgentes WHERE 1=1';
    const params = [];

    if (req.user.role === 'commercial') {
      params.push(req.user.id);
      query += ` AND commercial_id = $${params.length}`;
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/prospections/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM v_prospections WHERE id = $1', [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Prospection introuvable' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/prospections
router.post('/', auth, async (req, res) => {
  const {
    client_id, date_prospection, risque_prospecte, potentiel_ca,
    chance_realisation, ancien_assureur, date_effet_ancien,
    date_echeance_ancien, date_visite_1, date_visite_2, date_visite_3,
    date_relance, observations, statut
  } = req.body;

  const commercial_id = req.user.role === 'commercial' ? req.user.id : req.body.commercial_id;

  try {
    const { rows } = await pool.query(
      `INSERT INTO prospections
        (commercial_id, client_id, date_prospection, risque_prospecte, potentiel_ca,
         chance_realisation, ancien_assureur, date_effet_ancien, date_echeance_ancien,
         date_visite_1, date_visite_2, date_visite_3, date_relance, observations, statut)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [commercial_id, client_id, date_prospection, risque_prospecte, potentiel_ca,
       chance_realisation, ancien_assureur, date_effet_ancien, date_echeance_ancien,
       date_visite_1, date_visite_2, date_visite_3, date_relance, observations,
       statut || 'Premier contact']
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/prospections/:id  (mise à jour statut + dates visites)
router.put('/:id', auth, async (req, res) => {
  const {
    statut, date_visite_1, date_visite_2, date_visite_3,
    date_relance, observations, potentiel_ca, chance_realisation
  } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE prospections SET
        statut=$1, date_visite_1=$2, date_visite_2=$3, date_visite_3=$4,
        date_relance=$5, observations=$6, potentiel_ca=$7,
        chance_realisation=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [statut, date_visite_1, date_visite_2, date_visite_3,
       date_relance, observations, potentiel_ca, chance_realisation, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Prospection introuvable' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
