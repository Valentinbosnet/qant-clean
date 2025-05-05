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

    // 1. Vérifier si l'utilisateur existe dans auth.users
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
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    const user = authUser.users[0]

    // 2. Mettre à jour le statut dans auth.users
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

    // 3. Vérifier si l'utilisateur existe dans app_users
    const { data: appUser, error: appUserError } = await supabase
      .from("app_users")
      .select("id")
      .eq("email", email)
      .single()

    // Si l'utilisateur n'existe pas dans app_users, le créer
    if (appUserError) {
      const { error: insertError } = await supabase.from("app_users").insert({
        id: user.id,
        email: email,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        return NextResponse.json(
          {
            error: "Erreur lors de la création de l'utilisateur dans app_users",
            details: insertError.message,
          },
          { status: 500 },
        )
      }
    } else {
      // 4. Mettre à jour le statut dans app_users
      const { error: updateError } = await supabase
        .from("app_users")
        .update({
          email_verified: true,
          updated_at: new Date().toISOString(),
        })
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
    }

    return NextResponse.json({
      success: true,
      message: "Email marqué comme vérifié avec succès",
      userId: user.id,
      email: email,
    })
  } catch (error: any) {
    console.error("Erreur lors de la vérification forcée de l'email:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la vérification forcée de l'email",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
