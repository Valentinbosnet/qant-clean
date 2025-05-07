CREATE OR REPLACE FUNCTION create_favorites_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Créer la table favorites si elle n'existe pas
  CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, stock_symbol)
  );
  
  -- Créer un index pour améliorer les performances des requêtes
  CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);
  
  -- Ajouter une politique RLS pour sécuriser la table
  ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
  
  -- Supprimer les politiques existantes si elles existent
  DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
  DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
  DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
  
  -- Créer de nouvelles politiques
  CREATE POLICY "Users can view their own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);
    
  CREATE POLICY "Users can insert their own favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
  CREATE POLICY "Users can delete their own favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);
END;
$$;
