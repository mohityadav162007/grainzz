-- ============================================================================
-- Grainzz Homepage Dynamic Content Tables
-- ============================================================================

-- 1. SITE CONTENT (key-value store for misc content)
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. HERO SLIDES
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT DEFAULT '',
  top_line TEXT NOT NULL DEFAULT '',
  headline TEXT NOT NULL,
  subheadline TEXT DEFAULT '',
  cta_text TEXT DEFAULT 'Shop Now',
  cta_href TEXT DEFAULT '/products',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TRUST METRICS
CREATE TABLE IF NOT EXISTS trust_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon TEXT DEFAULT 'Heart',
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- 4. BENEFITS
CREATE TABLE IF NOT EXISTS benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon TEXT DEFAULT 'Leaf',
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- 5. AVAILABILITY LOGOS
CREATE TABLE IF NOT EXISTS availability_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT DEFAULT '',
  href TEXT DEFAULT '#',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- 6. TESTIMONIALS
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  role TEXT DEFAULT '',
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. INSTAGRAM POSTS
CREATE TABLE IF NOT EXISTS instagram_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  href TEXT DEFAULT '#',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- 8. FAQS
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- SITE CONTENT
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read site content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Admin full access on site content" ON site_content FOR ALL USING (is_admin());

-- HERO SLIDES
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active hero slides" ON hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on hero slides" ON hero_slides FOR ALL USING (is_admin());

-- TRUST METRICS
ALTER TABLE trust_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active trust metrics" ON trust_metrics FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on trust metrics" ON trust_metrics FOR ALL USING (is_admin());

-- BENEFITS
ALTER TABLE benefits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active benefits" ON benefits FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on benefits" ON benefits FOR ALL USING (is_admin());

-- AVAILABILITY LOGOS
ALTER TABLE availability_logos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active logos" ON availability_logos FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on logos" ON availability_logos FOR ALL USING (is_admin());

-- TESTIMONIALS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active testimonials" ON testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on testimonials" ON testimonials FOR ALL USING (is_admin());

-- INSTAGRAM POSTS
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active instagram posts" ON instagram_posts FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on instagram posts" ON instagram_posts FOR ALL USING (is_admin());

-- FAQS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active faqs" ON faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on faqs" ON faqs FOR ALL USING (is_admin());

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================
CREATE TRIGGER site_content_updated_at BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER hero_slides_updated_at BEFORE UPDATE ON hero_slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SEED: HOMEPAGE CONTENT FROM MASTER CONTENT DOCUMENT
-- ============================================================================

-- Announcement Bar
INSERT INTO site_content (key, value) VALUES
('announcement_bar', '{"text": "Choose better snacking this season – now shipping PAN India 🇮🇳"}'),
('benefits_heading', '{"heading": "Healthy Snacking With Benefits That Truly Matter", "intro": "Every Grainzz snack is built to give you bold flavour, better ingredients and a lighter snacking experience — without making healthy feel boring."}'),
('product_tabs_heading', '{"heading": "Explore the Grainzz Snack Range", "subheading": "From supergrain jars to puffed rice packets and value-packed combos, discover snacks made for every craving and every kind of muncher."}'),
('combo_section', '{"heading": "Best Value Combos to Start With", "cta_text": "Shop Combo Offers", "cta_href": "/combos"}'),
('featured_product', '{"slug": "essential-snack-box-mixed", "heading": "The Supergrain Starter Box", "supporting_line": "High Fibre | No Palm Oil | Gluten-Free | Zero Cholesterol", "free_gift_message": "🎁 Includes 3 puffed rice packets inside (Tandoori Masala, Royal Mint Blast, Creamy Onion Bliss)", "description": "The ultimate Grainzz experience. Great for trying all our favourite flavours in one go.", "cta_text": "Build Your Starter Box"}'),
('footer_subscribe', '{"heading": "Get First Access to Offers, New Launches and Snack Deals", "cta_text": "Subscribe"}'),
('instagram_section', '{"heading": "See How India is Snacking Better with Grainzz", "handle": "@grainzzbyvitalicious", "hashtag": "#GrainzzSnacks"}')
ON CONFLICT (key) DO NOTHING;

-- Hero Slides (5 slides from master content)
INSERT INTO hero_slides (top_line, headline, subheadline, cta_text, cta_href, sort_order) VALUES
('Up to 40% OFF', 'Power of Real Grains for Better Snacking', 'Discover bold, light and satisfying snacks made with millets, real ingredients and no palm oil.', 'Shop Bestsellers', '/products', 1),
('Made for Modern Indian Snacking', 'Not Junk. Not Boring. Just Grainzz.', 'Supergrain snacks that bring together crunch, flavour and feel-good ingredients in every bite.', 'Explore the Range', '/products', 2),
('More Grains, More Value', 'Better Snacking Now and Forever', 'Get more of your favourites in our specially curated boxes and jar combos.', 'Shop Combos', '/combos', 3),
('Starter Combo Offer', 'Build Your Healthy Snack Shelf in One Box', 'Try our bestselling supergrain combo and get 3 puffed rice packets inside for extra crunch.', 'Shop Combo Packs', '/combos', 4),
('Light Snacking, Big Flavour', 'Puffed Rice, Reimagined for Everyday Munching', 'Tandoori Masala, Royal Mint Blast and Creamy Onion Bliss in easy snack combos starting at just ₹54.', 'Try Puffed Rice Combos', '/products?category=Puffed+Rice', 5);

-- Trust Metrics
INSERT INTO trust_metrics (icon, value, label, sort_order) VALUES
('Heart', '5000+', 'customers served', 1),
('Package', '30,000+', 'products sold', 2),
('ShieldCheck', '15,000+', 'packets sold', 3),
('MapPin', '29+', 'Indian states served', 4);

-- Benefits
INSERT INTO benefits (icon, title, description, sort_order) VALUES
('Droplets', 'No Palm Oil. No Compromise.', 'We skip palm oil for cleaner, lighter snacks. Every bite is free from the heavy, greasy feeling you get with conventional chips.', 1),
('Wheat', 'Powered by Real Millets & Grains', 'Ragi, bajra, quinoa, jowar, and oats — we use real supergrains for more substance, more fibre, and more nutrition in every pack.', 2),
('Flame', 'Bold Indian Flavours', 'Modern takes on beloved desi flavours — Royal Mint, Tandoori Masala, and Zesty Chilli — that make healthy snacking genuinely exciting.', 3),
('Feather', 'Lightness You Can Feel', 'No heavy after-feeling. Just light, crunchy snacks designed for whenever hunger strikes — guilt-free from the first bite to the last.', 4);

-- Availability Logos
INSERT INTO availability_logos (name, logo_url, href, sort_order) VALUES
('Amazon', '', 'https://www.amazon.in', 1),
('Blinkit', '', 'https://blinkit.com', 2),
('MyStore', '', 'https://mystore.in', 3);

-- Testimonials (from master content)
INSERT INTO testimonials (text, author, role, rating, sort_order) VALUES
('Loved the flavour and crunch. It doesn''t feel like regular oily chips at all. The Ragi Chips are my absolute favourite — spicy but not overwhelming. Will definitely reorder!', 'Aarav Mehta', 'Verified Buyer', 5, 1),
('Finally found a snack that''s light but hits the flavour spot. Tandoori Masala puffed rice is my absolute favorite. Great for evening cravings without the guilt.', 'Priya S.', 'Health Enthusiast', 5, 2),
('A perfect way to try everything Grainzz has to offer. The starter box has become my go-to office snack. Love the variety and the fact that it comes with free puffed rice!', 'Rohan G.', 'Fitness Enthusiast', 5, 3);

-- FAQs (from master content)
INSERT INTO faqs (question, answer, sort_order) VALUES
('What makes Grainzz different from regular snacks?', 'Most snacks are deep fried and made from refined flour. At Grainzz, we use supergrain ingredients like ragi, bajra, quinoa and jowar — and we never use palm oil. Our snacks are crafted to be lighter, cleaner, and better for you without compromising on flavour or crunch.', 1),
('Are Grainzz snacks actually healthy?', 'Yes! Grainzz snacks are a better alternative to junk food. Made from real millets and grains, they offer a cleaner calorie profile with higher fibre, zero cholesterol, and no palm oil. They''re not diet food — they''re smarter snacking.', 2),
('Which combo should I try first?', 'We recommend The Supergrain Starter Box — it includes our top 4 jar flavours plus 3 free puffed rice packets (Tandoori Masala, Royal Mint Blast, Creamy Onion Bliss). It''s the best way to experience everything Grainzz has to offer.', 3),
('How long does delivery take?', 'Orders are typically delivered within 3 to 6 working days across India. We ship PAN India and you''ll receive tracking details once your order is dispatched.', 4),
('Do you offer free shipping?', 'Yes! We offer free shipping on orders above ₹499. Below that, a nominal shipping charge applies.', 5);
