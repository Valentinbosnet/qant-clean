-- Table pour stocker les préférences du tableau de bord
CREATE TABLE IF NOT EXISTS dashboard_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  layout JSON NOT NULL DEFAULT '[]'::json,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le timestamp updated_at
DROP TRIGGER IF EXISTS update_dashboard_preferences_updated_at ON dashboard_preferences;
CREATE TRIGGER update_dashboard_preferences_updated_at
BEFORE UPDATE ON dashboard_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Politique RLS pour sécuriser les données
ALTER TABLE dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir uniquement leurs propres préférences
DROP POLICY IF EXISTS "Users can view their own dashboard preferences" ON dashboard_preferences;
CREATE POLICY "Users can view their own dashboard preferences"
  ON dashboard_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de modifier uniquement leurs propres préférences
DROP POLICY IF EXISTS "Users can update their own dashboard preferences" ON dashboard_preferences;
CREATE POLICY "Users can update their own dashboard preferences"
  ON dashboard_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs d'insérer uniquement leurs propres préférences
DROP POLICY IF EXISTS "Users can insert their own dashboard preferences" ON dashboard_preferences;
CREATE POLICY "Users can insert their own dashboard preferences"
  ON dashboard_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer uniquement leurs propres préférences
DROP POLICY IF EXISTS "Users can delete their own dashboard preferences" ON dashboard_preferences;
CREATE POLICY "Users can delete their own dashboard preferences"
  ON dashboard_preferences FOR DELETE
  USING (auth.uid() = user_id);
