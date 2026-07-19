
-- 1. Allow public to read usernames from profiles (for review author display)
CREATE POLICY "Public can view usernames" ON profiles
FOR SELECT TO public
USING (true);

-- 2. Seed delivery_locations with Bangladesh delivery zones
INSERT INTO delivery_locations (name, charge, min_days, max_days, duration, payment_methods) VALUES
  ('Dhaka City', 60, 1, 2, '1-2 days', ARRAY['cash_on_delivery', 'bkash', 'nagad']),
  ('Dhaka Suburb', 80, 2, 3, '2-3 days', ARRAY['cash_on_delivery', 'bkash', 'nagad']),
  ('Chittagong', 120, 2, 4, '2-4 days', ARRAY['cash_on_delivery', 'bkash', 'nagad']),
  ('Sylhet', 120, 3, 5, '3-5 days', ARRAY['cash_on_delivery', 'bkash', 'nagad']),
  ('Rajshahi', 120, 3, 5, '3-5 days', ARRAY['cash_on_delivery', 'bkash', 'nagad']),
  ('Khulna', 120, 3, 5, '3-5 days', ARRAY['cash_on_delivery', 'bkash', 'nagad']),
  ('Barisal', 130, 3, 5, '3-5 days', ARRAY['cash_on_delivery', 'bkash', 'nagad']),
  ('Mymensingh', 100, 2, 4, '2-4 days', ARRAY['cash_on_delivery', 'bkash', 'nagad']),
  ('Rangpur', 130, 3, 5, '3-5 days', ARRAY['cash_on_delivery', 'bkash', 'nagad']),
  ('Outside Bangladesh', 500, 7, 14, '7-14 days', ARRAY['bkash', 'nagad']);

-- 3. Seed payment_gateways
INSERT INTO payment_gateways (name, is_enabled, config) VALUES
  ('Cash on Delivery', true, '{}'::jsonb),
  ('bKash', true, '{"account_number": ""}'::jsonb),
  ('Nagad', true, '{"account_number": ""}'::jsonb);
