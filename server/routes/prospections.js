const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');

// GET /api/prospections  (filtre par rôle automatiquement)
router.get('/', auth, async (req, res) => {
  try {
    const { statut, commercial_id } = req.query;
    const user = req.user;

    let query = `
      SELECT
        p.*,
        c.nom as client_nom,
        u.nom as commercial_nom,
        u.equipe,
        CASE WHEN p.active IS NULL THEN true ELSE p.active END as active
      FROM prospections p
      JOIN clients c ON p.client_id = c.id
      JOIN users u ON p.commercial_id = u.id
      WHERE (p.active IS NULL OR p.active = true)
    `;
    const params = [];

    // Un commercial ne voit que ses propres prospections
    if (user.role === 'commercial') {
      params.push(user.id);
      query += ` AND p.commercial_id = $${params.length}`;
    } else if (user.role === 'manager_adj' || user.role === 'manager_adjoint') {
      // Voit son équipe
      params.push(user.equipe);
      query += ` AND u.equipe = $${params.length}`;
    }
    // manager, chef_agence, admin voient tout

    if (statut) {
      params.push(statut);
      query += ` AND p.statut = $${params.length}`;
    }
    if (commercial_id && user.role !== 'commercial') {
      params.push(commercial_id);
      query += ` AND p.commercial_id = $${params.length}`;
    }

    query += ' ORDER BY p.date_prospection DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/prospections/relances  (relances urgentes)
router.get('/relances', auth, async (req, res) => {
  try {
    let query = 'SELECT * FROM v_relances_urgentes WHERE (active IS NULL OR active = true)';
    const params = [];

    if (req.user.role === 'commercial') {
      params.push(req.user.id);
      query += ` AND commercial_id = $${params.length}`;
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/prospections/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         p.*, c.id AS client_id, c.nom AS client_nom, c.telephone AS client_tel,
         c.type_client, c.activite AS client_activite,
         u.id AS commercial_id, u.nom AS commercial_nom, u.equipe,
         cot.id AS cotation_id, cot.risque_cote, cot.date_cotation, cot.montant AS cotation_montant,
         cot.date_validation, cot.statut AS cotation_statut,
         v.id AS vente_id, v.produit AS vente_produit, v.prime_nette, v.accessoires,
         v.ca, v.date_vente, v.type_vente, v.no_police, v.no_attestation,
         v.no_carte_rose, v.date_effet, v.date_echeance
       FROM prospections p
       JOIN clients c ON p.client_id = c.id
       JOIN users u ON p.commercial_id = u.id
       LEFT JOIN cotations cot ON cot.prospection_id = p.id
       LEFT JOIN ventes v ON v.prospection_id = p.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Prospection introuvable' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/prospections
router.post('/', auth, async (req, res) => {
  if (req.user.role === 'admin') {
    return res.status(403).json({ error: 'Administrateur non autorisé à créer une prospection' });
  }

  const {
    clientName, phone, clientType, activity,
    prospectionDate, product, potentialCA, status, probability,
    visitDate1, nextFollowUp, visitDate2, visitDate3,
    previousInsurer, previousContract, observations,
    ratedRisk, quotationDate, quotationAmount, validationDate,
    saleDate, saleType, policyNumber, attestationNumber,
    netPremiums, accessories, effectDate, expiryDate, carRoseNumber
  } = req.body;

  const commercial_id = req.user.role === 'commercial' ? req.user.id : req.body.commercial_id;

  try {
    // Validate required fields
    if (!clientName || !clientName.trim()) {
      return res.status(400).json({ error: 'Le nom du client est requis' });
    }
    if (!prospectionDate) {
      return res.status(400).json({ error: 'La date de prospection est requise' });
    }
    if (!product) {
      return res.status(400).json({ error: 'Le produit/risque est requis' });
    }

    // Validate clientType
    const validClientTypes = ['Particulier', 'PME', 'Entreprise', 'Autre'];
    if (clientType && !validClientTypes.includes(clientType)) {
      return res.status(400).json({ error: `Type de client invalide. Valeurs autorisées: ${validClientTypes.join(', ')}` });
    }

    // Call the insert_new_prospection function
    const { rows } = await pool.query(
      `SELECT insert_new_prospection(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, $25, $26, $27, $28,
        $29, $30
      ) AS prospection_id`,
      [
        clientName, phone, clientType, activity,
        commercial_id, prospectionDate, product, potentialCA, status, probability,
        visitDate1, visitDate2, visitDate3, nextFollowUp,
        previousInsurer, previousContract, observations,
        ratedRisk, quotationDate, quotationAmount, validationDate,
        saleDate, saleType, policyNumber, attestationNumber,
        netPremiums, accessories, effectDate, expiryDate, carRoseNumber
      ]
    );

    if (!rows || !rows[0]) {
      return res.status(500).json({ error: 'Erreur lors de la création de la prospection' });
    }

    const prospection_id = rows[0].prospection_id;

    // Fetch the created prospection with full details
    const { rows: prospectionRows } = await pool.query(
      'SELECT * FROM v_prospections WHERE id = $1', [prospection_id]
    );

    res.status(201).json(prospectionRows[0] || { id: prospection_id });
  } catch (e) {
    console.error('Error creating prospection:', e.message, e.code);
    res.status(500).json({ 
      error: `Failed to create prospection: ${e.message}`,
      details: e.code
    });
  }
});

// PUT /api/prospections/:id
router.put('/:id', auth, async (req, res) => {
  const {
    clientId, product, prospectionDate, potentialCA, probability, status,
    visitDate1, visitDate2, visitDate3, nextFollowUp, observations,
    previousInsurer, previousContract
  } = req.body;
  try {
    // Round probability to 1 decimal place and ensure it's within valid range
    const roundedProbability = Math.max(0.1, Math.min(1.0, Math.round(probability * 10) / 10));

    const { rows } = await pool.query(
      `UPDATE prospections SET
        client_id=$1, risque_prospecte=$2, date_prospection=$3, potentiel_ca=$4,
        chance_realisation=$5, statut=$6, date_visite_1=$7, date_visite_2=$8,
        date_visite_3=$9, date_relance=$10, observations=$11,
        ancien_assureur=$12, date_effet_ancien=$13, updated_at=NOW()
       WHERE id=$14 RETURNING *`,
      [clientId, product, prospectionDate, potentialCA, roundedProbability, status,
       visitDate1, visitDate2, visitDate3, nextFollowUp, observations,
       previousInsurer, previousContract, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Prospection introuvable' });
    res.json(rows[0]);
  } catch (e) {
    console.error('Error updating prospection:', e.message, e.code);
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/prospections/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE prospections SET active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Prospection introuvable' });
    res.json({ message: 'Prospection désactivée' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
