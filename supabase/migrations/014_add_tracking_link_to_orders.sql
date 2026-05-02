-- ============================================================================
-- Add tracking_link column to orders
-- ============================================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_link TEXT DEFAULT '';
