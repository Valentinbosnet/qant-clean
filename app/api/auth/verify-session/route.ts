import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token d'authentification de l'en-tête Authorization
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ valid: false, error: "Token d'authentification manquant" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")

    // Vérifier la validité du token avec Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ valid: false, error: "Configuration Supabase manquante" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Vérifier le token
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      console.error("Token invalide:", error)
      return NextResponse.json({ valid: false, error: error?.message || "Token invalide" }, { status: 401 })
    }

    // Token valide, récupérer les informations de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from("app_users")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (userError || !userData) {
      console.error("Utilisateur non trouvé:", userError)
      return NextResponse.json({ valid: false, error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Vérifier si l'utilisateur a un abonnement
    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", data.user.id)
      .eq("status", "active")
      .maybeSingle()

    return NextResponse.json({
      valid: true,
      user: {
        id: userData.id,
        email: userData.email,
        emailVerified: userData.email_verified,
        hasSubscription: !!subscriptionData,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la vérification de la session:", error)
    return NextResponse.json({ valid: false, error: "Erreur lors de la vérification de la session" }, { status: 500 })
  }
}
