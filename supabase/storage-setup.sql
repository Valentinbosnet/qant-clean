-- Créer un bucket pour les avatars des utilisateurs
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre à tous les utilisateurs authentifiés de lire les avatars
CREATE POLICY "Les avatars sont accessibles à tous" ON storage.objects
FOR SELECT
USING (bucket_id = 'profiles');

-- Politique pour permettre aux utilisateurs authentifiés de télécharger leurs propres avatars
CREATE POLICY "Les utilisateurs peuvent télécharger leurs propres avatars" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.filename(name))[1] LIKE (auth.uid() || '%')
);

-- Politique pour permettre aux utilisateurs authentifiés de mettre à jour leurs propres avatars
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres avatars" ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.filename(name))[1] LIKE (auth.uid() || '%')
);

-- Politique pour permettre aux utilisateurs authentifiés de supprimer leurs propres avatars
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres avatars" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profiles' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.filename(name))[1] LIKE (auth.uid() || '%')
);
