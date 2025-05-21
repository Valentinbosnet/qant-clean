-- Table pour stocker les layouts de la page d'accueil personnalisés
CREATE TABLE IF NOT EXISTS home_layouts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  layout JSONB NOT NULL DEFAULT '{"widgets": []}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour accélérer les recherches par user_id
CREATE INDEX IF NOT EXISTS home_layouts_user_id_idx ON home_layouts(user_id);

-- Politique RLS pour sécuriser l'accès aux données
ALTER TABLE home_layouts ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de lire uniquement leurs propres layouts
CREATE POLICY home_layouts_select_policy ON home_layouts 
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs d'insérer uniquement leurs propres layouts
CREATE POLICY home_layouts_insert_policy ON home_layouts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de mettre à jour uniquement leurs propres layouts
CREATE POLICY home_layouts_update_policy ON home_layouts 
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer uniquement leurs propres layouts
CREATE POLICY home_layouts_delete_policy ON home_layouts 
  FOR DELETE USING (auth.uid() = user_id);

-- Fonction pour créer automatiquement un layout par défaut pour les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION create_default_home_layout()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO home_layouts (id, user_id, layout)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    '{
      "widgets": [
        {
          "id": "welcome",
          "type": "welcome",
          "title": "Bienvenue",
          "position": {"i": "welcome", "x": 0, "y": 0, "w": 12, "h": 2},
          "settings": {},
          "visible": true
        },
        {
          "id": "quickActions",
          "type": "quickActions",
          "title": "Actions rapides",
          "position": {"i": "quickActions", "x": 0, "y": 2, "w": 4, "h": 3},
          "settings": {},
          "visible": true
        },
        {
          "id": "favorites",
          "type": "favorites",
          "title": "Mes favoris",
          "position": {"i": "favorites", "x": 4, "y": 2, "w": 8, "h": 3},
          "settings": {"maxItems": 5},
          "visible": true
        },
        {
          "id": "marketOverview",
          "type": "marketOverview",
          "title": "Aperçu du marché",
          "position": {"i": "marketOverview", "x": 0, "y": 5, "w": 6, "h": 4},
          "settings": {"indices": ["SPY", "QQQ", "DIA"]},
          "visible": true
        },
        {
          "id": "recentActivity",
          "type": "recentActivity",
          "title": "Activité récente",
          "position": {"i": "recentActivity", "x": 6, "y": 5, "w": 6, "h": 4},
          "settings": {"maxItems": 5},
          "visible": true
        }
      ]
    }'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Déclencheur pour créer un layout par défaut pour les nouveaux utilisateurs
DROP TRIGGER IF EXISTS create_default_home_layout_trigger ON auth.users;
CREATE TRIGGER create_default_home_layout_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_default_home_layout();
