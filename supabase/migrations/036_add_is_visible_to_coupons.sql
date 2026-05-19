-- Add is_visible column to coupons table
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true;
