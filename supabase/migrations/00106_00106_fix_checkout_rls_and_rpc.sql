
-- ── 1. Fix orders INSERT policy ──────────────────────────────────────────────
-- Drop the broken policy and replace with one that handles:
--   (a) logged-in user order  → user_id = auth.uid()
--   (b) guest order           → user_id IS NULL (no auth required)
DROP POLICY IF EXISTS "Users and guests can create orders" ON public.orders;

CREATE POLICY "Users and guests can create orders"
  ON public.orders
  FOR INSERT
  TO public
  WITH CHECK (
    -- Logged-in user placing their own order
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    -- Guest order: no user_id, no auth needed
    (auth.uid() IS NULL AND user_id IS NULL)
    OR
    -- Logged-in user can also place as guest (e.g. gift)
    (auth.uid() IS NOT NULL AND user_id IS NULL AND guest_email IS NOT NULL)
  );

-- ── 2. Atomic checkout RPC (SECURITY DEFINER = bypasses RLS safely) ──────────
CREATE OR REPLACE FUNCTION public.process_checkout(
  p_order  jsonb,
  p_items  jsonb,
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_item     jsonb;
  v_subtotal numeric;
  v_delivery numeric;
  v_discount numeric;
  v_total    numeric;
BEGIN
  -- Cast numeric fields safely
  v_subtotal := COALESCE((p_order->>'subtotal')::numeric, 0);
  v_delivery := COALESCE((p_order->>'delivery_charge')::numeric, 0);
  v_discount := COALESCE((p_order->>'discount')::numeric, 0);
  v_total    := COALESCE((p_order->>'total')::numeric, v_subtotal + v_delivery - v_discount);

  -- Insert order
  INSERT INTO public.orders (
    user_id, status, payment_method, payment_amount, payment_details,
    transaction_id, subtotal, delivery_charge, discount, total,
    delivery_address, delivery_location_id, voucher_code, notes,
    gift_card_email, guest_email, guest_name, guest_phone, disappearing_chat
  )
  VALUES (
    p_user_id,
    'pending',
    p_order->>'payment_method',
    CASE WHEN p_order->>'payment_amount' IS NOT NULL THEN (p_order->>'payment_amount')::numeric END,
    p_order->'payment_details',
    p_order->>'transaction_id',
    v_subtotal, v_delivery, v_discount, v_total,
    p_order->>'delivery_address',
    CASE WHEN p_order->>'delivery_location_id' IS NOT NULL THEN (p_order->>'delivery_location_id')::uuid END,
    p_order->>'voucher_code',
    p_order->>'notes',
    p_order->>'gift_card_email',
    p_order->>'guest_email',
    p_order->>'guest_name',
    p_order->>'guest_phone',
    COALESCE((p_order->>'disappearing_chat')::boolean, false)
  )
  RETURNING id INTO v_order_id;

  -- Insert each order item and decrement stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (
      order_id, product_id, product_name, product_price,
      quantity, selected_color, selected_size
    )
    VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_item->>'product_name',
      (v_item->>'product_price')::numeric,
      (v_item->>'quantity')::integer,
      v_item->>'selected_color',
      v_item->>'selected_size'
    );

    -- Atomic stock decrement
    UPDATE public.products
    SET stock = GREATEST(0, stock - (v_item->>'quantity')::integer)
    WHERE id = (v_item->>'product_id')::uuid;
  END LOOP;

  RETURN jsonb_build_object('order_id', v_order_id);
END;
$$;

-- Allow any role (anon + authenticated) to call it
GRANT EXECUTE ON FUNCTION public.process_checkout(jsonb, jsonb, uuid) TO anon, authenticated;
