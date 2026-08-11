
-- Fix order_items INSERT: allow both authenticated users (their own orders) and guests (orders with no user_id)
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
CREATE POLICY "Users and guests can create order items"
  ON order_items FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (
          -- authenticated user's own order
          (auth.uid() IS NOT NULL AND orders.user_id = auth.uid())
          OR
          -- guest order (no user_id)
          (auth.uid() IS NULL AND orders.user_id IS NULL)
        )
    )
  );

-- Fix order_items SELECT: allow guests to read items for their orders (matched by order_id)
DROP POLICY IF EXISTS "Service role can read order_items" ON order_items;
CREATE POLICY "Anyone can view order items they own"
  ON order_items FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (
          (auth.uid() IS NOT NULL AND (orders.user_id = auth.uid() OR is_admin(auth.uid())))
          OR
          (auth.uid() IS NULL AND orders.user_id IS NULL)
        )
    )
  );

-- Fix orders SELECT: allow guests to read back their own guest order right after insert
DROP POLICY IF EXISTS "Users and guests can view their orders" ON orders;
CREATE POLICY "Users and guests can view their orders"
  ON orders FOR SELECT
  TO public
  USING (
    auth.uid() = user_id
    OR is_admin(auth.uid())
    OR (auth.uid() IS NULL AND user_id IS NULL)
  );
