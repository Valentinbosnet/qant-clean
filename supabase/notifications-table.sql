-- Création de la table notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  content JSONB NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_id TEXT -- ID de l'élément lié (conversation, message, etc.)
);

-- Activer RLS sur la table notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour notifications
CREATE POLICY "Les utilisateurs peuvent voir leurs propres notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Fonction pour créer une notification lors de la réception d'un nouveau message
CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Ne pas créer de notification si l'utilisateur est l'expéditeur du message
  IF NEW.sender_id <> NEW.receiver_id THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      content,
      related_id
    )
    VALUES (
      NEW.receiver_id,
      'new_message',
      json_build_object(
        'message_id', NEW.id,
        'conversation_id', NEW.conversation_id,
        'sender_id', NEW.sender_id,
        'content', substring(NEW.content, 1, 50),
        'created_at', NEW.created_at
      ),
      NEW.conversation_id::TEXT
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Déclencheur pour créer une notification lors de la création d'un message
DROP TRIGGER IF EXISTS create_message_notification_trigger ON public.messages;
CREATE TRIGGER create_message_notification_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.create_message_notification();
