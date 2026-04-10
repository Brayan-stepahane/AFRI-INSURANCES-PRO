-- =============================================================================
--  AfriPro — Script SQL complet PostgreSQL
--  Basé sur le fichier Excel Prospections-ventes_Yannick.xlsx
--  9 tables avec données de référence complètes
--  Auteur : AfriPro / Afrilife Insurance
-- =============================================================================

-- Supprimer les tables si elles existent déjà (ordre inverse des dépendances)
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
-- TABLE 1 : users
-- Gère les 5 rôles hiérarchiques de l'application
-- =============================================================================
CREATE TABLE users (
  id            SERIAL       PRIMARY KEY,
  nom           VARCHAR(100) NOT NULL,
  prenom        VARCHAR(100),
  identifiant   VARCHAR(50)  UNIQUE NOT NULL,
  mot_de_passe  VARCHAR(255) NOT NULL,          -- bcrypt hash en production
  role          VARCHAR(20)  NOT NULL
                CHECK (role IN (
                  'commercial',
                  'manager_adjoint',
                  'manager',
                  'chef_agence',
                  'admin'
                )),
  equipe        VARCHAR(10),                    -- 'A', 'B', 'ALL'
  objectif_mensuel DECIMAL(15,2) DEFAULT 500000,
  actif         BOOLEAN      DEFAULT true,
  created_at    TIMESTAMP    DEFAULT NOW(),
  updated_at    TIMESTAMP    DEFAULT NOW()
);

-- Index
CREATE INDEX idx_users_role       ON users(role);
CREATE INDEX idx_users_identifiant ON users(identifiant);
CREATE INDEX idx_users_actif      ON users(actif);

-- =============================================================================
-- TABLE 2 : clients
-- ID unique CLI-XXXX — un client peut avoir plusieurs produits/prospections
-- =============================================================================
CREATE TABLE clients (
  id            VARCHAR(10)  PRIMARY KEY,       -- CLI-0001
  nom           VARCHAR(150) NOT NULL,
  telephone     VARCHAR(25),
  activite      VARCHAR(100),
  type_client   VARCHAR(20)  NOT NULL DEFAULT 'Particulier'
                CHECK (type_client IN ('Particulier','PME','Entreprise','Autre')),
  email         VARCHAR(150),
  ville         VARCHAR(100),
  created_at    TIMESTAMP    DEFAULT NOW(),
  updated_at    TIMESTAMP    DEFAULT NOW()
);

-- Index
CREATE INDEX idx_clients_nom         ON clients(nom);
CREATE INDEX idx_clients_telephone   ON clients(telephone);
CREATE INDEX idx_clients_type_client ON clients(type_client);

-- Séquence pour générer CLI-XXXX automatiquement
CREATE SEQUENCE client_seq START 1;

-- Fonction pour générer l'ID client automatiquement
CREATE OR REPLACE FUNCTION generate_client_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CLI-' || LPAD(nextval('client_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLE 3 : produits
-- Référentiel des risques/produits (feuille Synthèses du fichier Excel)
-- =============================================================================
CREATE TABLE produits (
  id            SERIAL       PRIMARY KEY,
  nom           VARCHAR(150) UNIQUE NOT NULL,
  garantie_cotee VARCHAR(150),                  -- Guaranties cotées
  categorie     VARCHAR(50),                    -- 'Vie', 'Non-vie', 'Caution'
  type_client   VARCHAR(20)  DEFAULT 'Tous'
                CHECK (type_client IN ('Particulier','Corporate','Personnel','Tous')),
  actif         BOOLEAN      DEFAULT true,
  created_at    TIMESTAMP    DEFAULT NOW()
);

-- Index
CREATE INDEX idx_produits_type ON produits(type_client);

-- =============================================================================
-- TABLE 4 : prospections
-- Colonnes N° → Observations du fichier Excel (section Prospections)
-- =============================================================================
CREATE TABLE prospections (
  id                      SERIAL       PRIMARY KEY,
  numero                  INT,                  -- N° dans le fichier Excel
  commercial_id           INT          NOT NULL REFERENCES users(id),
  client_id               VARCHAR(10)  NOT NULL REFERENCES clients(id),
  date_prospection        DATE,                 -- Dates de Prospections
  risque_prospecte        VARCHAR(150),          -- Risques de Prospections
  potentiel_ca            DECIMAL(15,2),         -- Potentiels chiffre d'affaires
  chance_realisation      DECIMAL(3,1)
                          CHECK (chance_realisation IN
                            (0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0)),
  ancien_assureur         VARCHAR(100),          -- Anciens assureurs
  date_effet_ancien       DATE,                  -- Date d'Effet ancien contrat
  date_echeance_ancien    DATE,                  -- Date d'échéances ancien contrat
  date_visite_1           DATE,                  -- Date Visite 1
  date_visite_2           DATE,                  -- Date Visite 2
  date_visite_3           DATE,                  -- Date Visite 3
  date_relance            DATE,                  -- Prochaine relance planifiée
  observations            TEXT,                  -- Observations
  statut                  VARCHAR(30)  NOT NULL DEFAULT 'Premier contact'
                          CHECK (statut IN (
                            'Premier contact',
                            'Relance 1',
                            'Relance 2',
                            'Cotation envoyée',
                            'En attente signature',
                            'Contrat conclu',
                            'Perdu'
                          )),
  created_at              TIMESTAMP    DEFAULT NOW(),
  updated_at              TIMESTAMP    DEFAULT NOW()
);

-- Index
CREATE INDEX idx_prosp_commercial    ON prospections(commercial_id);
CREATE INDEX idx_prosp_client        ON prospections(client_id);
CREATE INDEX idx_prosp_statut        ON prospections(statut);
CREATE INDEX idx_prosp_date_relance  ON prospections(date_relance);
CREATE INDEX idx_prosp_date_prosp    ON prospections(date_prospection);

-- =============================================================================
-- TABLE 5 : cotations
-- Colonnes N°2 → Date de validation du fichier Excel (section Cotations)
-- =============================================================================
CREATE TABLE cotations (
  id                SERIAL       PRIMARY KEY,
  numero            INT,                        -- N°2 dans le fichier Excel
  prospection_id    INT          NOT NULL REFERENCES prospections(id) ON DELETE CASCADE,
  client_id         VARCHAR(10)  NOT NULL REFERENCES clients(id),
  commercial_id     INT          NOT NULL REFERENCES users(id),
  risque_cote       VARCHAR(100),               -- Risques cotés
  date_cotation     DATE,                       -- Date de Cotation
  montant           DECIMAL(15,2),              -- Montant de la cotation
  date_validation   DATE,                       -- Date de validation de la cotation
  statut            VARCHAR(30)  NOT NULL DEFAULT 'En attente'
                    CHECK (statut IN (
                      'En attente',
                      'Validée',
                      'Refusée',
                      'Convertie en vente'
                    )),
  created_at        TIMESTAMP    DEFAULT NOW(),
  updated_at        TIMESTAMP    DEFAULT NOW()
);

-- Index
CREATE INDEX idx_cot_prospection  ON cotations(prospection_id);
CREATE INDEX idx_cot_commercial   ON cotations(commercial_id);
CREATE INDEX idx_cot_client       ON cotations(client_id);
CREATE INDEX idx_cot_statut       ON cotations(statut);
CREATE INDEX idx_cot_date         ON cotations(date_cotation);

-- =============================================================================
-- TABLE 6 : ventes
-- Colonnes N°3 → Dates D'échéances du fichier Excel (section Ventes)
-- =============================================================================
CREATE TABLE ventes (
  id                SERIAL       PRIMARY KEY,
  numero            INT,                        -- N°3 dans le fichier Excel
  prospection_id    INT          NOT NULL REFERENCES prospections(id) ON DELETE CASCADE,
  cotation_id       INT          REFERENCES cotations(id),
  client_id         VARCHAR(10)  NOT NULL REFERENCES clients(id),
  commercial_id     INT          NOT NULL REFERENCES users(id),
  date_vente        DATE,                       -- Dates de Vente
  type_vente        VARCHAR(10)
                    CHECK (type_vente IN ('NouVe','VenRec')),
  no_police         VARCHAR(100),               -- N° Police EXCEL/ORASS
  prime_nette       DECIMAL(15,2),              -- Primes Nettes
  accessoires       DECIMAL(15,2) DEFAULT 0,    -- Accessoires
  ca                DECIMAL(15,2)               -- CA (prime_nette + accessoires)
                    GENERATED ALWAYS AS (prime_nette + accessoires) STORED,
  no_attestation    VARCHAR(100),               -- Numero Attestations
  no_carte_rose     VARCHAR(100),               -- Numero Carte Rose
  date_effet        DATE,                       -- Dates d'effets
  date_echeance     DATE,                       -- Dates D'échéances
  created_at        TIMESTAMP    DEFAULT NOW(),
  updated_at        TIMESTAMP    DEFAULT NOW()
);

-- Index
CREATE INDEX idx_ventes_commercial   ON ventes(commercial_id);
CREATE INDEX idx_ventes_client       ON ventes(client_id);
CREATE INDEX idx_ventes_date_vente   ON ventes(date_vente);
CREATE INDEX idx_ventes_type_vente   ON ventes(type_vente);
CREATE INDEX idx_ventes_prospection  ON ventes(prospection_id);

-- =============================================================================
-- TABLE 7 : offres_services
-- Colonnes N°4 → Observations de l'OS du fichier Excel (section Offres de services)
-- =============================================================================
CREATE TABLE offres_services (
  id              SERIAL       PRIMARY KEY,
  numero          INT,                          -- N°4 dans le fichier Excel
  prospection_id  INT          REFERENCES prospections(id),
  client_id       VARCHAR(10)  REFERENCES clients(id),
  commercial_id   INT          NOT NULL REFERENCES users(id),
  date_os         DATE,                         -- Dates de OS
  nom_entreprise  VARCHAR(200),                 -- Noms de l'entreprise
  contact         VARCHAR(100),                 -- Contacts
  email           VARCHAR(150),                 -- Mails
  observations    TEXT,                         -- Observations de l'OS
  created_at      TIMESTAMP    DEFAULT NOW(),
  updated_at      TIMESTAMP    DEFAULT NOW()
);

-- Index
CREATE INDEX idx_os_commercial  ON offres_services(commercial_id);
CREATE INDEX idx_os_client      ON offres_services(client_id);
CREATE INDEX idx_os_date        ON offres_services(date_os);

-- =============================================================================
-- TABLE 8 : objectifs
-- Objectifs mensuels avec report automatique du non-atteint
-- =============================================================================
CREATE TABLE objectifs (
  id                SERIAL       PRIMARY KEY,
  commercial_id     INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mois              DATE         NOT NULL,      -- 1er du mois ex: 2026-04-01
  montant_mensuel   DECIMAL(15,2) NOT NULL DEFAULT 500000,
  montant_reporte   DECIMAL(15,2) DEFAULT 0,   -- Non atteint du mois précédent
  created_at        TIMESTAMP    DEFAULT NOW(),
  updated_at        TIMESTAMP    DEFAULT NOW(),
  UNIQUE (commercial_id, mois)                  -- Un objectif par commercial par mois
);

-- Index
CREATE INDEX idx_obj_commercial ON objectifs(commercial_id);
CREATE INDEX idx_obj_mois       ON objectifs(mois);

-- =============================================================================
-- TABLE 9 : sessions
-- Gestion des tokens JWT pour l'authentification sécurisée
-- =============================================================================
CREATE TABLE sessions (
  id          SERIAL       PRIMARY KEY,
  user_id     INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       VARCHAR(500) NOT NULL UNIQUE,
  expires_at  TIMESTAMP    NOT NULL,
  created_at  TIMESTAMP    DEFAULT NOW()
);

-- Index
CREATE INDEX idx_sessions_user_id   ON sessions(user_id);
CREATE INDEX idx_sessions_token     ON sessions(token);
CREATE INDEX idx_sessions_expires   ON sessions(expires_at);


-- =============================================================================
-- TRIGGERS : mise à jour automatique de updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_prospections_updated_at
  BEFORE UPDATE ON prospections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_cotations_updated_at
  BEFORE UPDATE ON cotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_ventes_updated_at
  BEFORE UPDATE ON ventes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_os_updated_at
  BEFORE UPDATE ON offres_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_objectifs_updated_at
  BEFORE UPDATE ON objectifs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =============================================================================
-- DONNÉES DE RÉFÉRENCE — TABLE produits
-- Source : feuille Synthèses du fichier Excel
-- =============================================================================
INSERT INTO produits (nom, garantie_cotee, categorie, type_client) VALUES
-- Produits Vie - Particulier
('Afrilife étude',                       'Afrilife étude',                       'Vie', 'Particulier'),
('Afrilife Pension',                     'Afrilife Pension',                     'Vie', 'Particulier'),
('Afrilife retraite plus',               'Afrilife retraite plus',               'Vie', 'Particulier'),
('Afrilife prévoyance individuelle',     'Afrilife prévoyance individuelle',     'Vie', 'Particulier'),
('Afrilife Prévoyance groupe',           'Afrilife Prévoyance groupe',           'Vie', 'Particulier'),
('Afrilife Indemnité de fin de carrière','Afrilife Indemnité de fin de carrière','Vie', 'Particulier'),
-- Produits Vie - Corporate
('Afrilife retraite individuelle',       'Afrilife retraite individuelle',       'Vie', 'Corporate'),
('Afrilife libre retraite',              'Afrilife libre retraite',              'Vie', 'Corporate'),
('Afrilife retraite complémentaire',     'Afrilife retraite complémentaire',     'Vie', 'Corporate'),
('Assurance Santé Groupe',               'Assurance Santé Groupe',               'Vie', 'Corporate'),
-- Produits Non-vie
('Assurance Maritime',                   'Assurance Maritime',                   'Non-vie', 'Tous'),
('Automobile',                           'Automobile',                           'Non-vie', 'Tous'),
('Assurance Voyage',                     'Assurance Voyage',                     'Non-vie', 'Tous'),
('Flotte Automobile',                    'Flotte Automobile',                    'Non-vie', 'Tous'),
('Global Dommages',                      'Global Dommages',                      'Non-vie', 'Tous'),
('Individuelle Accident',                'Individuelle Accident',                'Non-vie', 'Tous'),
('Individuelle Accident Groupe',         'Individuelle Accident Groupe',         'Non-vie', 'Tous'),
('Multirisque Habitation',               'Multirisque Habitation',               'Non-vie', 'Tous'),
('Responsabilité Civile Chef Entreprise','Rsponsabilité Civile Chef Entreprise', 'Non-vie', 'Corporate'),
('Transport Marchandise',                'Transport Marchandise',                'Non-vie', 'Tous'),
('Tous Risques Chantiers',               'Tous Risques Chantiers',               'Non-vie', 'Corporate'),
('Vol',                                  'Vol',                                  'Non-vie', 'Tous'),
('Bris de Machine',                      'Bris de Machine',                      'Non-vie', 'Tous'),
('Tous Risques Informatiques',           'Tous Risques Informatiques',           'Non-vie', 'Tous'),
('Tous Risques Montages',                'Tous Risques Montages',                'Non-vie', 'Corporate'),
('Responsabilité civile scolaire',       'Responsabilité civile scolaire',       'Non-vie', 'Tous'),
('Assurance evenement',                  'Assurance evenement',                  'Non-vie', 'Tous'),
-- Cautions
('Caution de soumission',                'Caution de soumission',                'Caution',  'Corporate'),
('Avance de Démarrage',                  'Avance de Démarrage',                  'Caution',  'Corporate'),
('Fin de Gurantie',                      'Fin de Gurantie',                      'Caution',  'Corporate'),
('Bonne Fin de guarantie',               'Bonne Fin de guarantie',               'Caution',  'Corporate'),
('Retenu de Guarantie',                  'Retenu de Guarantie',                  'Caution',  'Corporate');


-- =============================================================================
-- DONNÉES DE RÉFÉRENCE — TABLE clients
-- Clients extraits du fichier Excel
-- =============================================================================
-- Réinitialiser la séquence
SELECT setval('client_seq',1,false);

INSERT INTO clients (id, nom, telephone, activite, type_client) VALUES
('CLI-0001', 'DJEUKEU JUSTIN',    '699971760', 'Chef d''entreprise', 'Particulier'),
('CLI-0002', 'DJIFO CALVIN',      '675139113', 'Chef d''entreprise', 'Particulier'),
('CLI-0003', 'AJANG ROLAND',      '677382783', 'Enseignant',          'Particulier'),
('CLI-0004', 'DHASSI',            '694642943', 'Chef d''entreprise', 'Particulier'),
('CLI-0005', 'DZOYEM TASSE',      '',           'Chef d''entreprise', 'Particulier'),
('CLI-0006', 'AF CONSULTING',     '699644745', 'Chef d''entreprise', 'Particulier'),
('CLI-0007', 'OBAM MENDJO',       '683558017', 'Commissaire',         'Particulier'),
('CLI-0008', 'ABEGA NGONDA',      '681104479', 'Médecin',             'Particulier'),
('CLI-0009', 'NANFACK PAUL',      '699821138', 'Homme d''affaire',   'Particulier'),
('CLI-0010', 'TSAMO/SC TIOKENG', '699935348', 'Commissaire',         'Particulier'),
('CLI-0011', 'NJIAKIM',           '694879417', 'Retraité',            'Corporate'),
('CLI-0012', 'MELI ORNELLA',      '691507601', 'Employé',             'Particulier'),
('CLI-0013', 'FOUENANG NIPIZE',   '676468709', 'Employé',             'Particulier'),
('CLI-0014', 'NGUIMIKON BIKOE',   '655990324', 'Commerçant',          'Particulier'),
('CLI-0015', 'KAKENGNE JEANNE',   '679972793', 'Employé',             'Particulier'),
('CLI-0016', 'AKA AKETCHI',       '640656585', 'Employé',             'Particulier'),
('CLI-0017', 'MOBARA DJERSNA',    '699495015', 'Employé',             'Particulier'),
('CLI-0018', 'EKOTO MARTIN',      '699112233', 'Médecin',             'Particulier');

-- Mettre à jour la séquence après les inserts manuels
SELECT setval('client_seq', 18);


-- =============================================================================
-- DONNÉES — TABLE prospections (données réelles du fichier Excel)
-- =============================================================================
INSERT INTO prospections
  (numero, commercial_id, client_id, date_prospection, risque_prospecte,
   potentiel_ca, chance_realisation, date_visite_1, date_visite_2,
   date_relance, observations, statut)
VALUES
-- NGUEGUIM (id=1)
(1,  1, 'CLI-0001', '2025-11-05', 'Afrilife retraite plus',        105000,  1.0, '2026-11-05', '2026-11-20', NULL,         'INTERESSE',            'Contrat conclu'),
(2,  1, 'CLI-0002', '2025-11-15', 'Afrilife étude',                 100000,  1.0, NULL,          NULL,          NULL,         NULL,                   'Contrat conclu'),
(3,  1, 'CLI-0003', '2025-12-12', 'Afrilife étude',                  10000,  1.0, NULL,          NULL,          NULL,         NULL,                   'Contrat conclu'),
(4,  1, 'CLI-0004', '2025-12-01', 'Flotte Automobile',              486467,  1.0, NULL,          NULL,          NULL,         NULL,                   'Contrat conclu'),
(5,  1, 'CLI-0007', '2025-12-20', 'Flotte Automobile',              160669,  1.0, NULL,          NULL,          NULL,         NULL,                   'Contrat conclu'),
(6,  1, 'CLI-0011', '2026-01-13', 'Assurance Santé Groupe',        1433981, 1.0, NULL,          NULL,          NULL,         NULL,                   'Contrat conclu'),
(7,  1, 'CLI-0012', '2026-01-15', 'Afrilife étude',                  52000,  1.0, NULL,          NULL,          NULL,         NULL,                   'Contrat conclu'),
(8,  1, 'CLI-0013', '2026-02-15', 'Afrilife retraite individuelle',  11000,  1.0, NULL,          NULL,          NULL,         NULL,                   'Contrat conclu'),
(15, 1, 'CLI-0001', '2026-03-01', 'Afrilife retraite plus',         150000,  0.8, '2026-03-01', '2026-03-15', '2026-04-05', 'Contrat en cours',     'En attente signature'),
-- AMENA (id=5)
(9,  5, 'CLI-0014', '2026-02-15', 'Afrilife étude',                  11000,  0.7, '2026-02-15', NULL,          '2026-04-01', 'En discussion',        'Relance 1'),
(10, 5, 'CLI-0018', '2026-02-20', 'Assurance Santé Groupe',         250000,  0.5, '2026-02-20', '2026-03-10', '2026-03-30', 'Cotation envoyée',     'Cotation envoyée'),
-- ONGOMALELA (id=2)
(11, 2, 'CLI-0016', '2025-11-10', 'Afrilife étude',                  25000,  1.0, NULL,          NULL,          NULL,         NULL,                   'Contrat conclu'),
(12, 2, 'CLI-0017', '2025-11-14', 'Afrilife étude',                 450000,  1.0, NULL,          NULL,          NULL,         NULL,                   'Contrat conclu'),
-- MBA MAMBA (id=3)
(13, 3, 'CLI-0015', '2026-02-10', 'Afrilife retraite individuelle',  15000,  1.0, NULL,          NULL,          NULL,         NULL,                   'Contrat conclu'),
-- MAHOT (id=4)
(14, 4, 'CLI-0009', '2025-12-25', 'Flotte Automobile',              355000,  1.0, NULL,          NULL,          NULL,         NULL,                   'Contrat conclu');


-- =============================================================================
-- DONNÉES — TABLE cotations
-- =============================================================================
INSERT INTO cotations
  (numero, prospection_id, client_id, commercial_id,
   risque_cote, date_cotation, montant, date_validation, statut)
VALUES
(1,  1,  'CLI-0001', 1, 'LIBRE RETRAITE', '2025-11-20',  105000,  '2025-11-20', 'Convertie en vente'),
(2,  2,  'CLI-0002', 1, 'ETUDE',          '2025-11-23',  100000,  '2025-11-23', 'Convertie en vente'),
(3,  3,  'CLI-0003', 1, 'ETUDE',          '2025-12-12',   11000,  '2025-12-12', 'Convertie en vente'),
(4,  4,  'CLI-0004', 1, 'AUTO',           '2025-12-15',  486467,  '2025-12-15', 'Convertie en vente'),
(5,  5,  'CLI-0007', 1, 'AUTO',           '2025-12-20',  160669,  '2025-12-20', 'Convertie en vente'),
(6,  6,  'CLI-0011', 1, 'SANTE',          '2026-01-15', 1433981,  '2026-01-15', 'Convertie en vente'),
(7,  7,  'CLI-0012', 1, 'ETUDE',          '2026-01-15',   52000,  '2026-01-15', 'Convertie en vente'),
(8,  8,  'CLI-0013', 1, 'RETRAITE',       '2026-02-15',   11000,  '2026-02-15', 'Convertie en vente'),
(9,  15, 'CLI-0001', 1, 'LIBRE RETRAITE', '2026-03-15',  150000,  '2026-03-20', 'Validée'),
(10, 10, 'CLI-0018', 5, 'SANTE',          '2026-03-10',  250000,  NULL,         'En attente'),
(11, 11, 'CLI-0016', 2, 'ETUDE',          '2025-11-28',   25000,  NULL,         'Convertie en vente'),
(12, 12, 'CLI-0017', 2, 'ETUDE',          '2025-12-01',  450000,  NULL,         'Convertie en vente'),
(13, 13, 'CLI-0015', 3, 'RETRAITE',       '2026-02-10',   15000,  NULL,         'Convertie en vente'),
(14, 14, 'CLI-0009', 4, 'AUTO',           '2025-12-30',  335000,  '2025-12-30', 'Convertie en vente');


-- =============================================================================
-- DONNÉES — TABLE ventes
-- =============================================================================
INSERT INTO ventes
  (numero, prospection_id, cotation_id, client_id, commercial_id,
   date_vente, type_vente, no_police, prime_nette, accessoires,
   no_attestation, no_carte_rose, date_effet, date_echeance)
VALUES
(1,  1,  1,  'CLI-0001', 1, '2025-11-20', 'NouVe', '', 100000,  5000,  '', '', '2026-12-01', '2031-11-17'),
(2,  2,  2,  'CLI-0002', 1, '2025-11-23', 'NouVe', '',  99000,  1000,  '', '', NULL,          NULL),
(3,  3,  3,  'CLI-0003', 1, '2025-12-12', 'NouVe', '',  10000,  1000,  '', '', NULL,          NULL),
(4,  4,  4,  'CLI-0004', 1, '2025-12-15', 'NouVe', '', 486467,     0,  '', '', NULL,          NULL),
(5,  5,  5,  'CLI-0007', 1, '2025-12-20', 'NouVe', '', 160669,     0,  '', '', NULL,          NULL),
(6,  6,  6,  'CLI-0011', 1, '2026-01-15', 'NouVe', '',1433981,     0,  '', '', NULL,          NULL),
(7,  7,  7,  'CLI-0012', 1, '2026-01-15', 'NouVe', '',  52000,     0,  '', '', NULL,          NULL),
(8,  8,  8,  'CLI-0013', 1, '2026-02-15', 'NouVe', '',  11000,     0,  '', '', NULL,          NULL),
(9,  11, 11, 'CLI-0016', 2, '2025-11-28', 'NouVe', '',  25000,  1000,  '', '', NULL,          NULL),
(10, 12, 12, 'CLI-0017', 2, '2025-12-01', 'NouVe', '', 450000,  1000,  '', '', NULL,          NULL),
(11, 13, 13, 'CLI-0015', 3, '2026-02-10', 'NouVe', '',  15000,     0,  '', '', NULL,          NULL),
(12, 14, 14, 'CLI-0009', 4, '2025-12-30', 'NouVe', '', 335000,     0,  '', '', NULL,          NULL);


-- =============================================================================
-- DONNÉES — TABLE objectifs (mois courant + mois précédent)
-- =============================================================================
INSERT INTO objectifs (commercial_id, mois, montant_mensuel, montant_reporte) VALUES
-- Mars 2026
(1, '2026-03-01', 500000,      0),  -- NGUEGUIM
(2, '2026-03-01', 400000,      0),  -- ONGOMALELA
(3, '2026-03-01', 400000,  50000),  -- MBA MAMBA (50 000 reportés)
(4, '2026-03-01', 450000,      0),  -- MAHOT
(5, '2026-03-01', 350000, 100000),  -- AMENA (100 000 reportés)
(6, '2026-03-01', 500000,      0),  -- YANNICK
-- Avril 2026
(1, '2026-04-01', 500000,      0),
(2, '2026-04-01', 400000,      0),
(3, '2026-04-01', 400000,      0),
(4, '2026-04-01', 450000,      0),
(5, '2026-04-01', 350000,      0),
(6, '2026-04-01', 500000,      0);


-- =============================================================================
-- VUES UTILES pour l'API Node.js
-- =============================================================================

-- Vue complète prospections avec infos client et commercial
CREATE OR REPLACE VIEW v_prospections AS
SELECT
  p.id,
  p.numero,
  p.date_prospection,
  p.risque_prospecte,
  p.potentiel_ca,
  p.chance_realisation,
  p.statut,
  p.date_relance,
  p.date_visite_1,
  p.date_visite_2,
  p.date_visite_3,
  p.observations,
  p.ancien_assureur,
  p.date_effet_ancien,
  p.date_echeance_ancien,
  p.created_at,
  -- Client
  c.id          AS client_id,
  c.nom         AS client_nom,
  c.telephone   AS client_tel,
  c.type_client,
  c.activite    AS client_activite,
  -- Commercial
  u.id          AS commercial_id,
  u.nom         AS commercial_nom,
  u.equipe,
  -- Cotation liée
  cot.id        AS cotation_id,
  cot.numero    AS cotation_numero,
  cot.montant   AS cotation_montant,
  cot.statut    AS cotation_statut,
  -- Vente liée
  v.id          AS vente_id,
  v.prime_nette,
  v.accessoires,
  v.ca,
  v.date_vente,
  v.type_vente,
  v.no_police
FROM prospections p
JOIN clients      c   ON p.client_id      = c.id
JOIN users        u   ON p.commercial_id  = u.id
LEFT JOIN cotations cot ON cot.prospection_id = p.id
LEFT JOIN ventes  v   ON v.prospection_id = p.id;


-- Vue CA mensuel par commercial
CREATE OR REPLACE VIEW v_ca_mensuel AS
SELECT
  u.id            AS commercial_id,
  u.nom           AS commercial_nom,
  DATE_TRUNC('month', v.date_vente) AS mois,
  SUM(v.ca)       AS ca_total,
  SUM(v.prime_nette) AS primes_nettes,
  COUNT(v.id)     AS nb_ventes
FROM ventes v
JOIN users u ON v.commercial_id = u.id
WHERE v.date_vente IS NOT NULL
GROUP BY u.id, u.nom, DATE_TRUNC('month', v.date_vente)
ORDER BY mois DESC, ca_total DESC;


-- Vue objectifs avec réalisations (pour le calcul de report)
CREATE OR REPLACE VIEW v_objectifs_realises AS
SELECT
  o.id,
  o.commercial_id,
  u.nom           AS commercial_nom,
  o.mois,
  o.montant_mensuel,
  o.montant_reporte,
  (o.montant_mensuel + o.montant_reporte) AS total_objectif,
  COALESCE(SUM(v.ca), 0) AS ca_realise,
  GREATEST(0, (o.montant_mensuel + o.montant_reporte) - COALESCE(SUM(v.ca), 0)) AS montant_restant,
  CASE
    WHEN (o.montant_mensuel + o.montant_reporte) = 0 THEN 0
    ELSE LEAST(100, ROUND(
      COALESCE(SUM(v.ca), 0) / (o.montant_mensuel + o.montant_reporte) * 100, 1
    ))
  END AS pct_atteint
FROM objectifs o
JOIN users u ON o.commercial_id = u.id
LEFT JOIN ventes v
  ON v.commercial_id = o.commercial_id
  AND DATE_TRUNC('month', v.date_vente) = DATE_TRUNC('month', o.mois)
GROUP BY o.id, o.commercial_id, u.nom, o.mois, o.montant_mensuel, o.montant_reporte;


-- Vue relances urgentes (date_relance dépassée)
CREATE OR REPLACE VIEW v_relances_urgentes AS
SELECT
  p.id,
  p.date_relance,
  p.statut,
  p.risque_prospecte,
  c.nom           AS client_nom,
  c.id            AS client_id,
  c.telephone,
  u.nom           AS commercial_nom,
  u.id            AS commercial_id,
  (CURRENT_DATE - p.date_relance) AS jours_retard
FROM prospections p
JOIN clients c ON p.client_id     = c.id
JOIN users   u ON p.commercial_id = u.id
WHERE p.date_relance < CURRENT_DATE
  AND p.statut NOT IN ('Contrat conclu', 'Perdu')
ORDER BY p.date_relance ASC;


-- =============================================================================
-- FONCTION : calcul et report automatique des objectifs non atteints
-- À exécuter le 1er de chaque mois via un cron job
-- =============================================================================
CREATE OR REPLACE FUNCTION reporter_objectifs_non_atteints()
RETURNS void AS $$
DECLARE
  rec RECORD;
  mois_precedent DATE;
  mois_actuel    DATE;
  ca_realise     DECIMAL(15,2);
  montant_reporte DECIMAL(15,2);
BEGIN
  mois_precedent := DATE_TRUNC('month', NOW() - INTERVAL '1 month');
  mois_actuel    := DATE_TRUNC('month', NOW());

  FOR rec IN
    SELECT o.*, (o.montant_mensuel + o.montant_reporte) AS total
    FROM objectifs o
    WHERE DATE_TRUNC('month', o.mois) = mois_precedent
  LOOP
    -- CA réalisé le mois précédent
    SELECT COALESCE(SUM(v.ca), 0) INTO ca_realise
    FROM ventes v
    WHERE v.commercial_id = rec.commercial_id
      AND DATE_TRUNC('month', v.date_vente) = mois_precedent;

    -- Calcul du montant à reporter
    montant_reporte := GREATEST(0, rec.total - ca_realise);

    -- Insérer ou mettre à jour l'objectif du mois actuel
    INSERT INTO objectifs (commercial_id, mois, montant_mensuel, montant_reporte)
    VALUES (rec.commercial_id, mois_actuel, rec.montant_mensuel, montant_reporte)
    ON CONFLICT (commercial_id, mois)
    DO UPDATE SET montant_reporte = EXCLUDED.montant_reporte;
  END LOOP;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- FUNCTION : insert_new_prospection
-- Maps exactly to ProspectionFormData from NewProspectionModal
-- Returns the new prospection_id
-- =============================================================================
CREATE OR REPLACE FUNCTION insert_new_prospection(
  -- Step 1 — Client
  p_client_name       VARCHAR,
  p_phone             VARCHAR,
  p_client_type       VARCHAR,   -- 'Particulier' | 'PME' | 'Entreprise' | 'Autre'
  p_activity          VARCHAR,

  -- Step 2 — Prospection
  p_commercial_id     INT,       -- from the logged-in user's session
  p_prospection_date  DATE,
  p_product           VARCHAR,   -- maps to risque_prospecte
  p_potential_ca      DECIMAL,   -- maps to potentiel_ca
  p_status            VARCHAR,   -- maps to statut (mapped below)
  p_probability       DECIMAL,   -- 0–100 → divided by 100 → chance_realisation
  p_visit_date_1      DATE,
  p_visit_date_2      DATE,
  p_visit_date_3      DATE,
  p_next_follow_up    DATE,      -- maps to date_relance
  p_previous_insurer  VARCHAR,   -- maps to ancien_assureur
  p_previous_contract DATE,      -- maps to date_effet_ancien
  p_observations      TEXT,

  -- Step 3 — Cotation (all optional)
  p_rated_risk        VARCHAR,   -- maps to risque_cote (NULL if '— Non coté —')
  p_quotation_date    DATE,
  p_quotation_amount  DECIMAL,
  p_validation_date   DATE,

  -- Step 4 — Vente (all optional)
  p_sale_date         DATE,
  p_sale_type         VARCHAR,   -- 'NouVe' | 'VenRec' (mapped below)
  p_policy_number     VARCHAR,
  p_attestation_number VARCHAR,
  p_net_premiums      DECIMAL,
  p_accessories       DECIMAL,
  p_effect_date       DATE,
  p_expiry_date       DATE,
  p_car_rose_number   VARCHAR
)
RETURNS INT AS $$
DECLARE
  v_client_id       VARCHAR(10);
  v_prospection_id  INT;
  v_cotation_id     INT;
  v_statut_mapped   VARCHAR(30);
  v_sale_type_mapped VARCHAR(10);
  v_chance          DECIMAL(3,1);
BEGIN

  -- ── 1. CLIENT: find existing or create new ───────────────────────────────
  -- Try to match by phone first, then by name
  SELECT id INTO v_client_id
  FROM clients
  WHERE telephone = p_phone AND p_phone IS NOT NULL AND p_phone <> ''
  LIMIT 1;

  IF v_client_id IS NULL THEN
    SELECT id INTO v_client_id
    FROM clients
    WHERE LOWER(nom) = LOWER(p_client_name)
    LIMIT 1;
  END IF;

  IF v_client_id IS NULL THEN
    -- Create new client with generated CLI-XXXX id
    v_client_id := generate_client_id();
    INSERT INTO clients (id, nom, telephone, activite, type_client)
    VALUES (
      v_client_id,
      UPPER(TRIM(p_client_name)),
      NULLIF(TRIM(p_phone), ''),
      NULLIF(TRIM(p_activity), ''),
      COALESCE(p_client_type, 'Particulier')
    );
  END IF;

  -- ── 2. MAP form values to DB enum values ─────────────────────────────────

  -- Form status  →  DB statut
  v_statut_mapped := CASE p_status
    WHEN 'Premier contact'       THEN 'Premier contact'
    WHEN 'En discussion'         THEN 'Relance 1'
    WHEN 'Proposition envoyée'   THEN 'Cotation envoyée'
    WHEN 'Négociation'           THEN 'En attente signature'
    ELSE 'Premier contact'
  END;

  -- probability 0-100  →  chance_realisation 0.1-1.0
  v_chance := GREATEST(0.1, LEAST(1.0, ROUND(p_probability / 100.0, 1)))::DECIMAL(3,1);

  -- ── 3. PROSPECTION ───────────────────────────────────────────────────────
  INSERT INTO prospections (
    commercial_id,
    client_id,
    date_prospection,
    risque_prospecte,
    potentiel_ca,
    chance_realisation,
    statut,
    date_visite_1,
    date_visite_2,
    date_visite_3,
    date_relance,
    ancien_assureur,
    date_effet_ancien,
    observations
  )
  VALUES (
    p_commercial_id,
    v_client_id,
    COALESCE(p_prospection_date, CURRENT_DATE),
    NULLIF(TRIM(p_product), ''),
    NULLIF(p_potential_ca, 0),
    v_chance,
    v_statut_mapped,
    NULLIF(p_visit_date_1::TEXT, '')::DATE,
    NULLIF(p_visit_date_2::TEXT, '')::DATE,
    NULLIF(p_visit_date_3::TEXT, '')::DATE,
    NULLIF(p_next_follow_up::TEXT, '')::DATE,
    NULLIF(TRIM(p_previous_insurer), ''),
    NULLIF(p_previous_contract::TEXT, '')::DATE,
    NULLIF(TRIM(p_observations), '')
  )
  RETURNING id INTO v_prospection_id;

  -- ── 4. COTATION (only if quotation data was entered) ─────────────────────
  IF p_quotation_date IS NOT NULL OR p_quotation_amount IS NOT NULL THEN
    INSERT INTO cotations (
      prospection_id,
      client_id,
      commercial_id,
      risque_cote,
      date_cotation,
      montant,
      date_validation,
      statut
    )
    VALUES (
      v_prospection_id,
      v_client_id,
      p_commercial_id,
      CASE WHEN p_rated_risk = '— Non coté —' THEN NULL ELSE p_rated_risk END,
      p_quotation_date,
      p_quotation_amount,
      p_validation_date,
      CASE
        WHEN p_validation_date IS NOT NULL THEN 'Validée'
        ELSE 'En attente'
      END
    )
    RETURNING id INTO v_cotation_id;
  END IF;

  -- ── 5. VENTE (only if sale data was entered) ──────────────────────────────
  IF p_sale_date IS NOT NULL OR p_net_premiums IS NOT NULL THEN

    -- Map sale type from form label to DB code
    v_sale_type_mapped := CASE
      WHEN p_sale_type ILIKE '%NouVe%'    THEN 'NouVe'
      WHEN p_sale_type ILIKE '%VenRec%'   THEN 'VenRec'
      WHEN p_sale_type ILIKE '%Transfert%' THEN 'VenRec'
      ELSE 'NouVe'
    END;

    INSERT INTO ventes (
      prospection_id,
      cotation_id,
      client_id,
      commercial_id,
      date_vente,
      type_vente,
      no_police,
      prime_nette,
      accessoires,
      no_attestation,
      no_carte_rose,
      date_effet,
      date_echeance
    )
    VALUES (
      v_prospection_id,
      v_cotation_id,   -- NULL if no cotation was entered
      v_client_id,
      p_commercial_id,
      p_sale_date,
      v_sale_type_mapped,
      NULLIF(TRIM(p_policy_number), ''),
      COALESCE(p_net_premiums, 0),
      COALESCE(p_accessories, 0),
      NULLIF(TRIM(p_attestation_number), ''),
      NULLIF(TRIM(p_car_rose_number), ''),
      p_effect_date,
      p_expiry_date
    );

    -- Auto-update prospection status to 'Contrat conclu'
    UPDATE prospections
    SET statut = 'Contrat conclu'
    WHERE id = v_prospection_id;

  END IF;

  RETURN v_prospection_id;

END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- VÉRIFICATION FINALE
-- =============================================================================
SELECT 'users'           AS table_name, COUNT(*) AS nb_lignes FROM users
UNION ALL
SELECT 'clients',          COUNT(*) FROM clients
UNION ALL
SELECT 'produits',         COUNT(*) FROM produits
UNION ALL
SELECT 'prospections',     COUNT(*) FROM prospections
UNION ALL
SELECT 'cotations',        COUNT(*) FROM cotations
UNION ALL
SELECT 'ventes',           COUNT(*) FROM ventes
UNION ALL
SELECT 'offres_services',  COUNT(*) FROM offres_services
UNION ALL
SELECT 'objectifs',        COUNT(*) FROM objectifs
UNION ALL
SELECT 'sessions',         COUNT(*) FROM sessions
ORDER BY table_name;
