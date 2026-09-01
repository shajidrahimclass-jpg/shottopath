
-- Drop all variants to start clean
DROP FUNCTION IF EXISTS public.submit_order(text, text, uuid);
DROP FUNCTION IF EXISTS public.submit_order(jsonb, jsonb, uuid);
DROP FUNCTION IF EXISTS public.checkout_order(jsonb, jsonb, uuid);
DROP FUNCTION IF EXISTS public.process_checkout(jsonb, jsonb, uuid);

-- Recreate with jsonb params — PostgREST resolves by name not position,
-- so naming them distinctly (not matching any column) avoids schema cache conflicts.
CREATE OR REPLACE FUNCTION public.submit_order(
  p_order    jsonb,
  p_items    jsonb,
  p_user_id  uuid DEFAULT NULL
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
  v_payment_amount text;
BEGIN
  v_subtotal       := COALESCE((p_order->>'subtotal')::numeric, 0);
  v_delivery       := COALESCE((p_order->>'delivery_charge')::numeric, 0);
  v_discount       := COALESCE((p_order->>'discount')::numeric, 0);
  v_total          := COALESCE((p_order->>'total')::numeric, v_subtotal + v_delivery - v_discount);
  v_payment_amount := p_order->>'payment_amount';

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
    CASE WHEN v_payment_amount IS NOT NULL AND v_payment_amount <> ''
         THEN v_payment_amount END,
    p_order->>'payment_details',
    p_order->>'transaction_id',
    v_subtotal, v_delivery, v_discount, v_total,
    p_order->'delivery_address',
    CASE WHEN (p_order->>'delivery_location_id') IS NOT NULL AND (p_order->>'delivery_location_id') <> ''
         THEN (p_order->>'delivery_location_id')::uuid END,
    p_order->>'voucher_code',
    p_order->>'notes',
    p_order->>'gift_card_email',
    p_order->>'guest_email',
    p_order->>'guest_name',
    p_order->>'guest_phone',
    COALESCE((p_order->>'disappearing_chat')::boolean, false)
  )
  RETURNING id INTO v_order_id;

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
      NULLIF(v_item->>'selected_color', ''),
      NULLIF(v_item->>'selected_size', '')
    );

    UPDATE public.products
    SET stock = GREATEST(0, stock - (v_item->>'quantity')::integer)
    WHERE id = (v_item->>'product_id')::uuid;
  END LOOP;

  RETURN jsonb_build_object('order_id', v_order_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_order(jsonb, jsonb, uuid) TO anon, authenticated;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
