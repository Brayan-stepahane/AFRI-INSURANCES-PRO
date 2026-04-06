const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');

// GET /api/clients
router.get('/', auth, async (req, res) => {
  try {
    const { search, type_client } = req.query;
    let query = 'SELECT * FROM clients WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (nom ILIKE $${params.length} OR telephone ILIKE $${params.length})`;
    }
    if (type_client) {
      params.push(type_client);
      query += ` AND type_client = $${params.length}`;
    }
    query += ' ORDER BY nom ASC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/clients/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Client introuvable' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/clients
router.post('/', auth, async (req, res) => {
  const { nom, telephone, activite, type_client, email, ville } = req.body;
  if (!nom) return res.status(400).json({ error: 'Le nom est requis' });
  try {
    // Générer l'ID automatiquement via la séquence
    const idRes = await pool.query("SELECT 'CLI-' || LPAD(nextval('client_seq')::TEXT, 4, '0') AS id");
    const id = idRes.rows[0].id;

    const { rows } = await pool.query(
      `INSERT INTO clients (id, nom, telephone, activite, type_client, email, ville)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, nom, telephone, activite, type_client || 'Particulier', email, ville]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/clients/:id
router.put('/:id', auth, async (req, res) => {
  const { nom, telephone, activite, type_client, email, ville } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE clients SET nom=$1, telephone=$2, activite=$3,
       type_client=$4, email=$5, ville=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [nom, telephone, activite, type_client, email, ville, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Client introuvable' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
