-- Création de la table conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT,
  is_group BOOLEAN DEFAULT FALSE
);

-- Création de la table participants (pour gérer les participants aux conversations)
CREATE TABLE IF NOT EXISTS public.participants (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_id INTEGER REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(conversation_id, user_id)
);

-- Création de la table messages
CREATE TABLE IF NOT EXISTS public.messages (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  conversation_id INTEGER REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE
);

-- Fonction pour mettre à jour le timestamp updated_at des conversations
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Déclencheur pour mettre à jour le timestamp des conversations
DROP TRIGGER IF EXISTS update_conversation_timestamp ON public.messages;
CREATE TRIGGER update_conversation_timestamp
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Politiques de sécurité Row Level Security (RLS)

-- Activer RLS sur toutes les tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Politiques pour conversations
CREATE POLICY "Les utilisateurs peuvent voir les conversations auxquelles ils participent"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE participants.conversation_id = conversations.id
      AND participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Les utilisateurs peuvent créer des conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (TRUE);

-- Politiques pour participants
CREATE POLICY "Les utilisateurs peuvent voir les participants des conversations auxquelles ils participent"
  ON public.participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE participants.conversation_id = public.participants.conversation_id
      AND participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Les utilisateurs peuvent ajouter des participants aux conversations qu'ils ont créées"
  ON public.participants FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.participants
      WHERE conversation_id = public.participants.conversation_id
    )
  );

-- Politiques pour messages
CREATE POLICY "Les utilisateurs peuvent voir les messages des conversations auxquelles ils participent"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE participants.conversation_id = messages.conversation_id
      AND participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Les utilisateurs peuvent envoyer des messages dans les conversations auxquelles ils participent"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE participants.conversation_id = messages.conversation_id
      AND participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = user_id);

-- Fonction pour créer une conversation entre deux utilisateurs
CREATE OR REPLACE FUNCTION create_direct_conversation(user1_id UUID, user2_id UUID)
RETURNS INTEGER AS $$
DECLARE
  conversation_id INTEGER;
BEGIN
  -- Vérifier si une conversation existe déjà entre ces deux utilisateurs
  SELECT c.id INTO conversation_id
  FROM public.conversations c
  JOIN public.participants p1 ON c.id = p1.conversation_id AND p1.user_id = user1_id
  JOIN public.participants p2 ON c.id = p2.conversation_id AND p2.user_id = user2_id
  WHERE c.is_group = FALSE
  LIMIT 1;

  -- Si aucune conversation n'existe, en créer une nouvelle
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (is_group)
    VALUES (FALSE)
    RETURNING id INTO conversation_id;

    -- Ajouter les deux utilisateurs comme participants
    INSERT INTO public.participants (conversation_id, user_id)
    VALUES (conversation_id, user1_id), (conversation_id, user2_id);
  END IF;

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vue pour obtenir les derniers messages des conversations
CREATE OR REPLACE VIEW public.conversation_summaries AS
SELECT 
  c.id AS conversation_id,
  c.name AS conversation_name,
  c.is_group,
  c.updated_at,
  (
    SELECT json_agg(json_build_object('user_id', p.user_id))
    FROM public.participants p
    WHERE p.conversation_id = c.id
  ) AS participants,
  (
    SELECT json_build_object(
      'id', m.id,
      'content', m.content,
      'created_at', m.created_at,
      'user_id', m.user_id
    )
    FROM public.messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) AS last_message,
  (
    SELECT COUNT(*)
    FROM public.messages m
    WHERE m.conversation_id = c.id
    AND m.read = FALSE
    AND m.user_id != auth.uid()
  ) AS unread_count
FROM public.conversations c;

-- Politique pour la vue conversation_summaries
CREATE POLICY "Les utilisateurs peuvent voir les résumés des conversations auxquelles ils participent"
  ON public.conversation_summaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.participants
      WHERE participants.conversation_id = conversation_summaries.conversation_id
      AND participants.user_id = auth.uid()
    )
  );
