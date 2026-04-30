-- ============================================================================
-- Add weight column to products
-- ============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS weight TEXT;
