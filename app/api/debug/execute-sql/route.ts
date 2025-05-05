import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json({ error: "Requête SQL manquante" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Variables d'environnement Supabase manquantes" }, { status: 500 })
    }

    // Cette fonctionnalité nécessite que vous activiez l'extension pg_net dans Supabase
    // et que vous créiez une fonction SQL qui exécute des requêtes SQL arbitraires
    // Cela peut présenter des risques de sécurité, donc à utiliser uniquement en développement

    return NextResponse.json({
      success: false,
      error:
        "Cette fonctionnalité n'est pas disponible. Veuillez exécuter le SQL directement dans l'interface Supabase.",
      message:
        "Pour des raisons de sécurité, l'exécution de SQL arbitraire via l'API n'est pas activée. Veuillez utiliser l'éditeur SQL de Supabase.",
    })
  } catch (error: any) {
    console.error("Erreur lors de l'exécution SQL:", error)
    return NextResponse.json({ error: error.message || "Erreur lors de l'exécution SQL" }, { status: 500 })
  }
}
