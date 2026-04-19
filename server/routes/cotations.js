const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');
const { isManagerAdjointRole, buildHierarchyFilter } = require('../utils/hierarchy');

// GET /api/cotations
router.get('/', auth, async (req, res) => {
  try {
    let query = `
      SELECT c.*, cl.nom AS client_nom, u.nom AS commercial_nom
      FROM cotations c
      JOIN clients cl ON c.client_id = cl.id
      JOIN users u ON c.commercial_id = u.id
      WHERE c.active = true`;
    const params = [];

    if (req.user.role === 'commercial') {
      params.push(req.user.id);
      query += ` AND c.commercial_id = $${params.length}`;
    } else if (isManagerAdjointRole(req.user.role)) {
      params.push(req.user.id);
      query += ` AND u.manager_adjoint_id = $${params.length}`;
    } else if (req.user.role === 'manager' || req.user.role === 'chef_agence') {
      params.push(req.user.id);
      query += ` AND ${buildHierarchyFilter('u', params.length)}`;
    }
    query += ' ORDER BY c.date_cotation DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/cotations
router.post('/', auth, async (req, res) => {
  if (req.user.role === 'admin') {
    return res.status(403).json({ error: 'Administrateur non autorisé à créer une cotation' });
  }

  const { prospection_id, client_id, risque_cote, date_cotation, montant } = req.body;
  const commercial_id = req.user.role === 'commercial' ? req.user.id : req.body.commercial_id;
  try {
    const { rows } = await pool.query(
      `INSERT INTO cotations (prospection_id, client_id, commercial_id, risque_cote, date_cotation, montant)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [prospection_id, client_id, commercial_id, risque_cote, date_cotation, montant]
    );
    // Mettre à jour le statut de la prospection
    await pool.query(
      `UPDATE prospections SET statut='Cotation envoyée', updated_at=NOW() WHERE id=$1`,
      [prospection_id]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/cotations/:id
router.put('/:id', auth, async (req, res) => {
  const { risque_cote, date_cotation, montant, date_validation, statut } = req.body;

  try {
    const { rows: existingRows } = await pool.query(
      'SELECT statut FROM cotations WHERE id = $1',
      [req.params.id]
    );
    if (!existingRows[0]) {
      return res.status(404).json({ error: 'Cotation introuvable' });
    }

    const currentStatus = existingRows[0].statut;
    if (statut === 'Convertie en vente' && currentStatus !== 'Convertie en vente') {
      return res.status(400).json({
        error: 'La modification d\'une cotation ne peut pas la convertir en vente. Utilisez le bouton Convertir en vente pour créer une vente.'
      });
    }

    const { rows } = await pool.query(
      `UPDATE cotations SET risque_cote=$1, date_cotation=$2, montant=$3, date_validation=$4, statut=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [risque_cote, date_cotation, montant, date_validation, statut, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Cotation introuvable' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/cotations/:id
router.delete('/:id', auth, async (req, res) => {
  console.log('DELETE /api/cotations/:id', { cotationId: req.params.id, user: req.user?.id });
  try {
    const { rows } = await pool.query(
      'UPDATE cotations SET active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Cotation introuvable' });
    res.json({ message: 'Cotation désactivée' });
  } catch (e) {
    console.error('Failed to deactivate cotation:', e.message || e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
