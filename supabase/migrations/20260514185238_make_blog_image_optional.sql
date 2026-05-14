-- Make featured_image_url optional in blogs table
ALTER TABLE public.blogs ALTER COLUMN featured_image_url DROP NOT NULL;
ALTER TABLE public.blogs ALTER COLUMN featured_image_url SET DEFAULT '';
