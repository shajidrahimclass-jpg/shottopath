
-- Enable RLS on gift_card_templates
ALTER TABLE public.gift_card_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can read active templates (it's display/catalog data)
CREATE POLICY "Anyone can view active gift card templates"
  ON public.gift_card_templates
  FOR SELECT
  TO public
  USING (is_active = true);

-- Only admins can manage templates
CREATE POLICY "Admins can manage gift card templates"
  ON public.gift_card_templates
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
