const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Middleware : réservé aux managers et admins
const managerOnly = (req, res, next) => {
  const allowed = ['manager', 'chef_agence', 'admin', 'manager_adj', 'manager_adjoint'];
  if (!allowed.includes(req.user.role))
    return res.status(403).json({ error: 'Accès refusé' });
  next();
};

// GET /api/users
router.get('/', auth, managerOnly, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nom, prenom, identifiant, role, equipe, objectif_mensuel, actif, created_at
       FROM users ORDER BY role, nom`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/users/commerciaux  — liste simplifiée pour les selects
router.get('/commerciaux', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nom, prenom, equipe, objectif_mensuel
       FROM users WHERE role = 'commercial' AND actif = true ORDER BY nom`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/users  — créer un utilisateur
router.post('/', auth, managerOnly, async (req, res) => {
  const { nom, prenom, identifiant, mot_de_passe, role, equipe, objectif_mensuel } = req.body;
  try {
    const hash = await bcrypt.hash(mot_de_passe, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (nom, prenom, identifiant, mot_de_passe, role, equipe, objectif_mensuel)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, nom, prenom, identifiant, role, equipe, objectif_mensuel`,
      [nom, prenom, identifiant, hash, role, equipe, objectif_mensuel || 0]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Identifiant déjà utilisé' });
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/users/:id/toggle  — activer/désactiver
router.put('/:id/toggle', auth, managerOnly, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE users SET actif = NOT actif, updated_at=NOW() WHERE id=$1 RETURNING id, nom, actif`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
