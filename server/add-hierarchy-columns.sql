-- Add hierarchy FKs to users
ALTER TABLE users ADD COLUMN manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN manager_adjoint_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Update API GET users to include FKs
-- Backend routes/users.js already ready for validation

