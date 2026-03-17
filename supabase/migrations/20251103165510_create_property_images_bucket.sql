/*
  # Create Property Images Storage Bucket

  1. New Storage Bucket
    - `property-images` - For property listing photos and images

  2. Security
    - Enable public access for reading property images (anyone can view listings)
    - Restrict uploads to authenticated users only (agents/agencies)
    - Users can upload to their own property folders
    - Users can manage their own property images

  3. Storage Policies
    - Public read access for all property images
    - Authenticated users can upload property images
    - Users can update/delete their own property images
*/

-- Create property images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('property-images', 'property-images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Property images storage policies

-- Allow public to view property images
CREATE POLICY "Public can view property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

-- Allow authenticated users to upload property images
CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images');

-- Allow users to update property images they uploaded
CREATE POLICY "Users can update their own property images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'property-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own property images
CREATE POLICY "Users can delete their own property images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
