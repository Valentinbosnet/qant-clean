import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get("email")

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

    // 1. Vérifier le statut dans auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers({
      filters: {
        email: email,
      },
    })

    if (authError || !authUser.users.length) {
      return NextResponse.json(
        {
          error: "Utilisateur non trouvé dans auth.users",
          details: authError?.message,
        },
        { status: 404 },
      )
    }

    const user = authUser.users[0]
    const isEmailConfirmedInAuth = user.email_confirmed_at !== null

    // 2. Vérifier le statut dans app_users
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

    // 3. Synchroniser les statuts
    if (isEmailConfirmedInAuth && !appUser.email_verified) {
      // Mettre à jour app_users si l'email est confirmé dans auth
      const { error: updateError } = await supabase
        .from("app_users")
        .update({ email_verified: true })
        .eq("id", appUser.id)

      if (updateError) {
        return NextResponse.json(
          {
            error: "Erreur lors de la mise à jour de app_users",
            details: updateError.message,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Email marqué comme vérifié dans app_users",
        authStatus: isEmailConfirmedInAuth,
        previousAppStatus: appUser.email_verified,
        currentAppStatus: true,
      })
    } else if (!isEmailConfirmedInAuth && appUser.email_verified) {
      // Mettre à jour auth.users si l'email est vérifié dans app_users
      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(user.id, { email_confirm: true })

      if (updateAuthError) {
        return NextResponse.json(
          {
            error: "Erreur lors de la mise à jour de auth.users",
            details: updateAuthError.message,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Email marqué comme vérifié dans auth.users",
        authStatus: true,
        previousAuthStatus: isEmailConfirmedInAuth,
        currentAuthStatus: true,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Les statuts sont déjà synchronisés",
      authStatus: isEmailConfirmedInAuth,
      appStatus: appUser.email_verified,
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
