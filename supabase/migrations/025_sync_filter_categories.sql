-- Rename Grain Puffs to Grainzz Puffs in categories and products
UPDATE categories SET name = 'Grainzz Puffs', slug = 'grainzz-puffs' WHERE name = 'Grain Puffs' OR slug = 'grain-puffs';
UPDATE products SET category = 'Grainzz Puffs' WHERE category = 'Grain Puffs';

-- Ensure the 4 main filter categories exist
INSERT INTO categories (name, slug, sort_order, is_active) VALUES
('Puffed Rice', 'puffed-rice', 1, true),
('Healthy Chips', 'healthy-chips', 2, true),
('Grainzz Puffs', 'grainzz-puffs', 3, true),
('Gift Packs', 'gift-packs', 4, true)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  is_active = true;
