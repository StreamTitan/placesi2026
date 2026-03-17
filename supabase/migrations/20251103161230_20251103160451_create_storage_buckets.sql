/*
  # Create Storage Buckets for User Uploads

  1. New Storage Buckets
    - `avatars` - For user profile pictures and agent photos
    - `logos` - For agency and institution logos

  2. Security
    - Enable public access for reading uploaded images
    - Restrict uploads to authenticated users only
    - Users can upload their own files
    - Admin users can manage all files

  3. Storage Policies
    - Public read access for all images
    - Authenticated users can upload to their own folders
    - Users can update/delete their own files
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('logos', 'logos', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Avatar storage policies

-- Allow public to view avatars
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Logo storage policies

-- Allow public to view logos
CREATE POLICY "Public can view logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

-- Allow authenticated users to upload logos to their own folder
CREATE POLICY "Users can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own logos
CREATE POLICY "Users can update their own logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own logos
CREATE POLICY "Users can delete their own logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
