
-- Allow authenticated users to insert their own notifications
CREATE POLICY "Authenticated users can insert own notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow service/anon to insert notifications with null user_id (guest orders)
CREATE POLICY "Anyone can insert guest notifications"
  ON notifications FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);
