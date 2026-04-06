const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');

// GET /api/ventes
router.get('/', auth, async (req, res) => {
  try {
    const { mois } = req.query;
    let query = `
      SELECT v.*, cl.nom AS client_nom, u.nom AS commercial_nom
      FROM ventes v
      JOIN clients cl ON v.client_id = cl.id
      JOIN users u ON v.commercial_id = u.id
      WHERE 1=1`;
    const params = [];

    if (req.user.role === 'commercial') {
      params.push(req.user.id);
      query += ` AND v.commercial_id = $${params.length}`;
    }
    if (mois) {
      params.push(mois); // format: 2026-03
      query += ` AND TO_CHAR(v.date_vente, 'YYYY-MM') = $${params.length}`;
    }
    query += ' ORDER BY v.date_vente DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/ventes
router.post('/', auth, async (req, res) => {
  const {
    prospection_id, cotation_id, client_id,
    date_vente, type_vente, no_police,
    prime_nette, accessoires, no_attestation,
    no_carte_rose, date_effet, date_echeance
  } = req.body;
  const commercial_id = req.user.role === 'commercial' ? req.user.id : req.body.commercial_id;

  try {
    const { rows } = await pool.query(
      `INSERT INTO ventes
        (prospection_id, cotation_id, client_id, commercial_id, date_vente,
         type_vente, no_police, prime_nette, accessoires, no_attestation,
         no_carte_rose, date_effet, date_echeance)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [prospection_id, cotation_id, client_id, commercial_id, date_vente,
       type_vente, no_police, prime_nette, accessoires || 0,
       no_attestation, no_carte_rose, date_effet, date_echeance]
    );

    // Mettre à jour la prospection et la cotation
    await pool.query(
      `UPDATE prospections SET statut='Contrat conclu', updated_at=NOW() WHERE id=$1`,
      [prospection_id]
    );
    if (cotation_id) {
      await pool.query(
        `UPDATE cotations SET statut='Convertie en vente', updated_at=NOW() WHERE id=$1`,
        [cotation_id]
      );
    }
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
