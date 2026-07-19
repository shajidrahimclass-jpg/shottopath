
-- ============================================================
-- COMPLETE GRANT FIX for all remaining tables
-- ============================================================

-- Notifications: authenticated read/insert (own), needed by triggers
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;

-- Delivery
GRANT SELECT, INSERT, UPDATE, DELETE ON public.delivery_addresses TO authenticated;
GRANT SELECT ON public.delivery_locations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.delivery_locations TO authenticated;

-- Payment gateways: public read (for checkout display)
GRANT SELECT ON public.payment_gateways TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.payment_gateways TO authenticated;

-- Reviews
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT ON public.review_responses TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.review_responses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.review_helpful_votes TO authenticated;

-- Wishlist
GRANT SELECT, INSERT, DELETE ON public.wishlist TO authenticated;

-- Recently viewed
GRANT SELECT, INSERT, DELETE ON public.recently_viewed TO authenticated;

-- Product bundles
GRANT SELECT ON public.product_bundles TO anon, authenticated;
GRANT SELECT ON public.product_bundle_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_bundles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_bundle_items TO authenticated;
GRANT SELECT ON public.suggested_bundles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.suggested_bundles TO authenticated;
GRANT SELECT ON public.bundle_analytics TO authenticated;
GRANT INSERT, UPDATE ON public.bundle_analytics TO authenticated;

-- Product options
GRANT SELECT ON public.product_options TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_options TO authenticated;

-- Chat / Order messages
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
GRANT SELECT, INSERT ON public.order_messages TO authenticated;

-- Quick replies (admin)
GRANT SELECT ON public.quick_replies TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quick_replies TO authenticated;

-- Admin notification preferences
GRANT SELECT, INSERT, UPDATE ON public.admin_notification_preferences TO authenticated;

-- App downloads
GRANT SELECT ON public.app_downloads TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_downloads TO authenticated;
GRANT SELECT, INSERT ON public.app_download_analytics TO authenticated;
GRANT SELECT, INSERT ON public.app_download_page_views TO anon, authenticated;

-- Invoice settings
GRANT SELECT ON public.invoice_settings TO authenticated;
GRANT INSERT, UPDATE ON public.invoice_settings TO authenticated;

-- Vouchers / Redeem codes
GRANT SELECT ON public.vouchers TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vouchers TO authenticated;
GRANT SELECT ON public.redeem_codes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.redeem_codes TO authenticated;

-- Refunds policy / Terms
GRANT SELECT ON public.refunds_policy TO anon, authenticated;
GRANT INSERT, UPDATE ON public.refunds_policy TO authenticated;
GRANT SELECT ON public.terms_and_conditions TO anon, authenticated;
GRANT INSERT, UPDATE ON public.terms_and_conditions TO authenticated;

-- Stock movements
GRANT SELECT ON public.stock_movements TO authenticated;
GRANT INSERT ON public.stock_movements TO authenticated;

-- Product user manual acceptances (old table)
GRANT SELECT, INSERT ON public.product_user_manual_acceptances TO authenticated;

-- Ensure sequences are usable
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
