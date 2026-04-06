require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/clients',      require('./routes/clients'));
app.use('/api/prospections', require('./routes/prospections'));
app.use('/api/cotations',    require('./routes/cotations'));
app.use('/api/ventes',       require('./routes/ventes'));
app.use('/api/dashboard',    require('./routes/dashboard'));
app.use('/api/users',        require('./routes/users'));

// Health check
app.get('/health', async (req, res) => {
  const pool = require('./db');
  try {
    const { rows } = await pool.query('SELECT COUNT(*) FROM clients');
    res.json({ ok: true, clients: rows[0].count });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API AfriPro démarrée sur le port ${PORT}`));
