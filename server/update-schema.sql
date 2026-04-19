-- =============================================================================
-- UPDATE SCHEMA - Ajout hiérarchie + compatibilité backend
-- Exécutez: psql -d afri-pro -f server/update-schema.sql
-- =============================================================================

-- 1. Ajouter colonnes hiérarchie (si pas déjà présentes)
ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS manager_adjoint_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- 2. Mettre à jour contrainte role (inclure 'chef' pour frontend)
DO $$ 
BEGIN
  -- Supprimer ancienne contrainte si existe
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
    ALTER TABLE users DROP CONSTRAINT users_role_check;
  END IF;
END $$;

ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('commercial','manager_adjoint','manager','chef_agence','chef','admin'));

-- 3. Indexes performance
CREATE INDEX IF NOT EXISTS idx_users_manager_id ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_manager_adjoint_id ON users(manager_adjoint_id);
CREATE INDEX IF NOT EXISTS idx_users_parent_id ON users(parent_id);

-- 4. Vérification
\d users | grep -E 'manager|parent|role|objectif'
SELECT role, COUNT(*) FROM users GROUP BY role;

-- 5. Test INSERT hiérarchie
-- INSERT INTO users (nom, prenom, identifiant, mot_de_passe, role, manager_id) 
-- VALUES ('Test Chef', 'T', 'testchef', 'hash', 'chef_agence', NULL) RETURNING *;

