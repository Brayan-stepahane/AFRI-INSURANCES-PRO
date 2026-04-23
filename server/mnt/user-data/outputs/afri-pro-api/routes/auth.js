const router  = require('express').Router();
const pool    = require('../db');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { identifiant, mot_de_passe } = req.body;
  if (!identifiant || !mot_de_passe)
    return res.status(400).json({ error: 'Identifiant et mot de passe requis' });

  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE identifiant = $1 AND active = true',
      [identifiant]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Identifiant incorrect' });

    // Accepte le mot de passe en clair (démo) ou hashé bcrypt
    const valid =
      mot_de_passe === user.mot_de_passe ||
      (await bcrypt.compare(mot_de_passe, user.mot_de_passe));

    if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });

    const token = jwt.sign(
      { id: user.id, role: user.role, equipe: user.equipe, nom: user.nom },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id:       user.id,
        nom:      user.nom,
        prenom:   user.prenom,
        role:     user.role,
        equipe:   user.equipe,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nom, prenom, role, equipe, objectif_mensuel FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
