-- ============================================================================
-- Add combo_nutrition JSONB column to products
-- Format: [{ "name": "Ragi Chips", "position": 1, "rows": [{ "nutrient": "...", "per_100g": "...", "rda_percent": "..." }] }]
-- Used only when product category is 'Combos' or 'Gift Packs'
-- ============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS combo_nutrition JSONB DEFAULT '[]';
