import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 })
    }

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

    // 1. Vérifier si l'utilisateur existe dans app_users et si son email est vérifié
    const { data: appUser, error: appUserError } = await supabase
      .from("app_users")
      .select("id, email_verified")
      .eq("email", email)
      .single()

    if (appUserError) {
      return NextResponse.json(
        {
          error: "Utilisateur non trouvé dans app_users",
          details: appUserError.message,
        },
        { status: 404 },
      )
    }

    if (!appUser.email_verified) {
      return NextResponse.json(
        {
          error: "L'email n'est pas vérifié dans app_users",
          status: "unverified",
        },
        { status: 400 },
      )
    }

    // 2. Vérifier si l'utilisateur existe dans auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers({
      filters: {
        email: email,
      },
    })

    if (authError) {
      return NextResponse.json(
        {
          error: "Erreur lors de la recherche de l'utilisateur",
          details: authError.message,
        },
        { status: 500 },
      )
    }

    if (!authUser.users.length) {
      return NextResponse.json({ error: "Utilisateur non trouvé dans auth.users" }, { status: 404 })
    }

    const user = authUser.users[0]

    // 3. Si l'email est vérifié dans app_users mais pas dans auth.users, synchroniser
    if (appUser.email_verified && !user.email_confirmed_at) {
      // Mettre à jour le statut dans auth.users pour refléter app_users
      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(user.id, { email_confirm: true })

      if (updateAuthError) {
        return NextResponse.json(
          {
            error: "Erreur lors de la synchronisation avec auth.users",
            details: updateAuthError.message,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Statut de vérification synchronisé avec succès",
        action: "synchronized",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Aucune synchronisation nécessaire",
      emailVerifiedInApp: appUser.email_verified,
      emailConfirmedInAuth: !!user.email_confirmed_at,
    })
  } catch (error: any) {
    console.error("Erreur lors de la synchronisation:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la synchronisation",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
