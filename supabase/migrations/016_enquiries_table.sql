-- ============================================================================
-- Enquiries / Contact Form Submissions
-- ============================================================================

CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  subject TEXT NOT NULL,
  order_id TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an enquiry (public form)
CREATE POLICY "Anyone can submit enquiries" ON enquiries
  FOR INSERT WITH CHECK (true);

-- Only admins can read/manage enquiries
CREATE POLICY "Admin full access on enquiries" ON enquiries
  FOR ALL USING (is_admin());

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
