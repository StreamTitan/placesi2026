/*
  # Create Profile Images Storage Bucket

  1. New Storage Bucket
    - `profile-images` - For user profile photos and avatars

  2. Security
    - Enable public access for reading profile images (anyone can view profiles)
    - Restrict uploads to authenticated users only (each user their own image)
    - Users can upload/update their own profile image
    - Users can delete their own profile image

  3. Storage Policies
    - Public read access for all profile images
    - Authenticated users can upload their own profile image
    - Users can update/delete their own profile image
*/

-- Create profile images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Profile images storage policies

-- Allow public to view profile images
CREATE POLICY "Public can view profile images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images');

-- Allow authenticated users to upload their own profile image
CREATE POLICY "Users can upload their own profile image"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own profile image
CREATE POLICY "Users can update their own profile image"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own profile image
CREATE POLICY "Users can delete their own profile image"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
