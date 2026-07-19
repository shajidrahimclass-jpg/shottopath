
-- ── app-files bucket: add missing INSERT, UPDATE, DELETE policies ──────────
CREATE POLICY "Authenticated users can upload app files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'app-files');

CREATE POLICY "Authenticated users can update app files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'app-files')
  WITH CHECK (bucket_id = 'app-files');

CREATE POLICY "Authenticated users can delete app files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'app-files');

-- ── invoice-logos bucket: add missing INSERT, UPDATE, DELETE policies ──────
CREATE POLICY "Authenticated users can upload invoice logos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'invoice-logos');

CREATE POLICY "Authenticated users can update invoice logos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'invoice-logos')
  WITH CHECK (bucket_id = 'invoice-logos');

CREATE POLICY "Authenticated users can delete invoice logos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'invoice-logos');
