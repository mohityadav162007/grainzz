-- ============================================================================
-- Grainzz Seed Data
-- ============================================================================
-- NOTE: Admin user must be created via Supabase Auth first, then add role:
-- 1. Sign up admin@grainzz.com with password Grainzz@2026 in Supabase Dashboard
-- 2. Then run: INSERT INTO user_roles (user_id, role) VALUES ('<user-uuid>', 'admin');

-- Seed Products
INSERT INTO products (name, slug, description, price, mrp, images, category, stock, is_sale, tags, nutrition_info, ingredients) VALUES
(
  'Oats Chips – Peri Peri',
  'oats-chips-peri-peri',
  'We believe snacking shouldn''t be a choice between a greasy bag of chips or a boring diet. By perfecting a roasted process, we created a snack that is fun, functional, & 100% guilt-free.',
  149, 199,
  ARRAY['https://res.cloudinary.com//image/upload/v1/grainzz/products/placeholder.jpg'],
  'Healthy Chips', 100, true,
  ARRAY['Jar', '150g'],
  'High-Fibre | No Palm Oil | Baked Crunch',
  'Oats, Peri Peri Seasoning, Rice Flour, Salt'
),
(
  'Quinoa Puffs – Classic Salt',
  'quinoa-puffs-classic-salt',
  'Light, airy puffs made from real quinoa. Packed with protein and bursting with classic salt flavor.',
  149, 199,
  ARRAY['https://res.cloudinary.com/dy9vdjxmm/image/upload/v1/grainzz/products/placeholder.jpg'],
  'Grain Puffs', 80, true,
  ARRAY['Jar', '100g'],
  'High Protein | Gluten Free | Puffed',
  'Quinoa, Salt, Rice Flour'
),
(
  'Bajra Chips – Masala',
  'bajra-chips-masala',
  'Traditional millets meet modern flavors. Bajra chips packed with fibre and iron.',
  129, 169,
  ARRAY['https://res.cloudinary.com/dy9vdjxmm/image/upload/v1/grainzz/products/placeholder.jpg'],
  'Healthy Chips', 60, false,
  ARRAY['Pouch', '120g'],
  'Iron Rich | High Fibre | Baked',
  'Bajra Flour, Masala Seasoning, Salt'
),
(
  'Ragi Chips – Cheese Onion',
  'ragi-chips-cheese-onion',
  'Finger millet power in every crunch. Bold cheese & onion flavor with the goodness of ragi.',
  139, 179,
  ARRAY['https://res.cloudinary.com/dy9vdjxmm/image/upload/v1/grainzz/products/placeholder.jpg'],
  'Healthy Chips', 75, true,
  ARRAY['Pouch', '130g'],
  'Calcium Rich | High Fibre | Baked',
  'Ragi Flour, Cheese Seasoning, Onion, Salt'
),
(
  'Essential Snack Box – Mixed',
  'essential-snack-box-mixed',
  'The ultimate combo pack for healthy snacking. Includes all our bestselling flavors.',
  499, 699,
  ARRAY['https://res.cloudinary.com/dy9vdjxmm/image/upload/v1/grainzz/products/placeholder.jpg'],
  'Combos', 30, true,
  ARRAY['Box', 'Bundle'],
  'Variety Pack | All Natural | No Preservatives',
  'Assorted Grainzz Products'
),
(
  'Grain Puff – Turmeric Ginger',
  'grain-puff-turmeric-ginger',
  'Ancient spices meet modern puffing. Anti-inflammatory snacking at its finest.',
  159, 199,
  ARRAY['https://res.cloudinary.com/dy9vdjxmm/image/upload/v1/grainzz/products/placeholder.jpg'],
  'Grain Puffs', 90, false,
  ARRAY['Jar', '100g'],
  'Anti-Inflammatory | Probiotic | Puffed',
  'Mixed Grains, Turmeric, Ginger, Salt'
);

-- Seed homepage sectionsdy9vdjxmm
INSERT INTO homepage_sections (section_type, title, product_ids, sort_order, is_active) VALUES
('bestsellers', 'Best Sellers', '{}', 1, true),
('featured', 'Featured Products', '{}', 2, true),
('sale', 'On Sale', '{}', 3, true);
