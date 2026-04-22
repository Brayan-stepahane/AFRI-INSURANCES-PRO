const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Middleware : réservé aux managers et admins
const managerOnly = (req, res, next) => {
  const allowed = ['manager', 'chef_agence', 'admin', 'manager_adjoint', 'manager_adjoint'];
  if (!allowed.includes(req.user.role))
    return res.status(403).json({ error: 'Accès refusé' });
  next();
};

// GET /api/users
router.get('/', auth, managerOnly, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.nom, u.prenom, u.identifiant, u.email, u.role, u.equipe, u.objectif_mensuel, u.active, u.created_at,
              u.parent_id,
              p.nom as parent_nom, p.prenom as parent_prenom, p.role as parent_role
       FROM users u
       LEFT JOIN users p ON u.parent_id = p.id
       ORDER BY u.role, u.nom`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/users
router.post('/', auth, managerOnly, async (req, res) => {
  const {
    nom,
    prenom,
    identifiant,
    email,
    mot_de_passe,
    role,
    equipe,
    parentId,
    parent_id,
    objectif_mensuel,
  } = req.body;

  const normalizedRole = role === 'manager_adjoint' ? 'manager_adjoint' : role;

  if (!nom || !prenom || !identifiant || !email || !mot_de_passe || !normalizedRole) {
    return res.status(400).json({ error: 'Nom, prénom, identifiant, email, mot de passe et rôle sont requis' });
  }

  let finalParentId = parentId ? Number(parentId) : parent_id ? Number(parent_id) : null;

  if (normalizedRole === 'commercial' && !finalParentId) {
    return res.status(400).json({ error: 'parentId requis pour commercial' });
  }
  if (normalizedRole === 'manager_adjoint' && !finalParentId) {
    return res.status(400).json({ error: 'parentId requis pour manager_adjoint' });
  }

  try {
    const hash = await bcrypt.hash(mot_de_passe, 10);

    if (finalParentId) {
      const { rows: parentRows } = await pool.query(
        'SELECT id, role FROM users WHERE id = $1',
        [finalParentId]
      );

      if (parentRows.length === 0) {
        return res.status(400).json({ error: 'Le supérieur sélectionné n\'existe pas' });
      }

      const parentRole = parentRows[0].role;

      if (normalizedRole === 'commercial') {
        if (!['manager_adjoint', 'manager', 'chef_agence'].includes(parentRole)) {
          return res.status(400).json({ error: 'Le parent d\'un commercial doit être manager_adjoint, manager ou chef_agence' });
        }
      } else if (normalizedRole === 'manager_adjoint') {
        if (!['manager', 'chef_agence', 'admin'].includes(parentRole)) {
          return res.status(400).json({ error: 'Le parent d\'un manager_adjoint doit être manager, chef_agence ou admin' });
        }
      } else if (normalizedRole === 'manager') {
        if (!['chef_agence', 'admin'].includes(parentRole)) {
          return res.status(400).json({ error: 'Le parent d\'un manager doit être chef_agence ou admin' });
        }
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO users
       (nom, prenom, identifiant, email, mot_de_passe, role, equipe, objectif_mensuel,
        parent_id, is_default_password)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
       RETURNING id, nom, prenom, identifiant, email, role, equipe, objectif_mensuel, is_default_password`,
      [
        nom.trim(),
        prenom.trim(),
        identifiant.trim().toLowerCase(),
        email.trim().toLowerCase(),
        hash,
        normalizedRole,
        equipe || null,
        objectif_mensuel || 0,
        finalParentId,
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

// PUT /api/users/:id/change-password — Change user password
router.put('/:id/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = Number(req.params.id);
    const authenticatedUserId = req.user.id;

    // Users can only change their own password
    if (userId !== authenticatedUserId) {
      return res.status(403).json({ error: 'Vous ne pouvez modifier que votre propre mot de passe' });
    }

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Le mot de passe actuel et le nouveau mot de passe sont requis' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit avoir au moins 6 caractères' });
    }

    // Get user from database
    const { rows: userRows } = await pool.query(
      'SELECT id, mot_de_passe FROM users WHERE id = $1',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = userRows[0];

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.mot_de_passe);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Le mot de passe actuel est incorrect' });
    }

    // Check if new password is same as current password
    const samePassword = await bcrypt.compare(newPassword, user.mot_de_passe);
    if (samePassword) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit être différent du mot de passe actuel' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and set is_default_password to false
    const { rows } = await pool.query(
      `UPDATE users
       SET mot_de_passe = $1, is_default_password = false, updated_at = NOW()
       WHERE id = $2
       RETURNING id, nom, prenom, identifiant, email, role, is_default_password`,
      [hashedPassword, userId]
    );

    res.json({
      message: 'Mot de passe modifié avec succès',
      user: rows[0],
    });
  } catch (e) {
    console.error('Change password error:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;