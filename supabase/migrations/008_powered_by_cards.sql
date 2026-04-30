-- 1. POWERED BY CARDS
CREATE TABLE IF NOT EXISTS powered_by_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  top_bg_color TEXT DEFAULT 'bg-[#C68356]',
  bottom_bg_color TEXT DEFAULT 'bg-[#FDECE7]',
  image_url TEXT DEFAULT '',
  link TEXT DEFAULT '#',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE powered_by_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active powered by cards" ON powered_by_cards FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on powered by cards" ON powered_by_cards FOR ALL USING (is_admin());

-- TRIGGER
CREATE TRIGGER powered_by_cards_updated_at BEFORE UPDATE ON powered_by_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- INITIAL SEED
INSERT INTO powered_by_cards (title, subtitle, top_bg_color, bottom_bg_color, image_url, link, sort_order) VALUES
('Vegetable Chips', 'upto 40% off', 'bg-[#C68356]', 'bg-[#FDECE7]', '/Rectangle-10@2x.png', '/collections/vegetable-chips', 1),
('Vegetable Chips', 'upto 40% off', 'bg-[#C68356]', 'bg-[#EEFCD3]', '/Rectangle-10@2x.png', '/collections/popped-chips', 2),
('Vegetable Chips', 'upto 40% off', 'bg-[#C68356]', 'bg-[#FDECE7]', '/Rectangle-10@2x.png', '/collections/grain-puffs', 3);
