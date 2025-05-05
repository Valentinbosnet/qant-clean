import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    console.log("Tentative de connexion après vérification pour:", email)

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 })
    }

    // Vérifier si l'email est vérifié
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

    // Vérifier si l'email est vérifié
    const { data: userData, error: userError } = await supabase
      .from("app_users")
      .select("id, email_verified")
      .eq("email", email)
      .single()

    if (userError) {
      console.error("Erreur lors de la vérification de l'email:", userError)
      return NextResponse.json({ error: "Erreur lors de la vérification de l'email" }, { status: 500 })
    }

    if (!userData.email_verified) {
      return NextResponse.json({ error: "Email non vérifié" }, { status: 403 })
    }

    // Créer une session pour l'utilisateur
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.createSession({
      userId: userData.id,
      properties: {
        email: email,
      },
    })

    if (sessionError) {
      console.error("Erreur lors de la création de la session:", sessionError)
      return NextResponse.json({ error: "Erreur lors de la création de la session" }, { status: 500 })
    }

    // Définir les cookies de session
    const cookieStore = cookies()
    cookieStore.set(
      "supabase-auth-token",
      JSON.stringify([sessionData.session.access_token, sessionData.session.refresh_token]),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 jours
        path: "/",
      },
    )

    // Définir un cookie spécial pour indiquer que l'utilisateur vient de vérifier son email
    cookieStore.set("just-verified", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 5, // 5 minutes
      path: "/",
    })

    return NextResponse.json({
      success: true,
      redirectUrl: "/subscription-required",
    })
  } catch (error) {
    console.error("Erreur lors de la connexion après vérification:", error)
    return NextResponse.json({ error: "Erreur serveur lors de la connexion" }, { status: 500 })
  }
}
