-- ============================================================================
-- Payment Webhooks Audit Table + Order Payment Enhancements
-- ============================================================================

-- 1. PAYMENT WEBHOOKS TABLE (for idempotent webhook processing)
CREATE TABLE IF NOT EXISTS payment_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'phonepe',
  event_type TEXT NOT NULL DEFAULT '',
  external_id TEXT NOT NULL DEFAULT '',
  payload JSONB DEFAULT '{}',
  processed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint for idempotency (same provider + external_id + event = skip)
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_webhooks_unique
  ON payment_webhooks(provider, external_id, event_type);

-- RLS
ALTER TABLE payment_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access on payment_webhooks" ON payment_webhooks
  FOR ALL USING (is_admin());
-- Service role (used by API routes) bypasses RLS

-- 2. ADD PAYMENT COLUMNS TO ORDERS
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phonepe_order_id TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10,2) DEFAULT 0;

-- Index for merchantOrderId lookups (already used heavily)
CREATE INDEX IF NOT EXISTS idx_orders_merchant_txn ON orders(merchant_transaction_id);
