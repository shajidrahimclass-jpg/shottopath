
-- Drop and fully recreate process_checkout to force PostgREST schema cache reload
DROP FUNCTION IF EXISTS public.process_checkout(jsonb, jsonb, uuid);
DROP FUNCTION IF EXISTS public.process_checkout(p_order jsonb, p_items jsonb, p_user_id uuid);

CREATE OR REPLACE FUNCTION public.process_checkout(
  p_order   jsonb,
  p_items   jsonb,
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_order    orders%ROWTYPE;
  v_item     jsonb;
  v_stock    int;
BEGIN
  -- Insert order
  INSERT INTO orders (
    user_id,
    status,
    payment_method,
    payment_status,
    payment_amount,
    payment_details,
    transaction_id,
    subtotal,
    delivery_charge,
    discount,
    total,
    delivery_address,
    delivery_location_id,
    voucher_code,
    notes,
    gift_card_email,
    guest_email,
    guest_name,
    guest_phone,
    disappearing_chat
  )
  SELECT
    p_user_id,
    COALESCE((p_order->>'status')::order_status, 'pending'),
    p_order->>'payment_method',
    COALESCE((p_order->>'payment_status')::payment_status, 'pending'),
    CASE WHEN p_order->>'payment_amount' IS NOT NULL THEN (p_order->>'payment_amount')::numeric ELSE NULL END,
    p_order->'payment_details',
    p_order->>'transaction_id',
    (p_order->>'subtotal')::numeric,
    COALESCE((p_order->>'delivery_charge')::numeric, 0),
    COALESCE((p_order->>'discount')::numeric, 0),
    (p_order->>'total')::numeric,
    p_order->'delivery_address',
    CASE WHEN p_order->>'delivery_location_id' IS NOT NULL THEN (p_order->>'delivery_location_id')::uuid ELSE NULL END,
    p_order->>'voucher_code',
    p_order->>'notes',
    p_order->>'gift_card_email',
    p_order->>'guest_email',
    p_order->>'guest_name',
    p_order->>'guest_phone',
    COALESCE((p_order->>'disappearing_chat')::boolean, false)
  RETURNING id INTO v_order_id;

  -- Insert order items and update stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Check stock
    SELECT stock INTO v_stock FROM products WHERE id = (v_item->>'product_id')::uuid FOR UPDATE;
    IF v_stock < (v_item->>'quantity')::int THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item->>'product_name';
    END IF;

    INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_item->>'product_name',
      (v_item->>'product_price')::numeric,
      (v_item->>'quantity')::int
    );

    UPDATE products
    SET stock = stock - (v_item->>'quantity')::int
    WHERE id = (v_item->>'product_id')::uuid;
  END LOOP;

  -- Return the created order
  SELECT * INTO v_order FROM orders WHERE id = v_order_id;
  RETURN json_build_object('order', row_to_json(v_order));
END;
$$;

-- Grant execute to anon and authenticated so PostgREST can expose it
GRANT EXECUTE ON FUNCTION public.process_checkout(jsonb, jsonb, uuid) TO anon, authenticated;

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
