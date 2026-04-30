-- ============================================================================
-- Dynamic Categories Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on categories" ON categories FOR ALL USING (is_admin());

-- Seed existing categories
INSERT INTO categories (name, slug, sort_order) VALUES
('Puffed Rice', 'puffed-rice', 1),
('Healthy Chips', 'healthy-chips', 2),
('Grain Puffs', 'grain-puffs', 3),
('Combos', 'combos', 4),
('Gift Packs', 'gift-packs', 5)
ON CONFLICT (name) DO NOTHING;

-- Drop old hardcoded CHECK constraint on products (if it exists)
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
