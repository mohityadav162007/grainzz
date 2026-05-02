-- ============================================================================
-- Fix RLS Vulnerabilities and Add Store Settings
-- ============================================================================

-- Fix: Add user_id to orders to link orders to authenticated users
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix: Allow users to view their own orders
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can read own order items" ON order_items FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);

-- Fix: Allow public to insert product reviews (pending admin approval)
CREATE POLICY "Anyone can insert reviews" ON product_reviews FOR INSERT WITH CHECK (true);


-- ============================================================================
-- Store Settings (Editable Footer / Global Content)
-- ============================================================================
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for Store Settings
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read store settings" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Admin full access on store settings" ON store_settings FOR ALL USING (is_admin());

-- Insert default existing data
INSERT INTO store_settings (key, value, description) VALUES
  ('contact_phone', '96262425 , 9375 6546', 'Primary contact numbers'),
  ('contact_email', 'katariavibhor9@gmail.com', 'Primary contact email'),
  ('contact_address', 'B-291, MIG Flats, East of Loni road, Delhi, Delhi - 110093, India', 'Physical store address'),
  ('social_instagram', 'https://instagram.com', 'Instagram Link'),
  ('social_facebook', 'https://facebook.com', 'Facebook Link'),
  ('social_twitter', 'https://twitter.com', 'Twitter Link'),
  ('about_text', 'Subscribe to get latest offers', 'Footer short about text')
ON CONFLICT (key) DO NOTHING;
