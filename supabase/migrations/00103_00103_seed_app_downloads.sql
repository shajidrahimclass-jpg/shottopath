
INSERT INTO app_downloads (platform, title, description, link_url, file_url, version, file_size, is_active, display_order)
VALUES
  (
    'apk',
    'Shottopath Android App',
    'Download the official Shottopath app for Android. Shop faster, track orders, and get exclusive deals.',
    NULL,
    'https://raw.githubusercontent.com/shajidrahimclass-jpg/shottopath/main/tasks/shottopath.apk',
    '1.0.0',
    NULL,
    true,
    1
  )
ON CONFLICT DO NOTHING;
