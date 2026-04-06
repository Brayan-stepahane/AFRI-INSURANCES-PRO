const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const auth = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { identifiant, password } = req.body;

    if (!identifiant || !password) {
      return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
    }

    // Get user from database
    const { rows } = await pool.query(
      'SELECT id, nom, prenom, identifiant, password, role, equipe, objectif_mensuel, actif FROM users WHERE identifiant = $1',
      [identifiant]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Identifiant ou mot de passe invalide' });
    }

    const user = rows[0];

    // Check if user is active
    if (!user.actif) {
      return res.status(403).json({ error: 'Utilisateur inactif' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Identifiant ou mot de passe invalide' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        identifiant: user.identifiant,
        role: user.role,
        equipe: user.equipe,
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        identifiant: user.identifiant,
        role: user.role,
        equipe: user.equipe,
        objectif_mensuel: user.objectif_mensuel,
      },
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/logout
router.post('/logout', auth, (req, res) => {
  // Logout is mainly client-side (remove token from localStorage)
  res.json({ message: 'Déconnecté' });
});

// POST /api/auth/refresh
router.post('/refresh', auth, async (req, res) => {
  try {
    const user = req.user;

    // Get updated user data
    const { rows } = await pool.query(
      'SELECT id, nom, prenom, identifiant, role, equipe, objectif_mensuel, actif FROM users WHERE id = $1',
      [user.id]
    );

    if (rows.length === 0 || !rows[0].actif) {
      return res.status(401).json({ error: 'Utilisateur introuvable ou inactif' });
    }

    const updatedUser = rows[0];

    // Generate new token
    const token = jwt.sign(
      {
        id: updatedUser.id,
        nom: updatedUser.nom,
        prenom: updatedUser.prenom,
        identifiant: updatedUser.identifiant,
        role: updatedUser.role,
        equipe: updatedUser.equipe,
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '24h' }
    );

    res.json({ token, user: updatedUser });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
