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
      'SELECT id, nom, prenom, identifiant, mot_de_passe, role, equipe, objectif_mensuel, active, is_default_password FROM users WHERE identifiant = $1',
      [identifiant]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Identifiant ou mot de passe invalide' });
    }

    const user = rows[0];

    // Check if user is active
    if (!user.active) {
      return res.status(403).json({ error: 'Utilisateur inactive' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.mot_de_passe);
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
        is_default_password: user.is_default_password,
      },
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { identifiant, password, nom, prenom, role = 'commercial', equipe, objectif_mensuel = 0 } = req.body;

    if (!identifiant || !password || !nom || !prenom) {
      return res.status(400).json({ error: 'Identifiant, mot de passe, nom et prénom requis' });
    }

    // Check if user already exists
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE identifiant = $1', [identifiant]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Identifiant déjà utilisé' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { rows } = await pool.query(
      'INSERT INTO users (nom, prenom, identifiant, mot_de_passe, role, equipe, objectif_mensuel, active) VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING id, nom, prenom, identifiant, role, equipe',
      [nom, prenom, identifiant, hashedPassword, role, equipe, objectif_mensuel]
    );

    const user = rows[0];

    // Generate token
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

    res.status(201).json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        identifiant: user.identifiant,
        role: user.role,
        equipe: user.equipe,
        objectif_mensuel: objectif_mensuel,
      },
    });
  } catch (e) {
    console.error('Register error:', e);
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
      'SELECT id, nom, prenom, identifiant, role, equipe, objectif_mensuel, active FROM users WHERE id = $1',
      [user.id]
    );

    if (rows.length === 0 || !rows[0].active) {
      return res.status(401).json({ error: 'Utilisateur introuvable ou inactive' });
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
