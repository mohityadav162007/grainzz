-- Add per-product package dimension columns for Shiprocket shipping
-- These replace the hardcoded 15x15x10 / 0.5kg defaults

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS package_length NUMERIC DEFAULT 15,
  ADD COLUMN IF NOT EXISTS package_breadth NUMERIC DEFAULT 15,
  ADD COLUMN IF NOT EXISTS package_height NUMERIC DEFAULT 10,
  ADD COLUMN IF NOT EXISTS package_weight NUMERIC DEFAULT 0.5;

COMMENT ON COLUMN products.package_length IS 'Package length in cm for Shiprocket';
COMMENT ON COLUMN products.package_breadth IS 'Package breadth/width in cm for Shiprocket';
COMMENT ON COLUMN products.package_height IS 'Package height in cm for Shiprocket';
COMMENT ON COLUMN products.package_weight IS 'Package weight in kg for Shiprocket';
