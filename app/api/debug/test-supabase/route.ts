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

    // Vérifier la connexion à Supabase avec une syntaxe correcte
    const { data: connectionTest, error: connectionError } = await supabase
      .from("app_users")
      .select("id") // Utiliser id au lieu de count(*)
      .limit(1)

    if (connectionError) {
      console.error("Erreur de connexion à Supabase:", connectionError)
      return NextResponse.json({ error: connectionError.message }, { status: 500 })
    }

    // Vérifier les tables existantes
    const { data: tablesInfo, error: tablesError } = await supabase.rpc("get_tables_info")

    if (tablesError) {
      console.log("La fonction RPC get_tables_info n'existe pas, vérification manuelle des tables")

      // Vérification manuelle des tables
      const tableChecks = await Promise.all([
        supabase
          .from("app_users")
          .select("id")
          .limit(1)
          .then((res) => ({ name: "app_users", exists: !res.error })),
        supabase
          .from("portfolios")
          .select("id")
          .limit(1)
          .then((res) => ({ name: "portfolios", exists: !res.error })),
        supabase
          .from("transactions")
          .select("id")
          .limit(1)
          .then((res) => ({ name: "transactions", exists: !res.error })),
        supabase
          .from("predictions")
          .select("id")
          .limit(1)
          .then((res) => ({ name: "predictions", exists: !res.error })),
        supabase
          .from("verification_codes")
          .select("id")
          .limit(1)
          .then((res) => ({ name: "verification_codes", exists: !res.error })),
      ])

      // Vérifier également les tables auth
      const { data: authUser, error: authError } = await supabase.auth.admin.listUsers({ perPage: 1 })

      return NextResponse.json({
        connection: "OK",
        tables: tableChecks,
        authSystem: {
          working: !authError,
          userCount: authUser?.users?.length || 0,
        },
        message: "Vérification manuelle des tables effectuée",
      })
    }

    return NextResponse.json({
      connection: "OK",
      tables: tablesInfo,
      message: "Connexion à Supabase établie avec succès",
    })
  } catch (error: any) {
    console.error("Erreur lors du test de connexion à Supabase:", error)
    return NextResponse.json({ error: error.message || "Erreur inconnue" }, { status: 500 })
  }
}
