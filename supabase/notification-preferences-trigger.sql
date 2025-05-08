-- Fonction pour créer automatiquement des préférences de notification pour un nouvel utilisateur
CREATE OR REPLACE FUNCTION public.create_notification_preferences_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (
    user_id,
    email_enabled,
    push_enabled,
    in_app_enabled,
    message_notifications,
    system_notifications
  )
  VALUES (
    NEW.id,
    true,
    true,
    true,
    true,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Déclencheur pour créer des préférences de notification lors de la création d'un utilisateur
DROP TRIGGER IF EXISTS create_notification_preferences_trigger ON auth.users;
CREATE TRIGGER create_notification_preferences_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_notification_preferences_for_user();

-- Créer des préférences de notification pour les utilisateurs existants
INSERT INTO public.notification_preferences (
  user_id,
  email_enabled,
  push_enabled,
  in_app_enabled,
  message_notifications,
  system_notifications
)
SELECT id, true, true, true, true, true
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.notification_preferences WHERE user_id = auth.users.id
);
