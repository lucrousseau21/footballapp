-- Créer la table pour stocker les équipes favorites des utilisateurs
CREATE TABLE IF NOT EXISTS favorite_teams (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL REFERENCES equipe(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, team_id)
);

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_favorite_teams_user_id ON favorite_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_teams_team_id ON favorite_teams(team_id);

-- Activer Row Level Security (RLS)
ALTER TABLE favorite_teams ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres favoris
CREATE POLICY "Users can view their own favorite teams"
  ON favorite_teams
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent ajouter leurs propres favoris
CREATE POLICY "Users can insert their own favorite teams"
  ON favorite_teams
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer leurs propres favoris
CREATE POLICY "Users can delete their own favorite teams"
  ON favorite_teams
  FOR DELETE
  USING (auth.uid() = user_id);
