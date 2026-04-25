-- ============================================================================
-- Grainzz D2C E-Commerce — Supabase PostgreSQL Schema
-- ============================================================================

-- 1. USER ROLES (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. OFFERS
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  discount_percentage NUMERIC(5,2) NOT NULL,
  applicable_categories TEXT[] DEFAULT '{}',
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  mrp NUMERIC(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL CHECK (category IN ('Puffed Rice','Healthy Chips','Grain Puffs','Combos','Gift Packs')),
  stock INTEGER DEFAULT 0,
  is_sale BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  nutrition_info TEXT DEFAULT '',
  ingredients TEXT DEFAULT '',
  offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Computed discount percentage
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent INTEGER
  GENERATED ALWAYS AS (
    CASE WHEN mrp > 0 THEN ROUND(((mrp - price) / mrp) * 100)::INTEGER ELSE 0 END
  ) STORED;

-- 4. OFFER-PRODUCTS junction
CREATE TABLE IF NOT EXISTS offer_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(offer_id, product_id)
);

-- 5. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  value NUMERIC(10,2) NOT NULL,
  min_order_value NUMERIC(10,2) DEFAULT 0,
  max_discount NUMERIC(10,2),
  expiry_date TIMESTAMPTZ NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  user_email TEXT DEFAULT '',
  user_address TEXT NOT NULL,
  user_city TEXT DEFAULT '',
  user_state TEXT DEFAULT '',
  user_pincode TEXT DEFAULT '',
  subtotal NUMERIC(10,2) NOT NULL,
  coupon_code TEXT DEFAULT '',
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','processing','shipped','delivered','cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  payment_method TEXT DEFAULT 'phonepe',
  transaction_id TEXT DEFAULT '',
  merchant_transaction_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  image TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  mrp NUMERIC(10,2),
  quantity INTEGER NOT NULL CHECK (quantity >= 1)
);

-- 8. HOMEPAGE SECTIONS
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type TEXT NOT NULL CHECK (section_type IN ('bestsellers','featured','sale','custom')),
  title TEXT DEFAULT '',
  product_ids UUID[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. ANALYTICS LOGS (optional)
CREATE TABLE IF NOT EXISTS analytics_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_type ON homepage_sections(section_type);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PRODUCTS RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active products" ON products
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on products" ON products
  FOR ALL USING (is_admin());

-- ORDERS RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage orders" ON orders
  FOR ALL USING (is_admin());
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- ORDER ITEMS RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage order items" ON order_items
  FOR ALL USING (is_admin());
CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT WITH CHECK (true);

-- COUPONS RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active coupons" ON coupons
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on coupons" ON coupons
  FOR ALL USING (is_admin());

-- OFFERS RLS
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active offers" ON offers
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on offers" ON offers
  FOR ALL USING (is_admin());

-- OFFER_PRODUCTS RLS
ALTER TABLE offer_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read offer products" ON offer_products
  FOR SELECT USING (true);
CREATE POLICY "Admin full access on offer products" ON offer_products
  FOR ALL USING (is_admin());

-- USER ROLES RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own role" ON user_roles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admin full access on user roles" ON user_roles
  FOR ALL USING (is_admin());

-- HOMEPAGE SECTIONS RLS
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active sections" ON homepage_sections
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on homepage sections" ON homepage_sections
  FOR ALL USING (is_admin());

-- ANALYTICS LOGS RLS
ALTER TABLE analytics_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage analytics" ON analytics_logs
  FOR ALL USING (is_admin());
CREATE POLICY "Anyone can insert analytics" ON analytics_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

-- Get order stats for admin dashboard
CREATE OR REPLACE FUNCTION get_order_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalOrders', (SELECT COUNT(*) FROM orders),
    'paidOrders', (SELECT COUNT(*) FROM orders WHERE payment_status = 'paid'),
    'revenue', COALESCE((SELECT SUM(total_amount) FROM orders WHERE payment_status = 'paid'), 0),
    'recentOrders', COALESCE((
      SELECT json_agg(row_to_json(o))
      FROM (SELECT * FROM orders ORDER BY created_at DESC LIMIT 5) o
    ), '[]'::json)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply coupon validation
CREATE OR REPLACE FUNCTION apply_coupon(coupon_code TEXT, order_total NUMERIC)
RETURNS JSON AS $$
DECLARE
  c RECORD;
  discount NUMERIC;
BEGIN
  SELECT * INTO c FROM coupons
    WHERE code = UPPER(coupon_code) AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Invalid coupon code');
  END IF;

  IF c.expiry_date < now() THEN
    RETURN json_build_object('success', false, 'message', 'Coupon has expired');
  END IF;

  IF c.usage_limit IS NOT NULL AND c.used_count >= c.usage_limit THEN
    RETURN json_build_object('success', false, 'message', 'Coupon usage limit reached');
  END IF;

  IF order_total < c.min_order_value THEN
    RETURN json_build_object('success', false, 'message',
      format('Minimum order value of ₹%s required', c.min_order_value));
  END IF;

  IF c.discount_type = 'percentage' THEN
    discount := (order_total * c.value) / 100;
    IF c.max_discount IS NOT NULL THEN
      discount := LEAST(discount, c.max_discount);
    END IF;
  ELSE
    discount := c.value;
  END IF;
  discount := LEAST(discount, order_total);

  RETURN json_build_object(
    'success', true,
    'data', json_build_object(
      'code', c.code,
      'discountType', c.discount_type,
      'value', c.value,
      'discountAmount', ROUND(discount),
      'finalTotal', ROUND(order_total - discount)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment product views
CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE products SET views = views + 1 WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER offers_updated_at BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER homepage_sections_updated_at BEFORE UPDATE ON homepage_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- STORAGE BUCKET
-- ============================================================================
-- Run in Supabase Dashboard or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
