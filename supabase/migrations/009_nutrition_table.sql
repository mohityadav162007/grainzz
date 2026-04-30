-- ============================================================================
-- Add structured nutrition_table JSONB column to products
-- Format: [{ "nutrient": "...", "per_100g": "...", "rda_percent": "..." }]
-- ============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS nutrition_table JSONB DEFAULT '[]';
