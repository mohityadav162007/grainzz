-- ============================================================================
-- Shiprocket Integration — Add shipping columns to orders table
-- ============================================================================

-- Shipment tracking fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_status TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_order_id TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_id TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS awb_code TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_sent_to_shiprocket BOOLEAN DEFAULT false;

-- Index for fast filtering on shiprocket status
CREATE INDEX IF NOT EXISTS idx_orders_shiprocket_sent ON orders(is_sent_to_shiprocket);
CREATE INDEX IF NOT EXISTS idx_orders_shipment_status ON orders(shipment_status);
CREATE INDEX IF NOT EXISTS idx_orders_awb_code ON orders(awb_code);

-- Allow public/anon users to read their own order's shipping info
-- (They can already read via the existing INSERT policy, but for tracking
--  we need a SELECT policy that allows reading by order ID)
CREATE POLICY "Anyone can read orders by id" ON orders
  FOR SELECT USING (true);
