import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  console.log("Tentative de connexion directe")

  try {
    // Vérifier si la configuration Supabase est présente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 })
    }

    // Récupérer les données de la requête
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
    }

    console.log("Tentative de connexion directe pour:", email)

    // Créer un client Supabase
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Vérifier si l'email est vérifié
    const { data: userData, error: userError } = await supabase
      .from("app_users")
      .select("id, email, email_verified")
      .eq("email", email)
      .single()

    if (userError) {
      console.error("Erreur lors de la récupération des données utilisateur:", userError)
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    if (!userData.email_verified) {
      return NextResponse.json(
        {
          error: "Email non vérifié",
          code: "unverified_email",
          redirectUrl: `/verify-email?email=${encodeURIComponent(email)}`,
        },
        { status: 403 },
      )
    }

    // Authentifier l'utilisateur
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error("Erreur d'authentification:", authError)
      return NextResponse.json({ error: authError.message, code: "invalid_credentials" }, { status: 401 })
    }

    // Vérifier si l'utilisateur a un abonnement actif
    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userData.id)
      .eq("status", "active")
      .maybeSingle()

    // Créer la réponse
    const response = NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
      },
    })

    // Définir les cookies
    const expiresIn = 60 * 60 * 24 * 7 // 7 jours en secondes
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    // Cookie de session
    response.cookies.set({
      name: "app-session",
      value: authData.session?.access_token || "",
      expires: expiresAt,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    // Cookie d'abonnement
    response.cookies.set({
      name: "has-subscription",
      value: JSON.stringify({
        active: !!subscriptionData,
        userId: userData.id,
      }),
      expires: expiresAt,
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    // Cookie d'informations utilisateur
    response.cookies.set({
      name: "user-info",
      value: JSON.stringify({
        id: userData.id,
        email: userData.email,
        emailVerified: userData.email_verified,
      }),
      expires: expiresAt,
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    console.log("Connexion réussie pour:", email)
    console.log("Cookies définis:", {
      "app-session": authData.session?.access_token?.substring(0, 7) + "***",
      "has-subscription": JSON.stringify({
        active: !!subscriptionData,
        userId: userData.id,
      }),
      "user-info": JSON.stringify({
        id: userData.id,
        email: userData.email,
        emailVerified: userData.email_verified,
      }),
    })

    return response
  } catch (error) {
    console.error("Erreur lors de la connexion directe:", error)
    return NextResponse.json({ error: "Erreur serveur lors de la connexion" }, { status: 500 })
  }
}
