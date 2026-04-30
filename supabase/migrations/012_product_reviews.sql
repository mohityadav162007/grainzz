-- ============================================================================
-- Product Reviews Table (Admin-controlled visibility)
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active reviews" ON product_reviews FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on product_reviews" ON product_reviews FOR ALL USING (is_admin());
