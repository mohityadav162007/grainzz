-- Create Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT,
  review_title TEXT NOT NULL,
  review_text TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review_image_url TEXT,
  is_visible BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read visible reviews" ON reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "Public can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access on reviews" ON reviews FOR ALL USING (is_admin());

-- Create Related Products Section Table
CREATE TABLE IF NOT EXISTS related_products_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE related_products_section ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read related_products" ON related_products_section FOR SELECT USING (true);
CREATE POLICY "Admin full access on related_products" ON related_products_section FOR ALL USING (is_admin());
