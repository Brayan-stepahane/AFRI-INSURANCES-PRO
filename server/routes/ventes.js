const router = require('express').Router();
const pool   = require('../db');
const auth   = require('../middleware/auth');
const { isManagerAdjointRole, buildHierarchyFilter } = require('../utils/hierarchy');

// GET /api/ventes
router.get('/', auth, async (req, res) => {
  try {
    const { mois } = req.query;
    let query = `
      SELECT v.*, cl.nom AS client_nom, u.nom AS commercial_nom,
             COALESCE(p.nom, v.produit) AS produit_nom
      FROM ventes v
      JOIN clients cl ON v.client_id = cl.id
      JOIN users u ON v.commercial_id = u.id
      LEFT JOIN produits p ON v.produit_id = p.id
      WHERE COALESCE(v.active::text, 'true') IN ('t','true','1')`;
    const params = [];

    // Admin has access to all ventes
    if (req.user.role !== 'admin') {
      if (req.user.role === 'commercial') {
        params.push(req.user.id);
        query += ` AND v.commercial_id = $${params.length}`;
      } else if (isManagerAdjointRole(req.user.role)) {
        params.push(req.user.id);
        query += ` AND u.parent_id = $${params.length}`;
      } else if (req.user.role === 'manager' || req.user.role === 'chef_agence') {
        params.push(req.user.id);
        query += ` AND ${buildHierarchyFilter('u', params.length)}`;
      }
    }
    if (mois) {
      params.push(mois); // format: 2026-03
      query += ` AND TO_CHAR(v.date_vente, 'YYYY-MM') = $${params.length}`;
    }
    query += ' ORDER BY v.date_vente DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/ventes
router.post('/', auth, async (req, res) => {
  const {
    prospection_id, cotation_id, client_id,
    date_vente, type_vente, produit, produit_id,
    no_police, numero_police, no_attestation, numero_attestation,
    prime_nette, accessoires, no_carte_rose, date_effet, date_echeance
  } = req.body;
  const commercial_id = req.user.role === 'commercial' ? req.user.id : req.body.commercial_id;

  // Handle both naming conventions
  const finalNoPolice = no_police || numero_police;
  const finalNoAttestation = no_attestation || numero_attestation;

  try {
    console.log('Creating vente with data:', {
      prospection_id, cotation_id, client_id, commercial_id,
      date_vente, type_vente, produit, produit_id,
      prime_nette, accessoires
    });
    // If converting from cotation and no prospection_id provided, get it from cotation
    let prospId = prospection_id;
    let produitVal = produit;
    let produitIdVal = produit_id;
    
    if (cotation_id && !prospection_id) {
      const cotRes = await pool.query(
        `SELECT prospection_id, risque_cote FROM cotations WHERE id=$1`,
        [cotation_id]
      );
      if (cotRes.rows[0]) {
        prospId = cotRes.rows[0].prospection_id;
        produitVal = produitVal || cotRes.rows[0].risque_cote;
      }
    }

    // If produit_id provided but no produit string, fetch product name
    if (produitIdVal && !produitVal) {
      const prod = await pool.query(
        `SELECT nom FROM produits WHERE id=$1`,
        [produitIdVal]
      );
      if (prod.rows[0]) {
        produitVal = prod.rows[0].nom;
      }
    }

    // If produit name is provided but produit_id is missing, resolve it from the produits lookup table.
    if (!produitIdVal && produitVal) {
      const prod = await pool.query(
        `SELECT id, nom FROM produits WHERE LOWER(TRIM(nom)) = LOWER(TRIM($1)) LIMIT 1`,
        [produitVal]
      );
      if (prod.rows[0]) {
        produitIdVal = prod.rows[0].id;
        produitVal = prod.rows[0].nom;
      }
    }

    // Required validations before database insert
    if (!prospId) {
      return res.status(400).json({ error: 'prospection_id est requis' });
    }
    if (!client_id) {
      return res.status(400).json({ error: 'client_id est requis' });
    }
    if (!commercial_id) {
      return res.status(400).json({ error: 'commercial_id est requis' });
    }
    if (!date_vente) {
      return res.status(400).json({ error: 'date_vente est requis' });
    }
    if (!type_vente) {
      return res.status(400).json({ error: 'type_vente est requis' });
    }
    if (type_vente && !['NouVe', 'VenRec'].includes(type_vente)) {
      return res.status(400).json({ error: 'type_vente invalide' });
    }

    const { rows } = await pool.query(
      `INSERT INTO ventes
        (prospection_id, cotation_id, client_id, commercial_id, date_vente,
         type_vente, produit, produit_id, no_police, prime_nette, accessoires, no_attestation,
         no_carte_rose, date_effet, date_echeance)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [prospId, cotation_id, client_id, commercial_id, date_vente,
       type_vente, produitVal, produitIdVal, finalNoPolice, prime_nette || 0, accessoires || 0,
       finalNoAttestation, no_carte_rose || null, date_effet || null, date_echeance || null]
    );

    // Mettre à jour la prospection et la cotation
    if (prospId) {
      await pool.query(
        `UPDATE prospections SET statut='Contrat conclu', updated_at=NOW() WHERE id=$1`,
        [prospId]
      );
    }
    if (cotation_id) {
      // Update the cotation status to 'Convertie en vente' instead of deleting
      // This maintains referential integrity since ventes.cotation_id references cotations(id)
      await pool.query(
        `UPDATE cotations SET statut='Convertie en vente', updated_at=NOW() WHERE id=$1`,
        [cotation_id]
      );
    }
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error('Failed to create vente:', e.message, { body: req.body });
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/ventes/:id
router.put('/:id', auth, async (req, res) => {
  const {
    produit, produit_id, date_vente, dateVente, type_vente, typeVente,
    no_police, numero_police, noPolice, prime_nette, primeNette,
    accessoires, no_attestation, numero_attestation, no_carte_rose, noCarteRose,
    date_effet, dateEffet, date_echeance, dateEcheance
  } = req.body;

  const finalDateVente = date_vente || dateVente;
  const finalTypeVente = type_vente || typeVente;
  const finalNoPolice = no_police || numero_police || noPolice;
  const finalPrimeNette = prime_nette || primeNette;
  const finalNoAttestation = no_attestation || numero_attestation;
  const finalNoCarteRose = no_carte_rose || noCarteRose;
  const finalDateEffet = date_effet || dateEffet;
  const finalDateEcheance = date_echeance || dateEcheance;

  try {
    let produitVal = produit;
    let produitIdVal = produit_id;

    // If produit_id provided but no produit string, fetch product name
    if (produitIdVal && !produitVal) {
      const prod = await pool.query(
        `SELECT nom FROM produits WHERE id=$1`,
        [produitIdVal]
      );
      if (prod.rows[0]) {
        produitVal = prod.rows[0].nom;
      }
    }

    // If produit name is provided but produit_id is missing, resolve it from the produits lookup table.
    if (!produitIdVal && produitVal) {
      const prod = await pool.query(
        `SELECT id, nom FROM produits WHERE LOWER(TRIM(nom)) = LOWER(TRIM($1)) LIMIT 1`,
        [produitVal]
      );
      if (prod.rows[0]) {
        produitIdVal = prod.rows[0].id;
        produitVal = prod.rows[0].nom;
      }
    }

    const { rows } = await pool.query(
      `UPDATE ventes SET produit=$1, produit_id=$2, date_vente=$3, type_vente=$4, no_police=$5,
       prime_nette=$6, accessoires=$7, no_attestation=$8, no_carte_rose=$9,
       date_effet=$10, date_echeance=$11, updated_at=NOW()
       WHERE id=$12 RETURNING *`,
      [produitVal, produitIdVal, finalDateVente, finalTypeVente, finalNoPolice, finalPrimeNette || 0, 
       accessoires || 0, finalNoAttestation, finalNoCarteRose, finalDateEffet, finalDateEcheance, 
       req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Vente introuvable' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/ventes/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE ventes SET active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Vente introuvable' });
    res.json({ message: 'Vente désactivée' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
