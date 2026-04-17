-- =============================================================================
--  AfriPro — Schema SQL COMPLET ET MISE À JOUR (avec hiérarchie)
--  Compatible backend users.js + support 'chef_agence' et 'chef'
--  Exécutez ce fichier pour recréer/mettre à jour votre DB
-- =============================================================================

-- ⚠️ BACKUP AVANT ! DROP toutes les tables
DROP TABLE IF EXISTS sessions          CASCADE;
DROP TABLE IF EXISTS objectifs         CASCADE;
DROP TABLE IF EXISTS offres_services   CASCADE;
DROP TABLE IF EXISTS ventes            CASCADE;
DROP TABLE IF EXISTS cotations         CASCADE;
DROP TABLE IF EXISTS prospections      CASCADE;
DROP TABLE IF EXISTS clients           CASCADE;
DROP TABLE IF EXISTS produits          CASCADE;
DROP TABLE IF EXISTS users             CASCADE;

-- =============================================================================
-- TABLE 1 : users (MISE À JOUR AVEC HIÉRARCHIE COMPLÈTE)
-- Compatible backend INSERT (10 colonnes)
-- =============================================================================
CREATE TABLE users (
  id                SERIAL       PRIMARY KEY,
  nom               VARCHAR(100) NOT NULL,
  prenom            VARCHAR(100),
  identifiant       VARCHAR(50)  UNIQUE NOT NULL,
  mot_de_passe      VARCHAR(255) NOT NULL,
  role              VARCHAR(20)  NOT NULL
                  CHECK (role IN (
                    'commercial',
                    'manager_adjoint', 
                    'manager',
                    'chef_agence',
                    'chef',           -- ← AJOUTÉ pour frontend
                    'admin'
                  )),
  equipe            VARCHAR(10),
  objectif_mensuel  DECIMAL(15,2) DEFAULT 500000,
  manager_id        INTEGER      REFERENCES users(id) ON DELETE SET NULL,  -- ← NOUVEAU
  manager_adjoint_id INTEGER     REFERENCES users(id) ON DELETE SET NULL,  -- ← NOUVEAU  
  parent_id         INTEGER      REFERENCES users(id) ON DELETE SET NULL,  -- ← NOUVEAU
  actif             BOOLEAN      DEFAULT true,
  created_at        TIMESTAMP    DEFAULT NOW(),
  updated_at        TIMESTAMP    DEFAULT NOW()
);

-- Indexes hiérarchie
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_identifiant ON users(identifiant);
CREATE INDEX idx_users_actif ON users(actif);
CREATE INDEX idx_users_manager_id ON users(manager_id);
CREATE INDEX idx_users_manager_adjoint_id ON users(manager_adjoint_id);
CREATE INDEX idx_users_parent_id ON users(parent_id);

-- =============================================================================
-- TABLES RESTANTES (INCHANGÉES)
-- =============================================================================
CREATE TABLE clients (
  id            VARCHAR(10)  PRIMARY KEY,
  nom           VARCHAR(150) NOT NULL,
  telephone     VARCHAR(25),
  activite      VARCHAR(100),
  type_client   VARCHAR(20)  NOT NULL DEFAULT 'Tous'
                CHECK (type_client IN ('Particulier','PME','Entreprise','Autre','Tous')),
  email         VARCHAR(150),
  ville         VARCHAR(100),
  created_at    TIMESTAMP    DEFAULT NOW(),
  updated_at    TIMESTAMP    DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS client_seq START 1;
CREATE OR REPLACE FUNCTION generate_client_id() RETURNS TEXT AS $$
BEGIN
  RETURN 'CLI-' || LPAD(nextval('client_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE TABLE produits (
  id            SERIAL       PRIMARY KEY,
  nom           VARCHAR(150) UNIQUE NOT NULL,
  garantie_cotee VARCHAR(150),
  categorie     VARCHAR(50),
  type_client   VARCHAR(20)  DEFAULT 'Tous'
                CHECK (type_client IN ('Particulier','Corporate','Personnel','Tous')),
  actif         BOOLEAN      DEFAULT true,
  created_at    TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE prospections (
  id                      SERIAL       PRIMARY KEY,
  numero                  INT,
  commercial_id           INT          NOT NULL REFERENCES users(id),
  client_id               VARCHAR(10)  NOT NULL REFERENCES clients(id),
  date_prospection        DATE,
  risque_prospecte        VARCHAR(150),
  potentiel_ca            DECIMAL(15,2),
  chance_realisation      DECIMAL(3,1) CHECK (chance_realisation IN (0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0)),
  ancien_assureur         VARCHAR(100),
  date_effet_ancien       DATE,
  date_echeance_ancien    DATE,
  date_visite_1           DATE,
  date_visite_2           DATE,
  date_visite_3           DATE,
  date_relance            DATE,
  observations            TEXT,
  statut                  VARCHAR(30)  NOT NULL DEFAULT 'Premier contact'
                          CHECK (statut IN ('Premier contact','Relance 1','Relance 2','Cotation envoyée','En attente signature','Contrat conclu','Perdu')),
  created_at              TIMESTAMP    DEFAULT NOW(),
  updated_at              TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE cotations (
  id                SERIAL       PRIMARY KEY,
  numero            INT,
  prospection_id    INT          NOT NULL REFERENCES prospections(id) ON DELETE CASCADE,
  client_id         VARCHAR(10)  NOT NULL REFERENCES clients(id),
  commercial_id     INT          NOT NULL REFERENCES users(id),
  risque_cote       VARCHAR(100),
  date_cotation     DATE,
  montant           DECIMAL(15,2),
  date_validation   DATE,
  statut            VARCHAR(30)  NOT NULL DEFAULT 'En attente'
                    CHECK (statut IN ('En attente','Validée','Refusée','Convertie en vente')),
  created_at        TIMESTAMP    DEFAULT NOW(),
  updated_at        TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE ventes (
  id                SERIAL       PRIMARY KEY,
  numero            INT,
  prospection_id    INT          NOT NULL REFERENCES prospections(id) ON DELETE CASCADE,
  cotation_id       INT          REFERENCES cotations(id),
  client_id         VARCHAR(10)  NOT NULL REFERENCES clients(id),
  commercial_id     INT          NOT NULL REFERENCES users(id),
  produit_id        INT          REFERENCES produits(id),
  date_vente        DATE,
  type_vente        VARCHAR(10) CHECK (type_vente IN ('NouVe','VenRec')),
  produit           VARCHAR(150),
  no_police         VARCHAR(100),
  prime_nette       DECIMAL(15,2),
  accessoires       DECIMAL(15,2) DEFAULT 0,
  ca                DECIMAL(15,2) GENERATED ALWAYS AS (prime_nette + accessoires) STORED,
  no_attestation    VARCHAR(100),
  no_carte_rose     VARCHAR(100),
  date_effet        DATE,
  date_echeance     DATE,
  created_at        TIMESTAMP    DEFAULT NOW(),
  updated_at        TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE offres_services (
  id              SERIAL       PRIMARY KEY,
  numero          INT,
  prospection_id  INT          REFERENCES prospections(id),
  client_id       VARCHAR(10)  REFERENCES clients(id),
  commercial_id   INT          NOT NULL REFERENCES users(id),
  date_os         DATE,
  nom_entreprise  VARCHAR(200),
  contact         VARCHAR(100),
  email           VARCHAR(150),
  observations    TEXT,
  created_at      TIMESTAMP    DEFAULT NOW(),
  updated_at      TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE objectifs (
  id                SERIAL       PRIMARY KEY,
  commercial_id     INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mois              DATE         NOT NULL,
  montant_mensuel   DECIMAL(15,2) NOT NULL DEFAULT 500000,
  montant_reporte   DECIMAL(15,2) DEFAULT 0,
  created_at        TIMESTAMP    DEFAULT NOW(),
  updated_at        TIMESTAMP    DEFAULT NOW(),
  UNIQUE (commercial_id, mois)
);

CREATE TABLE sessions (
  id          SERIAL       PRIMARY KEY,
  user_id     INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       VARCHAR(500) NOT NULL UNIQUE,
  expires_at  TIMESTAMP    NOT NULL,
  created_at  TIMESTAMP    DEFAULT NOW()
);

-- =============================================================================
-- TRIGGERS updated_at (toutes les tables)
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_prospections_updated_at BEFORE UPDATE ON prospections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_cotations_updated_at BEFORE UPDATE ON cotations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_ventes_updated_at BEFORE UPDATE ON ventes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_offres_services_updated_at BEFORE UPDATE ON offres_services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_objectifs_updated_at BEFORE UPDATE ON objectifs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- DONNÉES DE TEST (ADMIN + HIÉRARCHIE)
-- =============================================================================
INSERT INTO users (nom, prenom, identifiant, mot_de_passe, role, objectif_mensuel) VALUES
('Admin', 'Super', 'admin', '$2a$10$...', 'admin', 0),
('Chef', 'Agence', 'chef.agence', '$2a$10$...', 'chef_agence', 5000000),
('Manager', 'Principal', 'manager1', '$2a$10$...', 'manager', 2000000),
('Manager', 'Adjoint', 'manager.adj', '$2a$10$...', 'manager_adjoint', 1000000),
('Commercial', 'Test', 'commercial1', '$2a$10$...', 'commercial', 800000);

-- Mettre à jour hiérarchie
UPDATE users SET manager_id = 2 WHERE role = 'manager';  -- Manager sous Chef
UPDATE users SET manager_adjoint_id = 4 WHERE role = 'commercial';  -- Commercial sous Manager Adjoint
UPDATE users SET parent_id = 2 WHERE identifiant = 'manager1';  -- parent_id aussi

-- Insert produits, clients, etc. (même que schema original)
INSERT INTO produits (nom, categorie, type_client) VALUES 
('Test Produit', 'Vie', 'Particulier');

-- =============================================================================
-- VUES + FONCTIONS (abrégées)
-- =============================================================================
-- Toutes les vues originales + v_users_hierarchy pour backend
CREATE OR REPLACE VIEW v_users_hierarchy AS
SELECT 
  u.*,
  m.nom as manager_nom,
  ma.nom as manager_adjoint_nom,
  p.nom as parent_nom
FROM users u
LEFT JOIN users m ON u.manager_id = m.id
LEFT JOIN users ma ON u.manager_adjoint_id = ma.id  
LEFT JOIN users p ON u.parent_id = p.id;

-- Vérification finale
SELECT table_name, COUNT(*) as nb_lignes FROM (
  SELECT 'users' as table_name, COUNT(*) FROM users UNION ALL
  SELECT 'clients', COUNT(*) FROM clients UNION ALL
  SELECT 'produits', COUNT(*) FROM produits
) t GROUP BY table_name ORDER BY table_name;

SELECT * FROM v_users_hierarchy ORDER BY role, nom;

