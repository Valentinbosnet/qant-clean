import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Vérifier si la table app_users existe
    const { error: checkError } = await supabase.from("app_users").select("id").limit(1)

    if (!checkError) {
      return NextResponse.json({
        message: "La table app_users existe déjà",
        action: "none",
      })
    }

    // Créer la table app_users
    const { error: createError } = await supabase.rpc("create_app_users_table")

    if (createError) {
      // Si la fonction RPC n'existe pas, créer la table manuellement
      const { error: manualCreateError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS app_users (
          id UUID PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          password_hash VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          email_verified BOOLEAN DEFAULT FALSE,
          is_admin BOOLEAN DEFAULT FALSE,
          subscription_tier VARCHAR(50) DEFAULT 'free',
          subscription_status VARCHAR(50) DEFAULT 'inactive',
          subscription_end_date TIMESTAMP WITH TIME ZONE,
          onboarding_completed BOOLEAN DEFAULT FALSE,
          api_quota INTEGER DEFAULT 100,
          api_usage INTEGER DEFAULT 0,
          last_sign_in TIMESTAMP WITH TIME ZONE
        )
      `)

      if (manualCreateError) {
        return NextResponse.json(
          {
            error: "Erreur lors de la création manuelle de la table app_users",
            details: manualCreateError,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        message: "Table app_users créée manuellement avec succès",
        action: "created_manually",
      })
    }

    return NextResponse.json({
      message: "Table app_users créée avec succès via RPC",
      action: "created_rpc",
    })
  } catch (error: any) {
    console.error("Erreur lors de la correction des tables:", error)
    return NextResponse.json({ error: error.message || "Erreur inconnue" }, { status: 500 })
  }
}
