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

// PUT /api/ventes/:id
router.put('/:id', auth, async (req, res) => {
  const {
    produit, date_vente, dateVente, type_vente, typeVente, no_police,
    noPolice, prime_nette, primeNette, accessoires, no_attestation,
    no_carte_rose, noCarteRose, date_effet, dateEffet, date_echeance, dateEcheance
  } = req.body;

  const finalDateVente = date_vente || dateVente;
  const finalTypeVente = type_vente || typeVente;
  const finalNoPolice = no_police || noPolice;
  const finalPrimeNette = prime_nette || primeNette;
  const finalNoAttestation = no_attestation;
  const finalNoCarteRose = no_carte_rose || noCarteRose;
  const finalDateEffet = date_effet || dateEffet;
  const finalDateEcheance = date_echeance || dateEcheance;

  try {
    const { rows } = await pool.query(
      `UPDATE ventes SET date_vente=$1, type_vente=$2, no_police=$3,
       prime_nette=$4, accessoires=$5, no_attestation=$6, no_carte_rose=$7,
       date_effet=$8, date_echeance=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [finalDateVente, finalTypeVente, finalNoPolice, finalPrimeNette, accessoires || 0,
       finalNoAttestation, finalNoCarteRose, finalDateEffet, finalDateEcheance, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Vente introuvable' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/ventes/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM ventes WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Vente introuvable' });
    res.json({ message: 'Vente supprimée' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
