-- ============================================================================
-- Add subtitle column to products table
-- ============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS subtitle TEXT;
