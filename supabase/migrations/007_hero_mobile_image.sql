-- Add mobile_image_url column to hero_slides
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS mobile_image_url TEXT DEFAULT '';
