
-- ============================================================
-- FIX: Grant table-level privileges to anon & authenticated
-- RLS policies already exist; these GRANTs are the missing piece
-- ============================================================

-- PUBLIC READ tables (anon + authenticated can SELECT)
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.banners TO anon, authenticated;
GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT SELECT ON public.user_manual TO anon, authenticated;

-- ORDERS: public can insert (guest checkout) + select own
GRANT SELECT, INSERT ON public.orders TO anon, authenticated;
GRANT UPDATE ON public.orders TO authenticated;

-- ORDER ITEMS: authenticated only
GRANT SELECT, INSERT ON public.order_items TO authenticated;

-- PROFILES: authenticated only
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- USER MANUAL ACCEPTANCES: authenticated
GRANT SELECT, INSERT ON public.user_manual_acceptances TO authenticated;

-- PRODUCT MANUAL ACCEPTANCES: authenticated
GRANT SELECT, INSERT ON public.product_manual_acceptances TO authenticated;

-- GIFT CARD TEMPLATES: public read
GRANT SELECT ON public.gift_card_templates TO anon, authenticated;

-- BANNERS: admin write (authenticated only, RLS restricts further)
GRANT INSERT, UPDATE, DELETE ON public.banners TO authenticated;

-- ADMIN-ONLY WRITE — RLS already restricts to admin role
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT UPDATE ON public.app_settings TO authenticated;

-- Also grant usage on sequences for INSERT operations
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
