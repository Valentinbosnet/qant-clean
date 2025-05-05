import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          error: "Configuration Supabase manquante",
          sql: "-- Impossible de se connecter à Supabase : variables d'environnement manquantes",
        },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // SQL pour créer la table email_logs
    const sql = `
    CREATE TABLE IF NOT EXISTS public.email_logs (
      id SERIAL PRIMARY KEY,
      user_id UUID,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL,
      error TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
    );
    `

    // Exécuter le SQL directement avec la méthode query
    const { error } = await supabase.from("email_logs").select("id").limit(1)

    if (error && error.code === "42P01") {
      // Table doesn't exist
      // Exécuter le SQL pour créer la table
      const { error: createError } = await supabase.rpc("exec_sql", { sql }).single()

      if (createError) {
        console.error("Erreur lors de la création de la table:", createError)
        return NextResponse.json(
          {
            error: `Erreur lors de la création de la table: ${createError.message}`,
            sql,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({ message: "Table email_logs créée avec succès" })
    } else if (error) {
      return NextResponse.json(
        {
          error: `Erreur lors de la vérification de la table: ${error.message}`,
          sql,
        },
        { status: 500 },
      )
    } else {
      return NextResponse.json({ message: "La table email_logs existe déjà" })
    }
  } catch (error: any) {
    console.error("Erreur lors de la création des tables:", error)
    return NextResponse.json(
      {
        error: `Erreur: ${error.message}`,
        sql: `-- Erreur: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
