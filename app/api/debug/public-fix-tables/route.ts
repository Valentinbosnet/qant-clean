import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const results: any = {}

    // Vérifier si la table verification_codes existe
    const { data: verificationCodesExists, error: verificationCodesError } = await supabase
      .from("verification_codes")
      .select("*")
      .limit(1)
      .maybeSingle()

    results.verification_codes_exists = !verificationCodesError
    results.verification_codes_created = false

    // Si la table n'existe pas, la créer
    if (verificationCodesError && verificationCodesError.message.includes("does not exist")) {
      const { error: createError } = await supabase.rpc("create_verification_codes_table")
      results.verification_codes_created = !createError
      if (createError) {
        console.error("Erreur lors de la création de la table verification_codes:", createError)

        // Essayer de créer la table avec une requête SQL directe
        const { error: sqlError } = await supabase.rpc("execute_sql", {
          sql_query: `
            CREATE TABLE IF NOT EXISTS verification_codes (
              id SERIAL PRIMARY KEY,
              email TEXT NOT NULL,
              code TEXT NOT NULL,
              expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(email)
            );
          `,
        })

        results.verification_codes_created = !sqlError
        if (sqlError) {
          console.error("Erreur lors de la création SQL de la table verification_codes:", sqlError)
        }
      }
    }

    // Vérifier si la table email_logs existe
    const { data: emailLogsExists, error: emailLogsError } = await supabase
      .from("email_logs")
      .select("*")
      .limit(1)
      .maybeSingle()

    results.email_logs_exists = !emailLogsError
    results.email_logs_created = false

    // Si la table n'existe pas, la créer
    if (emailLogsError && emailLogsError.message.includes("does not exist")) {
      const { error: createError } = await supabase.rpc("execute_sql", {
        sql_query: `
          CREATE TABLE IF NOT EXISTS email_logs (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT NOT NULL,
            error TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      results.email_logs_created = !createError
      if (createError) {
        console.error("Erreur lors de la création de la table email_logs:", createError)
      }
    }

    // Générer le SQL pour l'exécution manuelle si nécessaire
    results.sql = `
-- Créer la table verification_codes si elle n'existe pas
CREATE TABLE IF NOT EXISTS verification_codes (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email)
);

-- Créer la table email_logs si elle n'existe pas
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marquer tous les utilisateurs comme ayant vérifié leur email (utiliser avec précaution)
UPDATE app_users SET email_verified = true;
`

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error: any) {
    console.error("Erreur lors de la correction des tables:", error)
    return NextResponse.json({ error: error.message || "Une erreur est survenue" }, { status: 500 })
  }
}
