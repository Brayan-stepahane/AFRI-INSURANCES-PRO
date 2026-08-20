const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'Token manquant' });

  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Format invalide' });

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    req.user = jwt.verify(token, secret);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};
