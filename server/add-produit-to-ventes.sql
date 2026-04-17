-- Add produit column to ventes table
-- This stores the product/risk that was sold for direct tracking
ALTER TABLE ventes 
ADD COLUMN IF NOT EXISTS produit VARCHAR(150);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_ventes_produit ON ventes(produit);

-- Add index on cotation_id for faster cotation-to-vente lookups
CREATE INDEX IF NOT EXISTS idx_ventes_cotation ON ventes(cotation_id);

-- Update existing ventes to populate produit from prospections
UPDATE ventes v
SET produit = p.risque_prospecte
FROM prospections p
WHERE v.prospection_id = p.id
AND v.produit IS NULL;

-- Output summary
SELECT 
  COUNT(*) as total_ventes,
  COUNT(DISTINCT client_id) as unique_clients,
  COUNT(DISTINCT commercial_id) as unique_commercials,
  MIN(date_vente) as first_sale,
  MAX(date_vente) as latest_sale,
  COUNT(CASE WHEN produit IS NOT NULL THEN 1 END) as ventes_with_produit
FROM ventes;
