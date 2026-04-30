-- ============================================================================
-- Link testimonials to a product for the Homepage Review Section
-- ============================================================================

ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;
