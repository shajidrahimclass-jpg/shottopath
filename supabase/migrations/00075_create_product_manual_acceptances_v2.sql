
-- Table to track when users accept product-specific user manuals
CREATE TABLE product_manual_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  page_source text NOT NULL DEFAULT 'unknown',
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE product_manual_acceptances ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION can_insert_product_manual_acceptance(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.uid() = p_user_id;
$$;

CREATE OR REPLACE FUNCTION can_select_product_manual_acceptance(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.uid() = p_user_id;
$$;

-- Policies
CREATE POLICY "users_can_insert_own_manual_acceptance"
  ON product_manual_acceptances
  FOR INSERT
  TO authenticated
  WITH CHECK (can_insert_product_manual_acceptance(user_id));

CREATE POLICY "users_can_select_own_manual_acceptance"
  ON product_manual_acceptances
  FOR SELECT
  TO authenticated
  USING (can_select_product_manual_acceptance(user_id));

-- Admin full access
CREATE POLICY "admins_can_manage_product_manual_acceptances"
  ON product_manual_acceptances
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
