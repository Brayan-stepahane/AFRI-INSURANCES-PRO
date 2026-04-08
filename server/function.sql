CREATE OR REPLACE FUNCTION insert_new_prospection(
  p_client_name       VARCHAR,
  p_phone             VARCHAR,
  p_client_type       VARCHAR,
  p_activity          VARCHAR,
  p_commercial_id     INT,
  p_prospection_date  DATE,
  p_product           VARCHAR,
  p_potential_ca      DECIMAL,
  p_status            VARCHAR,
  p_probability       DECIMAL,
  p_visit_date_1      DATE,
  p_visit_date_2      DATE,
  p_visit_date_3      DATE,
  p_next_follow_up    DATE,
  p_previous_insurer  VARCHAR,
  p_previous_contract DATE,
  p_observations      TEXT,
  p_rated_risk        VARCHAR,
  p_quotation_date    DATE,
  p_quotation_amount  DECIMAL,
  p_validation_date   DATE,
  p_sale_date         DATE,
  p_sale_type         VARCHAR,
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