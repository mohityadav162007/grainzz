-- ============================================================================
-- Saved Addresses + Shipping Configuration
-- ============================================================================

-- 1. SAVED ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS saved_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT DEFAULT '',
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_addresses_user ON saved_addresses(user_id);

-- Updated_at trigger
CREATE TRIGGER saved_addresses_updated_at BEFORE UPDATE ON saved_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE saved_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own addresses" ON saved_addresses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own addresses" ON saved_addresses
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own addresses" ON saved_addresses
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own addresses" ON saved_addresses
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admin full access on saved_addresses" ON saved_addresses
  FOR ALL USING (is_admin());

-- 2. ADD SHIPPING COLUMNS TO ORDERS
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_charge NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery TEXT DEFAULT '';

-- 3. ADD user_id TO ORDERS IF NOT EXISTS (for linking orders to users)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. SHIPPING CONFIGURATION IN STORE_SETTINGS
INSERT INTO store_settings (key, value, description)
VALUES
  ('free_shipping_enabled', 'true', 'Enable free shipping above threshold'),
  ('free_shipping_threshold', '499', 'Free shipping for orders above this amount'),
  ('fallback_shipping_charge_single', '50', 'Fallback shipping charge for single products if Shiprocket API fails'),
  ('fallback_shipping_charge_combo', '99', 'Fallback shipping charge for combo products if Shiprocket API fails'),
  ('default_package_dimensions', '{"length":15,"breadth":15,"height":10}', 'Default package dimensions in cm'),
  ('shiprocket_pickup_pincode', '110093', 'Warehouse/pickup pincode for Shiprocket rate calculations')
ON CONFLICT (key) DO NOTHING;
