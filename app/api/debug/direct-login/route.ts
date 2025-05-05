import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

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

    console.log("Connexion directe pour:", email)

    // Créer un client Supabase avec les cookies
    const cookieStore = cookies()
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        flowType: "pkce",
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: {
          getItem: (key) => {
            const cookie = cookieStore.get(key)
            return cookie?.value
          },
          setItem: (key, value) => {
            // Cette fonction ne sera pas utilisée côté serveur
          },
          removeItem: (key) => {
            // Cette fonction ne sera pas utilisée côté serveur
          },
        },
      },
    })

    // Vérifier si l'email est vérifié
    const adminClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: userData, error: userError } = await adminClient
      .from("app_users")
      .select("email_verified")
      .eq("email", email)
      .single()

    if (userError) {
      console.error("Erreur lors de la vérification de l'email:", userError)
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    if (!userData.email_verified) {
      console.log("Email non vérifié pour:", email)
      return NextResponse.json({ error: "Email non vérifié" }, { status: 403 })
    }

    // Authentifier l'utilisateur
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Erreur d'authentification:", error)
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    // Mettre à jour la date de dernière connexion
    await adminClient.from("app_users").update({ last_sign_in: new Date().toISOString() }).eq("id", data.user.id)

    // Définir les cookies de session
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      sameSite: "lax" as const,
    }

    // Créer une réponse avec les cookies de session
    const response = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: {
        expires_at: data.session?.expires_at,
      },
    })

    // Ajouter les cookies de session à la réponse
    response.cookies.set("supabase-auth-token", JSON.stringify(data.session), cookieOptions)

    return response
  } catch (error: any) {
    console.error("Erreur lors de la connexion directe:", error)
    return NextResponse.json({ error: error.message || "Erreur de connexion" }, { status: 500 })
  }
}
