-- Drop and recreate storage policies with proper permissions
DROP POLICY IF EXISTS "Anyone can view gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete gallery images" ON storage.objects;

-- Recreate with more explicit policies
CREATE POLICY "Gallery images are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery-images');

CREATE POLICY "Anyone can upload to gallery"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'gallery-images');

CREATE POLICY "Anyone can update gallery images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'gallery-images');

CREATE POLICY "Anyone can delete from gallery"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'gallery-images');