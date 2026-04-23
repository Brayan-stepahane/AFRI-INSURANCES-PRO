const pool = require('../db');

function isManagerAdjointRole(role) {
  return role === 'manager_adjoint';
}

function buildHierarchySubquery(paramIndex = 1) {
  return `
    WITH RECURSIVE descendants AS (
      SELECT id FROM users WHERE id = $${paramIndex}
      UNION ALL
      SELECT u2.id
      FROM users u2
      JOIN descendants d ON u2.parent_id = d.id
    )
    SELECT id FROM descendants
  `;
}

function buildHierarchyFilter(alias = 'u', paramIndex = 1) {
  return `${alias}.id IN (${buildHierarchySubquery(paramIndex)})`;
}

module.exports = {
  isManagerAdjointRole,
  buildHierarchyFilter,
  buildHierarchySubquery,
};
