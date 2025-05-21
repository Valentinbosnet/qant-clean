-- Table pour stocker les layouts prédéfinis
CREATE TABLE IF NOT EXISTS preset_layouts (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail TEXT,
  layout JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour accélérer les recherches
CREATE INDEX IF NOT EXISTS preset_layouts_created_by_idx ON preset_layouts(created_by);
CREATE INDEX IF NOT EXISTS preset_layouts_is_public_idx ON preset_layouts(is_public);
CREATE INDEX IF NOT EXISTS preset_layouts_category_idx ON preset_layouts(category);

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_preset_layouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le timestamp updated_at
DROP TRIGGER IF EXISTS update_preset_layouts_updated_at ON preset_layouts;
CREATE TRIGGER update_preset_layouts_updated_at
BEFORE UPDATE ON preset_layouts
FOR EACH ROW
EXECUTE FUNCTION update_preset_layouts_updated_at();

-- Politique RLS pour la lecture
CREATE POLICY "Layouts prédéfinis publics visibles par tous"
ON preset_layouts FOR SELECT
USING (is_public = true);

CREATE POLICY "Layouts prédéfinis privés visibles par leur créateur"
ON preset_layouts FOR SELECT
USING (auth.uid() = created_by);

-- Politique RLS pour l'insertion
CREATE POLICY "Les utilisateurs peuvent créer leurs propres layouts prédéfinis"
ON preset_layouts FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Politique RLS pour la mise à jour
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres layouts prédéfinis"
ON preset_layouts FOR UPDATE
USING (auth.uid() = created_by);

-- Politique RLS pour la suppression
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres layouts prédéfinis"
ON preset_layouts FOR DELETE
USING (auth.uid() = created_by);

-- Activer RLS
ALTER TABLE preset_layouts ENABLE ROW LEVEL SECURITY;
