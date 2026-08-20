const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const { buildHierarchySubquery } = require('../utils/hierarchy');

async function upsertCommercialObjective(commercialId, mois, vie, nonVie) {
  const existingObj = await pool.query(
    'SELECT id FROM objectifs WHERE commercial_id = $1 AND mois = $2::date',
    [commercialId, mois]
  );

  const objectifData = {
    commercial_id: commercialId,
    mois,
    montant_mensuel: vie + nonVie,
    montant_mensuel_vie: vie,
    montant_mensuel_non_vie: nonVie,
    montant_reporte: 0,
    montant_reporte_vie: 0,
    montant_reporte_non_vie: 0,
  };

  if (existingObj.rows.length > 0) {
    await pool.query(
      `UPDATE objectifs SET
        montant_mensuel = $1,
        montant_mensuel_vie = $2,
        montant_mensuel_non_vie = $3,
        montant_reporte = $4,
        montant_reporte_vie = $5,
        montant_reporte_non_vie = $6,
        updated_at = NOW()
       WHERE id = $7`,
      [
        objectifData.montant_mensuel,
        objectifData.montant_mensuel_vie,
        objectifData.montant_mensuel_non_vie,
        objectifData.montant_reporte,
        objectifData.montant_reporte_vie,
        objectifData.montant_reporte_non_vie,
        existingObj.rows[0].id,
      ]
    );
  } else {
    await pool.query(
      `INSERT INTO objectifs (
        commercial_id, mois, montant_mensuel, montant_mensuel_vie,
        montant_mensuel_non_vie, montant_reporte, montant_reporte_vie, montant_reporte_non_vie
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        objectifData.commercial_id,
        objectifData.mois,
        objectifData.montant_mensuel,
        objectifData.montant_mensuel_vie,
        objectifData.montant_mensuel_non_vie,
        objectifData.montant_reporte,
        objectifData.montant_reporte_vie,
        objectifData.montant_reporte_non_vie,
      ]
    );
  }

  return objectifData;
}

// POST /api/objectifs/allocate - Allocate objectives at manager level
router.post('/allocate', auth, async (req, res) => {
  try {
    const { managerId, totalVie, totalNonVie, mois } = req.body;

    if (!managerId || totalVie === undefined || totalNonVie === undefined || !mois) {
      return res.status(400).json({ error: 'managerId, totalVie, totalNonVie, and mois are required' });
    }

    const user = req.user;
    if (user.role !== 'admin' && user.role !== 'manager') {
      return res.status(403).json({ error: 'Only admin or manager can allocate objectives' });
    }

    if (user.role === 'manager' && user.id !== Number(managerId)) {
      return res.status(403).json({ error: 'Les managers ne peuvent allouer que leurs propres objectifs' });
    }

    const managerResult = await pool.query(
      'SELECT id, role, nom FROM users WHERE id = $1 AND active = true',
      [managerId]
    );

    if (managerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    const manager = managerResult.rows[0];
    if (manager.role !== 'manager') {
      return res.status(400).json({ error: 'Selected user must be a manager' });
    }

    const allocations = [];

    const commercialsResult = await pool.query(
      `SELECT id, nom FROM users WHERE role = 'commercial' AND active = true AND id IN (${buildHierarchySubquery(1)})`,
      [managerId]
    );

    const commercials = commercialsResult.rows;
    if (commercials.length === 0) {
      return res.status(400).json({ error: 'Aucun commercial actif trouvé sous ce manager' });
    }

    const perCommercialVie = totalVie / commercials.length;
    const perCommercialNonVie = totalNonVie / commercials.length;

    for (const commercial of commercials) {
      const objectifData = await upsertCommercialObjective(
        commercial.id,
        mois,
        perCommercialVie,
        perCommercialNonVie
      );

      allocations.push({
        commercial: commercial.nom,
        montant_mensuel: objectifData.montant_mensuel,
        montant_mensuel_vie: objectifData.montant_mensuel_vie,
        montant_mensuel_non_vie: objectifData.montant_mensuel_non_vie,
      });
    }

    res.json({
      success: true,
      message: `Objectives allocated successfully for ${allocations.length} commercials`,
      allocations,
      summary: {
        total_vie: totalVie,
        total_non_vie: totalNonVie,
        target_role: manager.role,
        total_commercials: allocations.length,
      },
    });
  } catch (error) {
    console.error('Allocation error:', error);
    res.status(500).json({ error: 'Failed to allocate objectives: ' + error.message });
  }
});

module.exports = router;
