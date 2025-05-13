-- Table pour stocker l'historique des prédictions
CREATE TABLE IF NOT EXISTS prediction_history (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  algorithm TEXT NOT NULL,
  prediction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  target_date TIMESTAMP WITH TIME ZONE NOT NULL,
  predicted_price DECIMAL(12, 4) NOT NULL,
  actual_price DECIMAL(12, 4),
  confidence DECIMAL(5, 4) NOT NULL,
  prediction_data JSONB NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  accuracy DECIMAL(6, 2)
);

-- Index pour accélérer les requêtes
CREATE INDEX IF NOT EXISTS idx_prediction_history_user_id ON prediction_history(user_id);
CREATE INDEX IF NOT EXISTS idx_prediction_history_symbol ON prediction_history(symbol);
CREATE INDEX IF NOT EXISTS idx_prediction_history_algorithm ON prediction_history(algorithm);
CREATE INDEX IF NOT EXISTS idx_prediction_history_target_date ON prediction_history(target_date);
CREATE INDEX IF NOT EXISTS idx_prediction_history_is_completed ON prediction_history(is_completed);

-- Fonction pour mettre à jour automatiquement les prédictions complétées
CREATE OR REPLACE FUNCTION update_completed_predictions()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le champ is_completed pour les prédictions dont la date cible est passée
  UPDATE prediction_history
  SET is_completed = TRUE
  WHERE is_completed = FALSE
  AND target_date < NOW();
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour exécuter la fonction toutes les heures
CREATE OR REPLACE TRIGGER hourly_update_completed_predictions
EXECUTE PROCEDURE update_completed_predictions();
