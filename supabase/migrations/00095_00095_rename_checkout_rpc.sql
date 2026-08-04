DROP FUNCTION IF EXISTS process_checkout;
CREATE OR REPLACE FUNCTION process_checkout(
  p_order jsonb,
  p_items jsonb,
  p_user_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_product_stock integer;
  v_result jsonb;
BEGIN
  -- Insert order
  INSERT INTO orders (
    user_id, 
    delivery_location_id, 
    status, 
    subtotal, 
    delivery_charge, 
    discount, 
    total, 
    payment_method, 
    payment_amount,
    payment_details,
    transaction_id,
    voucher_code,
    notes,
    gift_card_email,
    delivery_address,
    guest_email,
    guest_name,
    guest_phone
  ) VALUES (
    p_user_id,
    (p_order->>'delivery_location_id')::uuid,
    'pending',
    (p_order->>'subtotal')::numeric,
    (p_order->>'delivery_charge')::numeric,
    (p_order->>'discount')::numeric,
    (p_order->>'total')::numeric,
    p_order->>'payment_method',
    p_order->>'payment_amount',
    p_order->>'payment_details',
    p_order->>'transaction_id',
    p_order->>'voucher_code',
    p_order->>'notes',
    p_order->>'gift_card_email',
    p_order->'delivery_address',
    p_order->>'guest_email',
    p_order->>'guest_name',
    p_order->>'guest_phone'
  ) RETURNING id INTO v_order_id;

  -- Insert items and update stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Get current stock with row lock
    SELECT stock INTO v_product_stock FROM products WHERE id = (v_item->>'product_id')::uuid FOR UPDATE;
    
    IF v_product_stock IS NULL THEN
      RAISE EXCEPTION 'Product not found: %', v_item->>'product_id';
    END IF;

    IF v_product_stock < (v_item->>'quantity')::integer THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item->>'product_id';
    END IF;

    -- Update stock
    UPDATE products 
    SET stock = stock - (v_item->>'quantity')::integer
    WHERE id = (v_item->>'product_id')::uuid;

    -- Insert order item
    INSERT INTO order_items (
      order_id, 
      product_id, 
      product_name,
      product_price,
      quantity, 
      selected_color,
      selected_size
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_item->>'product_name',
      (v_item->>'product_price')::numeric,
      (v_item->>'quantity')::integer,
      v_item->>'selected_color',
      v_item->>'selected_size'
    );
  END LOOP;

  SELECT json_build_object(
    'order', json_build_object('id', v_order_id)
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

NOTIFY pgrst, 'reload schema';
