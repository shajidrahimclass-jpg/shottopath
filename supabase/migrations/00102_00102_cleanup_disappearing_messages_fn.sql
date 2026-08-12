
-- SECURITY DEFINER so any authenticated user (user or admin) can trigger cleanup
-- for orders they own, without needing direct DELETE RLS on order_messages
CREATE OR REPLACE FUNCTION public.cleanup_disappearing_messages(
  p_order_id uuid,
  p_before_timestamp timestamptz
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow if caller owns the order or is admin
  IF NOT (
    EXISTS (SELECT 1 FROM public.orders WHERE id = p_order_id AND user_id = auth.uid())
    OR public.is_admin(auth.uid())
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  DELETE FROM public.order_messages
  WHERE order_id = p_order_id
    AND created_at < p_before_timestamp;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_disappearing_messages(uuid, timestamptz) TO authenticated;
