import { createClient } from "@supabase/supabase-js"

// Créer un client Supabase pour le navigateur
export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Variables d'environnement Supabase manquantes")
    throw new Error("Variables d'environnement Supabase manquantes")
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce", // Utiliser PKCE pour une sécurité renforcée
    },
  })
}

// Créer une instance singleton pour le client côté navigateur
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export const getBrowserClient = () => {
  if (typeof window === "undefined") {
    throw new Error("getBrowserClient doit être appelé côté client uniquement")
  }

  if (!browserClient) {
    browserClient = createBrowserClient()
  }
  return browserClient
}

// Créer un client serveur (pour les composants serveur et les actions serveur)
export const createServerClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL as string
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Variables d'environnement Supabase manquantes")
    throw new Error("Variables d'environnement Supabase manquantes")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Fonction pour créer les tables nécessaires
export async function setupDatabase() {
  const supabase = createServerClient()

  // Vérifier si la table favorites existe
  const { error: checkError } = await supabase.from("favorites").select("id").limit(1).single()

  // Si la table n'existe pas, la créer
  if (checkError && checkError.message.includes("does not exist")) {
    // Créer la table favorites
    const { error: createError } = await supabase.rpc("create_favorites_table")

    if (createError) {
      console.error("Erreur lors de la création de la table favorites:", createError)
      throw createError
    }

    console.log("Table favorites créée avec succès")
  }

  // Vérifier si la table user_settings existe
  const { error: settingsCheckError } = await supabase.from("user_settings").select("id").limit(1).single()

  // Si la table n'existe pas, la créer
  if (settingsCheckError && settingsCheckError.message.includes("does not exist")) {
    // Créer la table user_settings
    const { error: createSettingsError } = await supabase.query(`
      CREATE TABLE user_settings (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        theme VARCHAR(20) DEFAULT 'system',
        notifications BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    if (createSettingsError) {
      console.error("Erreur lors de la création de la table user_settings:", createSettingsError)
      throw createSettingsError
    }

    console.log("Table user_settings créée avec succès")
  }
}
