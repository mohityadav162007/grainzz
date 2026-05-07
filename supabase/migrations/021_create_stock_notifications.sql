-- ============================================================================
-- Create stock notification requests table
-- ============================================================================

CREATE TABLE IF NOT EXISTS stock_notification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE stock_notification_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (users requesting notifications)
CREATE POLICY "Allow public inserts on stock_notification_requests" 
ON stock_notification_requests FOR INSERT TO public 
WITH CHECK (true);

-- Allow authenticated users (admin) to read
CREATE POLICY "Allow authenticated reads on stock_notification_requests" 
ON stock_notification_requests FOR SELECT TO authenticated 
USING (true);
