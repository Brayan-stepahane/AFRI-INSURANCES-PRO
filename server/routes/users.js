const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');
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
      `SELECT u.id, u.nom, u.prenom, u.identifiant, u.role, u.equipe, u.objectif_mensuel, u.active, u.created_at, 
              u.manager_id, u.manager_adjoint_id, u.parent_id,
              ma.nom as manager_adjoint_nom, ma.prenom as manager_adjoint_prenom,
              m.nom as manager_nom, m.prenom as manager_prenom
       FROM users u
       LEFT JOIN users ma ON u.manager_adjoint_id = ma.id
       LEFT JOIN users m ON u.manager_id = m.id
       ORDER BY u.role, u.nom`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/users  — créer un utilisateur (UPDATED)
router.post('/', auth, managerOnly, async (req, res) => {
  const { 
    nom, 
    prenom, 
    identifiant, 
    mot_de_passe, 
    role, 
    equipe, 
    manager_id, 
    manager_adjoint_id,
    parentId    ,
    objectif_mensuel,       // ← New field from frontend
  } = req.body;

  const normalizedRole = role === 'manager_adj' ? 'manager_adjoint' : role;

  // Basic validation
  if (!nom || !prenom || !identifiant || !mot_de_passe || !normalizedRole) {
    return res.status(400).json({ error: 'Nom, prénom, identifiant, mot de passe et rôle sont requis' });
  }

  // Hierarchy validation (support both old fields and new parentId)
  if (normalizedRole === 'commercial' && !manager_adjoint_id && !parentId) {
    return res.status(400).json({ error: 'manager_adjoint_id ou parentId requis pour commercial' });
  }
  if (normalizedRole === 'manager_adjoint' && !manager_id && !parentId) {
    return res.status(400).json({ error: 'manager_id ou parentId requis pour manager_adjoint' });
  }

  try {
    const hash = await bcrypt.hash(mot_de_passe, 10);

    // Convert parentId to number or null (important for integer column)
    const finalParentId = parentId ? Number(parentId) : null;

    // Decide values for old columns (for backward compatibility)
    let finalManagerId = manager_id ? Number(manager_id) : null;
    let finalManagerAdjointId = manager_adjoint_id ? Number(manager_adjoint_id) : null;

    // Map new parentId to old columns if needed
    if (finalParentId) {
      if (normalizedRole === 'commercial') {
        finalManagerAdjointId = finalParentId;
      } else if (normalizedRole === 'manager_adjoint' || normalizedRole === 'manager') {
        finalManagerId = finalParentId;
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO users 
       (nom, prenom, identifiant, mot_de_passe, role, equipe, objectif_mensuel, 
        manager_id, manager_adjoint_id, parent_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, nom, prenom, identifiant, role, equipe, objectif_mensuel`,
      [
        nom.trim(),
        prenom.trim(),
        identifiant.trim().toLowerCase(),
        hash,
        normalizedRole,
        equipe || null,
        objectif_mensuel || 0,
        finalManagerId,
        finalManagerAdjointId,
        finalParentId
      ]
    );

    res.status(201).json(rows[0]);
  } catch (e) {
    console.error('Create user error:', e);

    if (e.code === '23505') 
      return res.status(409).json({ error: 'Identifiant déjà utilisé' });
    
    if (e.code === '23503') 
      return res.status(400).json({ error: 'Le supérieur sélectionné n\'existe pas ou n\'a pas le bon rôle' });

    res.status(500).json({ error: e.message || 'Erreur lors de la création' });
  }
});

// PUT /api/users/:id/toggle  — unchanged
router.put('/:id/toggle', auth, managerOnly, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE users SET active = NOT active, updated_at=NOW() WHERE id=$1 RETURNING id, nom, active`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;