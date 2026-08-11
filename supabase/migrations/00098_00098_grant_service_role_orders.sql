
-- Grant service_role full access to orders and order_items so Edge Function can insert
GRANT ALL ON TABLE public.orders TO service_role;
GRANT ALL ON TABLE public.order_items TO service_role;
GRANT ALL ON TABLE public.products TO service_role;
