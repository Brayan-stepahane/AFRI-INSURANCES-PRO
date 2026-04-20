-- ==========================================
-- AFRI-PRO Database Schema
-- ==========================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- SEQUENCES
-- ==========================================

CREATE SEQUENCE IF NOT EXISTS client_seq START 1;

-- ==========================================
-- USERS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  identifiant VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100),
  mot_de_passe VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'chef_agence', 'manager', 'manager_adjoint', 'commercial')),
  equipe VARCHAR(100),
  objectif_mensuel DECIMAL(12, 2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  parent_id INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ==========================================
-- CLIENTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR(20) PRIMARY KEY,
  nom VARCHAR(200) NOT NULL,
  telephone VARCHAR(20),
  activite VARCHAR(100),
  type_client VARCHAR(50) CHECK (type_client IN ('Particulier', 'PME', 'Entreprise', 'Autre')),
  email VARCHAR(100),
  ville VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- PRODUITS TABLE (Reference Table)
-- ==========================================

CREATE TABLE IF NOT EXISTS produits (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ==========================================
-- PROSPECTIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS prospections (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(20) NOT NULL,
  commercial_id INT NOT NULL,
  date_prospection DATE,
  risque_prospecte VARCHAR(200),
  potentiel_ca DECIMAL(12, 2),
  chance_realisation DECIMAL(3, 1),
  statut VARCHAR(50) CHECK (statut IN (
    'Premier contact', 'Relance 1', 'Relance 2', 'Cotation envoyée',
    'En attente signature', 'Contrat conclu', 'Perdu'
  )),
  date_visite_1 DATE,
  date_visite_2 DATE,
  date_visite_3 DATE,
  date_suivi_prevu DATE,
  ancien_assureur VARCHAR(100),
  date_ancienne_couverture DATE,
  observations TEXT,
  date_cotation DATE,
  montant_cotation DECIMAL(12, 2),
  date_validation_cotation DATE,
  date_vente DATE,
  type_vente VARCHAR(20) CHECK (type_vente IN ('NouVe', 'VenRec')),
  no_police VARCHAR(50),
  no_attestation VARCHAR(50),
  prime_nette DECIMAL(12, 2),
  accessoires DECIMAL(12, 2),
  date_effet DATE,
  date_echeance DATE,
  no_carte_rose VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (commercial_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- COTATIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS cotations (
  id SERIAL PRIMARY KEY,
  prospection_id INT,
  client_id VARCHAR(20) NOT NULL,
  commercial_id INT NOT NULL,
  risque_cote VARCHAR(200),
  date_cotation DATE,
  montant DECIMAL(12, 2),
  date_validation DATE,
  statut VARCHAR(50) CHECK (statut IN ('En cours', 'Validée', 'Convertie en vente', 'Annulée')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (prospection_id) REFERENCES prospections(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (commercial_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- VENTES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS ventes (
  id SERIAL PRIMARY KEY,
  prospection_id INT,
  cotation_id INT,
  client_id VARCHAR(20) NOT NULL,
  commercial_id INT NOT NULL,
  date_vente DATE,
  type_vente VARCHAR(20) CHECK (type_vente IN ('NouVe', 'VenRec')),
  produit VARCHAR(200),
  produit_id INT,
  no_police VARCHAR(50),
  no_attestation VARCHAR(50),
  prime_nette DECIMAL(12, 2) DEFAULT 0,
  accessoires DECIMAL(12, 2) DEFAULT 0,
  ca DECIMAL(12, 2) GENERATED ALWAYS AS (prime_nette + accessoires) STORED,
  no_carte_rose VARCHAR(50),
  date_effet DATE,
  date_echeance DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (prospection_id) REFERENCES prospections(id) ON DELETE SET NULL,
  FOREIGN KEY (cotation_id) REFERENCES cotations(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (commercial_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE SET NULL
);

-- ==========================================
-- OBJECTIFS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS objectifs (
  id SERIAL PRIMARY KEY,
  commercial_id INT NOT NULL,
  mois DATE NOT NULL,
  montant_mensuel DECIMAL(12, 2),
  montant_reporte DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(commercial_id, mois),
  FOREIGN KEY (commercial_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- VIEWS
-- ==========================================

-- View: CA mensuel par commercial
CREATE OR REPLACE VIEW v_ca_mensuel AS
SELECT
  DATE_TRUNC('month', v.date_vente)::DATE AS mois,
  v.commercial_id,
  u.nom AS commercial_nom,
  SUM(v.ca) AS ca_total,
  COUNT(*) AS nb_ventes
FROM ventes v
JOIN users u ON v.commercial_id = u.id
WHERE COALESCE(v.active::text, 'true') IN ('t','true','1')
GROUP BY DATE_TRUNC('month', v.date_vente), v.commercial_id, u.nom;

-- View: Objectifs réalisés
CREATE OR REPLACE VIEW v_objectifs_realises AS
SELECT
  COALESCE(o.id, 0) AS id,
  u.id AS commercial_id,
  u.nom AS commercial_nom,
  COALESCE(o.mois, DATE_TRUNC('month', CURRENT_DATE)::DATE) AS mois,
  COALESCE(o.montant_mensuel, u.objectif_mensuel, 0) AS montant_mensuel,
  COALESCE(o.montant_reporte, 0) AS montant_reporte,
  COALESCE(o.montant_mensuel, u.objectif_mensuel, 0) + COALESCE(o.montant_reporte, 0) AS total_objectif,
  COALESCE(v.ca_realise, 0) AS ca_realise,
  GREATEST(0, COALESCE(o.montant_mensuel, u.objectif_mensuel, 0) + COALESCE(o.montant_reporte, 0) - COALESCE(v.ca_realise, 0)) AS montant_restant,
  CASE
    WHEN COALESCE(o.montant_mensuel, u.objectif_mensuel, 0) + COALESCE(o.montant_reporte, 0) = 0 THEN 0
    ELSE LEAST(100, ROUND(COALESCE(v.ca_realise, 0) / (COALESCE(o.montant_mensuel, u.objectif_mensuel, 0) + COALESCE(o.montant_reporte, 0)) * 100, 1))
  END AS pct_atteint
FROM users u
LEFT JOIN objectifs o ON o.commercial_id = u.id AND DATE_TRUNC('month', o.mois) = DATE_TRUNC('month', CURRENT_DATE)
LEFT JOIN (
  SELECT commercial_id, COALESCE(SUM(ca), 0) AS ca_realise
  FROM ventes
  WHERE DATE_TRUNC('month', date_vente) = DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY commercial_id
) v ON v.commercial_id = u.id
WHERE u.role = 'commercial';

-- View: Relances urgentes (prospections en retard)
CREATE OR REPLACE VIEW v_relances_urgentes AS
SELECT
  p.id,
  p.client_id,
  c.nom AS client_nom,
  p.commercial_id,
  u.nom AS commercial_nom,
  p.statut,
  p.date_suivi_prevu,
  (CURRENT_DATE - p.date_suivi_prevu) AS jours_retard,
  p.active
FROM prospections p
JOIN clients c ON p.client_id = c.id
JOIN users u ON p.commercial_id = u.id
WHERE COALESCE(p.active::text, 'true') IN ('t','true','1')
  AND p.statut NOT IN ('Contrat conclu', 'Perdu')
  AND p.date_suivi_prevu IS NOT NULL
  AND p.date_suivi_prevu < CURRENT_DATE;

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_parent_id ON users(parent_id);
CREATE INDEX IF NOT EXISTS idx_users_manager_id ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_users_manager_adjoint_id ON users(manager_adjoint_id);

CREATE INDEX IF NOT EXISTS idx_clients_nom ON clients(nom);
CREATE INDEX IF NOT EXISTS idx_clients_type_client ON clients(type_client);

CREATE INDEX IF NOT EXISTS idx_prospections_commercial_id ON prospections(commercial_id);
CREATE INDEX IF NOT EXISTS idx_prospections_client_id ON prospections(client_id);
CREATE INDEX IF NOT EXISTS idx_prospections_statut ON prospections(statut);
CREATE INDEX IF NOT EXISTS idx_prospections_date_prospection ON prospections(date_prospection);

CREATE INDEX IF NOT EXISTS idx_cotations_commercial_id ON cotations(commercial_id);
CREATE INDEX IF NOT EXISTS idx_cotations_client_id ON cotations(client_id);
CREATE INDEX IF NOT EXISTS idx_cotations_prospection_id ON cotations(prospection_id);
CREATE INDEX IF NOT EXISTS idx_cotations_statut ON cotations(statut);

CREATE INDEX IF NOT EXISTS idx_ventes_commercial_id ON ventes(commercial_id);
CREATE INDEX IF NOT EXISTS idx_ventes_client_id ON ventes(client_id);
CREATE INDEX IF NOT EXISTS idx_ventes_prospection_id ON ventes(prospection_id);
CREATE INDEX IF NOT EXISTS idx_ventes_cotation_id ON ventes(cotation_id);
CREATE INDEX IF NOT EXISTS idx_ventes_date_vente ON ventes(date_vente);
CREATE INDEX IF NOT EXISTS idx_ventes_type_vente ON ventes(type_vente);

CREATE INDEX IF NOT EXISTS idx_objectifs_commercial_id ON objectifs(commercial_id);
CREATE INDEX IF NOT EXISTS idx_objectifs_mois ON objectifs(mois);
