import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  console.log("Tentative d'authentification")

  try {
    // Vérifier si la configuration Supabase est présente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 })
    }

    // Récupérer les données de la requête
    let email: string
    let password: string

    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      // Si le contenu est JSON
      const body = await req.json()
      email = body.email
      password = body.password
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      // Si le contenu est form-urlencoded
      const formData = await req.formData()
      email = formData.get("email") as string
      password = formData.get("password") as string
    } else {
      // Autre type de contenu
      return NextResponse.json({ error: "Type de contenu non pris en charge" }, { status: 400 })
    }

    console.log("Tentative d'authentification pour:", email)

    // Vérifier si l'email est vérifié
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: userData, error: userError } = await supabase
      .from("app_users")
      .select("email_verified")
      .eq("email", email)
      .single()

    if (userError) {
      console.error("Erreur lors de la récupération des données utilisateur:", userError)
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    if (!userData.email_verified) {
      return NextResponse.json({ error: "Email non vérifié" }, { status: 403 })
    }

    // Authentifier l'utilisateur
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error("Erreur d'authentification:", authError)
      return NextResponse.json({ error: authError.message }, { status: 401 })
    }

    // Mettre à jour la dernière connexion
    try {
      // Vérifier si la colonne last_login existe
      const { data: columnsData } = await supabase.from("app_users").select("*").limit(1)

      if (columnsData && columnsData.length > 0 && "last_login" in columnsData[0]) {
        await supabase.from("app_users").update({ last_login: new Date().toISOString() }).eq("email", email)
      } else {
        console.log("La colonne last_login n'existe pas dans la table app_users")
      }
    } catch (updateError) {
      console.error("Erreur lors de la mise à jour de la dernière connexion:", updateError)
      // Ne pas échouer si la mise à jour de la dernière connexion échoue
    }

    // Définir les cookies pour maintenir la session
    const response = NextResponse.json({
      success: true,
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
      },
      redirectUrl: "/dashboard", // URL de redirection par défaut
    })

    // Vérifier si l'utilisateur a un abonnement actif
    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", authData.user?.id)
      .eq("status", "active")
      .maybeSingle()

    // Définir le cookie de session
    const expiresIn = 60 * 60 * 24 * 7 // 7 jours en secondes
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    response.cookies.set({
      name: "app-session",
      value: authData.session?.access_token || "",
      expires: expiresAt,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    // Définir le cookie d'abonnement
    response.cookies.set({
      name: "has-subscription",
      value: JSON.stringify({
        active: !!subscriptionData,
        userId: authData.user?.id,
      }),
      expires: expiresAt,
      path: "/",
      httpOnly: false, // Accessible depuis JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    // Définir le cookie d'informations utilisateur
    response.cookies.set({
      name: "user-info",
      value: JSON.stringify({
        id: authData.user?.id,
        email: authData.user?.email,
        emailVerified: userData.email_verified,
      }),
      expires: expiresAt,
      path: "/",
      httpOnly: false, // Accessible depuis JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return response
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error)
    return NextResponse.json({ error: "Erreur serveur lors de l'authentification" }, { status: 500 })
  }
}
