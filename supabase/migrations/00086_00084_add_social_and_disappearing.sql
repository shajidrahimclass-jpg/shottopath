ALTER TABLE orders ADD COLUMN IF NOT EXISTS disappearing_chat boolean DEFAULT false;

ALTER TABLE app_settings 
ADD COLUMN IF NOT EXISTS social_facebook text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS social_twitter text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS social_instagram text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS social_youtube text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS social_whatsapp text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS social_tiktok text DEFAULT NULL;