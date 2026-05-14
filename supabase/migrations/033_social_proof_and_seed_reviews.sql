-- ============================================================================
-- Social Proof and Seed Reviews
-- ============================================================================

-- 1. Add social proof fields to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_count BIGINT DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seed_rating DECIMAL(2,1) DEFAULT 5.0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seed_review_count INTEGER DEFAULT 0;

-- 2. Create seed_reviews table
CREATE TABLE IF NOT EXISTS seed_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title TEXT,
  review_message TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT false,
  review_date TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS for seed_reviews
ALTER TABLE seed_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read seed reviews" ON seed_reviews
  FOR SELECT USING (true);

CREATE POLICY "Admin full access on seed reviews" ON seed_reviews
  FOR ALL USING (is_admin());

-- 4. Updated_at trigger for seed_reviews
CREATE TRIGGER seed_reviews_updated_at BEFORE UPDATE ON seed_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_seed_reviews_product_id ON seed_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_seed_reviews_display_order ON seed_reviews(display_order);
