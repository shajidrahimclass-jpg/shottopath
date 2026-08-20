
-- Drop and recreate submit_order with explicit parameter types to avoid
-- PostgREST schema cache resolving jsonb keys against table columns.
-- Using text params + explicit cast prevents the "column not found" error.
DROP FUNCTION IF EXISTS public.submit_order(jsonb, jsonb, uuid);

CREATE OR REPLACE FUNCTION public.submit_order(
  p_order    text,
  p_items    text,
  p_user_id  uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order    jsonb := p_order::jsonb;
  v_items    jsonb := p_items::jsonb;
  v_order_id uuid;
  v_item     jsonb;
  v_subtotal numeric;
  v_delivery numeric;
  v_discount numeric;
  v_total    numeric;
BEGIN
  v_subtotal := COALESCE((v_order->>'subtotal')::numeric, 0);
  v_delivery := COALESCE((v_order->>'delivery_charge')::numeric, 0);
  v_discount := COALESCE((v_order->>'discount')::numeric, 0);
  v_total    := COALESCE((v_order->>'total')::numeric, v_subtotal + v_delivery - v_discount);

  INSERT INTO public.orders (
    user_id, status, payment_method, payment_amount, payment_details,
    transaction_id, subtotal, delivery_charge, discount, total,
    delivery_address, delivery_location_id, voucher_code, notes,
    gift_card_email, guest_email, guest_name, guest_phone, disappearing_chat
  )
  VALUES (
    p_user_id,
    'pending',
    v_order->>'payment_method',
    CASE WHEN (v_order->>'payment_amount') IS NOT NULL
         THEN (v_order->>'payment_amount')::numeric END,
    v_order->'payment_details',
    v_order->>'transaction_id',
    v_subtotal, v_delivery, v_discount, v_total,
    v_order->>'delivery_address',
    CASE WHEN (v_order->>'delivery_location_id') IS NOT NULL
         THEN (v_order->>'delivery_location_id')::uuid END,
    v_order->>'voucher_code',
    v_order->>'notes',
    v_order->>'gift_card_email',
    v_order->>'guest_email',
    v_order->>'guest_name',
    v_order->>'guest_phone',
    COALESCE((v_order->>'disappearing_chat')::boolean, false)
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(v_items)
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

    UPDATE public.products
    SET stock = GREATEST(0, stock - (v_item->>'quantity')::integer)
    WHERE id = (v_item->>'product_id')::uuid;
  END LOOP;

  RETURN jsonb_build_object('order_id', v_order_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_order(text, text, uuid) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
