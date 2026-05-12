-- Update the trigger function to handle updates as well
CREATE OR REPLACE FUNCTION public.handle_user_sync()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE public.profiles
    SET 
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', profiles.full_name),
      email = NEW.email,
      updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger for both Insert and Update
CREATE TRIGGER on_auth_user_sync
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_sync();
