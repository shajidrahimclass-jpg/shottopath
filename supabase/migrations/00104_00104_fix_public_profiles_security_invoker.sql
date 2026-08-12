
-- Drop and recreate with security_invoker
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = on)
AS
  SELECT id, username, role
  FROM public.profiles;

-- Minimal grants
REVOKE ALL ON public.public_profiles FROM anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Confirm reloptions contains security_invoker
SELECT reloptions
FROM pg_class
WHERE relname = 'public_profiles' AND relkind = 'v';
