-- Banana Beater draft schema v0 (Postgres 16 + pgvector)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE sources (
  id text PRIMARY KEY,              -- 'fma','jamendo','ccmixter','freesound','archive','marketplace'
  name text NOT NULL,
  base_url text,
  last_synced_at timestamptz,
  healthy boolean DEFAULT true
);

CREATE TABLE licenses (
  code text PRIMARY KEY,            -- 'CC0','CC-BY-4.0','CC-BY-NC-4.0',...,'CREATOR-OWNED'
  url text,
  allows_commercial boolean NOT NULL,
  allows_derivatives boolean NOT NULL,
  share_alike boolean NOT NULL DEFAULT false,
  requires_attribution boolean NOT NULL
);

CREATE TABLE artists (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  source_id text REFERENCES sources(id),
  external_id text,
  UNIQUE (source_id, external_id)
);

CREATE TABLE tracks (
  id bigserial PRIMARY KEY,
  source_id text NOT NULL REFERENCES sources(id),
  external_id text NOT NULL,
  title text NOT NULL,
  artist_id bigint REFERENCES artists(id),
  license_code text NOT NULL REFERENCES licenses(code),
  attribution text NOT NULL,
  source_url text NOT NULL,
  audio_key text,                   -- R2 object key if cached
  duration_s real, bpm real, musical_key text,
  tags text[] DEFAULT '{}',
  genres text[] DEFAULT '{}',
  hidden boolean DEFAULT false,     -- takedowns
  search_tsv tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('simple', array_to_string(tags,' ')), 'B') ||
    setweight(to_tsvector('simple', array_to_string(genres,' ')), 'B') ||
    setweight(to_tsvector('simple', coalesce(attribution,'')), 'C')
  ) STORED,
  embedding vector(768),            -- text/audio embedding; dim TBD by model
  created_at timestamptz DEFAULT now(),
  UNIQUE (source_id, external_id)
);
CREATE INDEX tracks_tsv_idx ON tracks USING gin (search_tsv);
CREATE INDEX tracks_emb_idx ON tracks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX tracks_license_idx ON tracks (license_code) WHERE NOT hidden;

-- Graph layer as adjacency table
CREATE TABLE track_edges (
  from_track bigint REFERENCES tracks(id) ON DELETE CASCADE,
  to_track bigint REFERENCES tracks(id) ON DELETE CASCADE,
  rel text NOT NULL CHECK (rel IN ('remix_of','sample_of','stem_of','cover_of')),
  PRIMARY KEY (from_track, to_track, rel)
);

-- Accounts and credits (platform credit, not a token)
CREATE TABLE accounts (
  id bigserial PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('user','creator','agent','device')),
  display_name text,
  created_at timestamptz DEFAULT now()
);
CREATE TABLE credit_ledger (
  id bigserial PRIMARY KEY,
  account_id bigint NOT NULL REFERENCES accounts(id),
  delta bigint NOT NULL,            -- credits, integer
  reason text NOT NULL,             -- 'topup','purchase','payout','refund'
  ref_id bigint,
  created_at timestamptz DEFAULT now()
);

-- Marketplace: creator-owned only
CREATE TABLE listings (
  id bigserial PRIMARY KEY,
  track_id bigint NOT NULL REFERENCES tracks(id),
  creator_id bigint NOT NULL REFERENCES accounts(id),
  price_credits bigint NOT NULL CHECK (price_credits > 0),
  terms text NOT NULL,
  active boolean DEFAULT true
);
CREATE TABLE remix_grants (
  id bigserial PRIMARY KEY,
  listing_id bigint NOT NULL REFERENCES listings(id),
  buyer_id bigint NOT NULL REFERENCES accounts(id),
  uses_remaining int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- License usage log (append-only)
CREATE TABLE license_events (
  id bigserial PRIMARY KEY,
  track_id bigint NOT NULL REFERENCES tracks(id),
  account_id bigint REFERENCES accounts(id),
  license_code text NOT NULL,       -- snapshot at time of use
  purpose text NOT NULL CHECK (purpose IN ('stream','download','remix','commercial','preview')),
  grant_id bigint REFERENCES remix_grants(id),
  created_at timestamptz DEFAULT now()
);

-- Guard: marketplace listings only for marketplace-source tracks
CREATE FUNCTION listing_source_check() RETURNS trigger AS $$
BEGIN
  IF (SELECT source_id FROM tracks WHERE id = NEW.track_id) <> 'marketplace' THEN
    RAISE EXCEPTION 'only creator-uploaded tracks can be listed';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
CREATE TRIGGER listings_source_guard BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION listing_source_check();
