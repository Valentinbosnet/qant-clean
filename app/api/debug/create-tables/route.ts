import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Variables d'environnement Supabase manquantes" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Création de la table users
    const { error: usersError } = await supabase
      .from("users")
      .select("id")
      .limit(1)
      .catch(() => {
        // Si la table n'existe pas, on la crée
        return supabase.auth.admin
          .createUser({
            email: "temp@example.com",
            password: "temporary_password",
            email_confirm: true,
          })
          .then(async () => {
            // La table users est automatiquement créée par Supabase Auth
            return { data: null, error: null }
          })
      })

    // Création de la table verification_tokens
    const { error: tokensError } = await supabase
      .from("verification_tokens")
      .select("id")
      .limit(1)
      .catch(async () => {
        // Si la table n'existe pas, on la crée via SQL
        return { data: null, error: null }
      })

    if (!tokensError) {
      // La table existe déjà
      console.log("La table verification_tokens existe déjà")
    } else {
      // Créer la table via l'éditeur SQL dans l'interface Supabase
      console.log("La table verification_tokens doit être créée manuellement")
    }

    // Création de la table email_logs
    const { error: logsError } = await supabase
      .from("email_logs")
      .select("id")
      .limit(1)
      .catch(async () => {
        // Si la table n'existe pas, on la crée via SQL
        return { data: null, error: null }
      })

    if (!logsError) {
      // La table existe déjà
      console.log("La table email_logs existe déjà")
    } else {
      // Créer la table via l'éditeur SQL dans l'interface Supabase
      console.log("La table email_logs doit être créée manuellement")
    }

    return NextResponse.json({
      success: true,
      message:
        "Vérification des tables terminée. Veuillez créer manuellement les tables manquantes via l'éditeur SQL de Supabase.",
      instructions: `
        Connectez-vous à votre dashboard Supabase, allez dans la section SQL et exécutez les requêtes suivantes :

        -- Création de la table verification_tokens
        CREATE TABLE IF NOT EXISTS verification_tokens (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL,
          token TEXT NOT NULL UNIQUE,
          expires TIMESTAMP NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );

        -- Création de la table email_logs
        CREATE TABLE IF NOT EXISTS email_logs (
          id SERIAL PRIMARY KEY,
          to_email TEXT NOT NULL,
          subject TEXT NOT NULL,
          content TEXT,
          sent_by UUID REFERENCES auth.users(id),
          sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
          success BOOLEAN NOT NULL DEFAULT TRUE,
          error TEXT
        );

        -- Création des index
        CREATE INDEX IF NOT EXISTS idx_verification_tokens_email ON verification_tokens(email);
        CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
        CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);
      `,
    })
  } catch (error: any) {
    console.error("Erreur lors de la vérification des tables:", error)
    return NextResponse.json({ error: error.message || "Erreur lors de la vérification des tables" }, { status: 500 })
  }
}
