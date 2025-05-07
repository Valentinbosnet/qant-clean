-- Créer un bucket pour les avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre aux utilisateurs authentifiés de lire les avatars
CREATE POLICY "Les avatars sont accessibles à tous" ON storage.objects
FOR SELECT
USING (bucket_id = 'profiles');

-- Politique pour permettre aux utilisateurs de télécharger leurs propres avatars
CREATE POLICY "Les utilisateurs peuvent télécharger leurs propres avatars" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = SPLIT_PART(SPLIT_PART(name, '/', 2), '-', 1)
);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres avatars
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres avatars" ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = SPLIT_PART(SPLIT_PART(name, '/', 2), '-', 1)
);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres avatars
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres avatars" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = SPLIT_PART(SPLIT_PART(name, '/', 2), '-', 1)
);
