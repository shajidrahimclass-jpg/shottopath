
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles WITH (security_invoker = on) AS
  SELECT id, username, role FROM profiles;
GRANT SELECT ON public.public_profiles TO anon, authenticated;
