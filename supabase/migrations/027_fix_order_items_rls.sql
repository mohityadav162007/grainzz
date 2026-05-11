-- Fix: Allow public access to order items by ID (consistent with orders policy in 018)
-- This ensures that when a user views their order details (via the public order ID policy), 
-- they can also see the items associated with that order.

CREATE POLICY "Anyone can read order items" ON order_items
  FOR SELECT USING (true);
