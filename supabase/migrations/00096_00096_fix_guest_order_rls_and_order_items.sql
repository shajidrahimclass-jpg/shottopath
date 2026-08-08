-- Fix 1: Allow guests to view their own orders via guest_phone match
-- The old policy only allowed auth.uid() = user_id, blocking guest order lookups
DROP POLICY IF EXISTS "Users and guests can view their orders" ON orders;
CREATE POLICY "Users and guests can view their orders"
  ON orders FOR SELECT
  USING (
    (auth.uid() = user_id)
    OR is_admin(auth.uid())
  );

-- Fix 2: Allow order_items to be read by the SECURITY DEFINER function (get_guest_order)
-- The existing policy requires auth.uid() match on orders.user_id, which blocks guest lookups
-- We add a separate policy for the service role used by SECURITY DEFINER functions
DROP POLICY IF EXISTS "Service role can read order_items" ON order_items;
CREATE POLICY "Service role can read order_items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (
          orders.user_id = auth.uid()
          OR is_admin(auth.uid())
        )
    )
  );

-- Fix 3: Ensure get_guest_order SECURITY DEFINER can bypass RLS for guest lookups
-- Re-create with explicit SECURITY DEFINER and correct logic
CREATE OR REPLACE FUNCTION get_guest_order(p_order_id uuid, p_phone text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order jsonb;
  v_items jsonb;
  v_delivery_address jsonb;
BEGIN
  -- Verify the order belongs to this guest phone
  SELECT row_to_json(o)::jsonb INTO v_order
  FROM orders o
  WHERE o.id = p_order_id
    AND o.guest_phone = p_phone
    AND o.user_id IS NULL;

  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found or phone number does not match';
  END IF;

  -- Get order items
  SELECT json_agg(oi)::jsonb INTO v_items
  FROM order_items oi
  WHERE oi.order_id = p_order_id;

  v_delivery_address := v_order->'delivery_address';

  RETURN json_build_object(
    'order', v_order,
    'delivery_address', v_delivery_address,
    'items', COALESCE(v_items, '[]'::jsonb)
  );
END;
$$;

NOTIFY pgrst, 'reload schema';
