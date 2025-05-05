import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 })
    }

    console.log("Test d'authentification pour:", email)

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Vérifier si l'utilisateur existe dans app_users
    const adminClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: userData, error: userError } = await adminClient
      .from("app_users")
      .select("id, email, email_verified")
      .eq("email", email)
      .single()

    if (userError) {
      console.error("Erreur lors de la vérification de l'utilisateur:", userError)
      return NextResponse.json(
        {
          error: "Erreur lors de la vérification de l'utilisateur",
          details: userError.message,
          step: "user_check",
        },
        { status: 500 },
      )
    }

    if (!userData) {
      return NextResponse.json({ error: "Utilisateur non trouvé", step: "user_check" }, { status: 404 })
    }

    console.log("Utilisateur trouvé:", {
      id: userData.id,
      email: userData.email,
      email_verified: userData.email_verified,
    })

    // Tenter l'authentification
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Erreur d'authentification:", error)
      return NextResponse.json(
        {
          error: "Échec de l'authentification",
          details: error.message,
          step: "auth",
          user: {
            id: userData.id,
            email: userData.email,
            email_verified: userData.email_verified,
          },
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        email_verified: userData.email_verified,
      },
      session: {
        expires_at: data.session?.expires_at,
      },
    })
  } catch (error: any) {
    console.error("Erreur lors du test d'authentification:", error)
    return NextResponse.json(
      {
        error: "Erreur lors du test d'authentification",
        details: error.message,
        step: "general",
      },
      { status: 500 },
    )
  }
}
