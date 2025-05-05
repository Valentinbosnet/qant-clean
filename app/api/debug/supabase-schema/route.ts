import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Variables d'environnement Supabase manquantes" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Récupérer la structure de la table auth.users
    const { data: authUsers, error: authError } = await supabase
      .from("auth.users")
      .select("*")
      .limit(1)
      .catch((err) => {
        console.error("Erreur lors de la requête auth.users:", err)
        return { data: null, error: err }
      })

    // Récupérer la liste des tables dans le schéma public
    const { data: tables, error: tablesError } = await supabase.rpc("get_tables").catch((err) => {
      console.error("Erreur lors de la requête get_tables:", err)
      return { data: null, error: err }
    })

    return NextResponse.json({
      authUsers: authError ? { error: authError.message } : authUsers,
      tables: tablesError ? { error: tablesError.message } : tables,
      message: "Vérifiez les logs pour plus d'informations sur la structure de Supabase",
    })
  } catch (error: any) {
    console.error("Erreur lors de la récupération du schéma:", error)
    return NextResponse.json({ error: error.message || "Erreur lors de la récupération du schéma" }, { status: 500 })
  }
}
