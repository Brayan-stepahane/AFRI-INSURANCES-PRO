const pool = require('../db');

const MANAGER_ADJOINT_ROLES = ['manager_adj', 'manager_adjoint'];

function isManagerAdjointRole(role) {
  return MANAGER_ADJOINT_ROLES.includes(role);
}

function buildHierarchySubquery(paramIndex = 1) {
  return `
    WITH RECURSIVE descendants AS (
      SELECT id FROM users WHERE id = $${paramIndex}
      UNION ALL
      SELECT u2.id
      FROM users u2
      JOIN descendants d ON (
        u2.parent_id = d.id
        OR u2.manager_id = d.id
        OR u2.manager_adjoint_id = d.id
      )
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
