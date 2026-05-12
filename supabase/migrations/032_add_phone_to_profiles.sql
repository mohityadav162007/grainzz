-- Add phone column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update the sync trigger to include phone
CREATE OR REPLACE FUNCTION public.handle_user_sync()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.profiles (id, email, full_name, phone)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', '')
    );
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE public.profiles
    SET 
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', profiles.full_name),
      phone = COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', profiles.phone),
      email = NEW.email,
      updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
