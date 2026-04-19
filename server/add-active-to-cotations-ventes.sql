-- Add active column to cotations and ventes tables if they don't exist
-- This column allows soft deletion instead of hard deletion

ALTER TABLE cotations
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

ALTER TABLE ventes
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cotations_active ON cotations(active);
CREATE INDEX IF NOT EXISTS idx_ventes_active ON ventes(active);

-- Update existing records to be active (in case column was added later)
UPDATE cotations SET active = true WHERE active IS NULL;
UPDATE ventes SET active = true WHERE active IS NULL;