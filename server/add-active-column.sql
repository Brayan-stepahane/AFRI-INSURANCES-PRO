-- Add active column to prospections table if it doesn't exist
-- This column allows soft deletion instead of hard deletion

ALTER TABLE prospections
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_prospections_active ON prospections(active);

-- Update existing records to be active (in case column was added later)
UPDATE prospections SET active = true WHERE active IS NULL;