-- Table pour stocker les layouts de tableau de bord
CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widgets JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Fonction pour mettre à jour le timestamp last_updated
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le timestamp last_updated
DROP TRIGGER IF EXISTS update_dashboard_layouts_last_updated ON dashboard_layouts;
CREATE TRIGGER update_dashboard_layouts_last_updated
BEFORE UPDATE ON dashboard_layouts
FOR EACH ROW
EXECUTE FUNCTION update_last_updated_column();

-- Politique RLS pour sécuriser les données
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir uniquement leurs propres layouts
DROP POLICY IF EXISTS "Users can view their own dashboard layouts" ON dashboard_layouts;
CREATE POLICY "Users can view their own dashboard layouts"
  ON dashboard_layouts FOR SELECT
  USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de modifier uniquement leurs propres layouts
DROP POLICY IF EXISTS "Users can update their own dashboard layouts" ON dashboard_layouts;
CREATE POLICY "Users can update their own dashboard layouts"
  ON dashboard_layouts FOR UPDATE
  USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs d'insérer uniquement leurs propres layouts
DROP POLICY IF EXISTS "Users can insert their own dashboard layouts" ON dashboard_layouts;
CREATE POLICY "Users can insert their own dashboard layouts"
  ON dashboard_layouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer uniquement leurs propres layouts
DROP POLICY IF EXISTS "Users can delete their own dashboard layouts" ON dashboard_layouts;
CREATE POLICY "Users can delete their own dashboard layouts"
  ON dashboard_layouts FOR DELETE
  USING (auth.uid() = user_id);
