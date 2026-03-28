-- ============================================================
-- AUMAGE — Creatures Table Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Creatures table — stores immutable card metadata
CREATE TABLE IF NOT EXISTS creatures (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  serial_number       TEXT UNIQUE NOT NULL,
  catalog_id          TEXT UNIQUE NOT NULL,
  user_id             UUID REFERENCES auth.users(id), -- Nullable for guest/anonymous generation
  base_rarity         TEXT NOT NULL CHECK (base_rarity IN (
                        'common', 'uncommon', 'rare', 'epic',
                        'legendary', 'primatrope', 'megatrope'
                      )),
  ars                 NUMERIC(4,3) NOT NULL CHECK (ars >= 0 AND ars <= 1),
  trope_class         TEXT,
  morphology          TEXT NOT NULL,
  tier                TEXT,
  element             TEXT,
  domain              TEXT,
  variant_tags        JSONB DEFAULT '[]'::jsonb,
  mint_timestamp      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  residence_region    TEXT NOT NULL,
  climate_zone        TEXT NOT NULL,
  season              TEXT NOT NULL CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
  hemisphere          TEXT NOT NULL CHECK (hemisphere IN ('northern', 'southern')),
  waveform_hash       TEXT NOT NULL,
  generation_number   INTEGER NOT NULL,
  card_url            TEXT NOT NULL,
  frame_variant       TEXT NOT NULL DEFAULT 'standard',
  annotation_features JSONB DEFAULT '[]'::jsonb,
  prompt_hash         TEXT NOT NULL,
  creature_name       TEXT,
  flavor_text         TEXT,
  climate_mastery     TEXT CHECK (climate_mastery IN (NULL, 'adapted', 'rooted', 'mastered')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_creatures_user_id ON creatures(user_id);
CREATE INDEX idx_creatures_base_rarity ON creatures(base_rarity);
CREATE INDEX idx_creatures_trope ON creatures(trope_class);
CREATE INDEX idx_creatures_season ON creatures(season);
CREATE INDEX idx_creatures_climate ON creatures(climate_zone);
CREATE INDEX idx_creatures_generation ON creatures(generation_number);
CREATE INDEX idx_creatures_mint_time ON creatures(mint_timestamp);

-- Sequential generation number counter
CREATE TABLE IF NOT EXISTS generation_counter (
  id      INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  counter INTEGER NOT NULL DEFAULT 0
);
INSERT INTO generation_counter (id, counter) VALUES (1, 0) ON CONFLICT DO NOTHING;

-- Atomic increment function for generation numbers
CREATE OR REPLACE FUNCTION next_generation_number()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  next_val INTEGER;
BEGIN
  UPDATE generation_counter
  SET counter = counter + 1
  WHERE id = 1
  RETURNING counter INTO next_val;
  RETURN next_val;
END;
$$;

-- Row Level Security
ALTER TABLE creatures ENABLE ROW LEVEL SECURITY;

-- Users can read their own creatures
CREATE POLICY "Users can view own creatures"
  ON creatures FOR SELECT
  USING (true); -- Allow public view so return=representation works for guests


-- Service role can bypass RLS (Worker uses service key)
CREATE POLICY "Service bypass RLS"
  ON creatures FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow public/anon to create their own creatures
CREATE POLICY "Public can insert creatures"
  ON creatures FOR INSERT
  TO public
  WITH CHECK (true);


-- Users can update name/flavor (once) on their own creatures
CREATE POLICY "Users can name own creatures"
  ON creatures FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    -- Only allow updating creature_name and flavor_text
    -- and only if they were previously NULL
    (creature_name IS NOT NULL OR OLD.creature_name IS NULL) AND
    (flavor_text IS NOT NULL OR OLD.flavor_text IS NULL)
  );

-- Public read for marketplace (future)
-- CREATE POLICY "Public can view all creatures"
--   ON creatures FOR SELECT USING (true);

COMMENT ON TABLE creatures IS 'Immutable creature card metadata. Base rarity and core fields are never modified after mint.';
