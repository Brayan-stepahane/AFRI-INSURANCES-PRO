-- ==========================================
-- Migration: Drop old hierarchy columns
-- ==========================================
-- Since we consolidated to parent_id, drop the old manager_id and manager_adjoint_id columns

BEGIN;

-- Drop the old columns
ALTER TABLE users DROP COLUMN IF EXISTS manager_id;
ALTER TABLE users DROP COLUMN IF EXISTS manager_adjoint_id;

COMMIT;