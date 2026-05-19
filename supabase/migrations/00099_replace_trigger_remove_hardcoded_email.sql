-- Replace handle_new_user trigger: no hardcoded emails.
-- All new sign-ups get 'user' role by default.
-- Admins are promoted manually through the admin panel.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _username TEXT;
  _name     TEXT;
BEGIN
  _username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'preferred_username'), ''),
    NULLIF(TRIM(SPLIT_PART(NEW.email, '@', 1)), ''),
    'user_' || SUBSTRING(NEW.id::TEXT, 1, 8)
  );

  -- Ensure username uniqueness
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = _username) THEN
    _username := _username || '_' || SUBSTRING(NEW.id::TEXT, 1, 4);
  END IF;

  _name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    _username
  );

  INSERT INTO public.profiles (id, email, username, name, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    _username,
    _name,
    _name,
    NEW.phone,
    'user'::public.user_role
  )
  ON CONFLICT (id) DO UPDATE
    SET
      email     = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      name      = COALESCE(EXCLUDED.name,      public.profiles.name),
      phone     = COALESCE(EXCLUDED.phone,     public.profiles.phone),
      -- Never downgrade an existing admin
      role      = CASE
                    WHEN public.profiles.role = 'admin'::public.user_role THEN 'admin'::public.user_role
                    ELSE EXCLUDED.role
                  END;

  RETURN NEW;
END;
$$;