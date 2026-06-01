-- Add free_shipping column to coupons table
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS free_shipping boolean DEFAULT false;
