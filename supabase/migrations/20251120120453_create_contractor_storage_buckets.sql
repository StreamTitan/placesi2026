/*
  # Create Storage Buckets for Contractor Module

  ## Overview
  Creates storage buckets for contractor logos, portfolio images, and special offer banners.

  ## Buckets
  - contractor-logos: For company logos
  - contractor-portfolios: For portfolio/work images
  - contractor-banners: For special offer banners

  ## Security
  - Public read access for all buckets
  - Authenticated contractors can upload to their own folders
*/

-- Create contractor-logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('contractor-logos', 'contractor-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create contractor-portfolios bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('contractor-portfolios', 'contractor-portfolios', true)
ON CONFLICT (id) DO NOTHING;

-- Create contractor-banners bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('contractor-banners', 'contractor-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for contractor-logos
CREATE POLICY "Public can view contractor logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'contractor-logos');

CREATE POLICY "Authenticated users can upload contractor logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'contractor-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Contractors can update own logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'contractor-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Contractors can delete own logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'contractor-logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for contractor-portfolios
CREATE POLICY "Public can view contractor portfolios"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'contractor-portfolios');

CREATE POLICY "Authenticated users can upload portfolio images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'contractor-portfolios' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Contractors can update own portfolio images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'contractor-portfolios' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Contractors can delete own portfolio images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'contractor-portfolios' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for contractor-banners
CREATE POLICY "Public can view contractor banners"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'contractor-banners');

CREATE POLICY "Authenticated users can upload banners"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'contractor-banners' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Contractors can update own banners"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'contractor-banners' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Contractors can delete own banners"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'contractor-banners' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );