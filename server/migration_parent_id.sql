-- ==========================================
-- Migration: Consolidate hierarchy to parent_id
-- ==========================================
-- This migration consolidates manager_id and manager_adjoint_id into parent_id
-- For users who have both, parent_id takes priority (prefer explicit parent_id over old fields)

BEGIN;

-- Step 1: Update parent_id from manager_id where parent_id is NULL
UPDATE users
SET parent_id = manager_id
WHERE parent_id IS NULL AND manager_id IS NOT NULL;

-- Step 2: Update parent_id from manager_adjoint_id where parent_id is still NULL
UPDATE users
SET parent_id = manager_adjoint_id
WHERE parent_id IS NULL AND manager_adjoint_id IS NOT NULL;

-- Step 3: Clear old fields (optional - comment out if you want to keep for reference)
-- UPDATE users SET manager_id = NULL WHERE manager_id IS NOT NULL;
-- UPDATE users SET manager_adjoint_id = NULL WHERE manager_adjoint_id IS NOT NULL;

-- Verify the migration
SELECT 
  id, 
  nom, 
  prenom,
  role,
  manager_id,
  manager_adjoint_id,
  parent_id
FROM users
WHERE parent_id IS NOT NULL OR manager_id IS NOT NULL OR manager_adjoint_id IS NOT NULL
ORDER BY id;

COMMIT;
