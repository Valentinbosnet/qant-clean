import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { generateAndSendVerificationCode } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
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
    const { data: authUsers, error: authCheckError } = await supabase.auth.admin.listUsers({
      filters: {
        email: email,
      },
    })

    if (authCheckError) {
      return NextResponse.json(
        {
          error: "Erreur lors de la vérification de l'utilisateur dans auth.users",
          details: authCheckError.message,
        },
        { status: 500 },
      )
    }

    // 2. Vérifier si l'utilisateur existe dans app_users
    const { data: appUsers, error: appCheckError } = await supabase
      .from("app_users")
      .select("id, email")
      .eq("email", email)

    if (appCheckError) {
      return NextResponse.json(
        {
          error: "Erreur lors de la vérification de l'utilisateur dans app_users",
          details: appCheckError.message,
        },
        { status: 500 },
      )
    }

    // Si l'utilisateur existe dans auth.users mais pas dans app_users, nous pouvons le supprimer de auth.users
    if (authUsers.users.length > 0 && (!appUsers || appUsers.length === 0)) {
      console.log(`L'utilisateur ${email} existe dans auth.users mais pas dans app_users. Suppression de auth.users...`)

      // Supprimer l'utilisateur de auth.users
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authUsers.users[0].id)

      if (deleteError) {
        return NextResponse.json(
          {
            error: "Erreur lors de la suppression de l'utilisateur orphelin dans auth.users",
            details: deleteError.message,
          },
          { status: 500 },
        )
      }

      console.log(`Utilisateur ${email} supprimé de auth.users avec succès.`)
    }
    // Si l'utilisateur existe dans les deux tables ou seulement dans app_users
    else if (authUsers.users.length > 0 || (appUsers && appUsers.length > 0)) {
      return NextResponse.json(
        {
          error: "Cet email est déjà utilisé",
          details: {
            existsInAuth: authUsers.users.length > 0,
            existsInAppUsers: appUsers && appUsers.length > 0,
          },
        },
        { status: 400 },
      )
    }

    // 3. Créer l'utilisateur dans auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Ne pas confirmer l'email immédiatement
      user_metadata: {
        name: name || email.split("@")[0],
      },
    })

    if (authError) {
      return NextResponse.json(
        {
          error: "Erreur lors de la création de l'utilisateur",
          details: authError.message,
        },
        { status: 500 },
      )
    }

    // 4. Créer l'utilisateur dans app_users
    const { error: appUserError } = await supabase.from("app_users").insert({
      id: authData.user.id,
      email: email,
      name: name || email.split("@")[0],
      email_verified: false, // Ne pas marquer l'email comme vérifié immédiatement
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (appUserError) {
      // Si l'insertion échoue, supprimer l'utilisateur de auth.users
      await supabase.auth.admin.deleteUser(authData.user.id)

      return NextResponse.json(
        {
          error: "Erreur lors de la création de l'utilisateur dans app_users",
          details: appUserError.message,
        },
        { status: 500 },
      )
    }

    // 5. Envoyer un email de vérification
    const verificationResult = await generateAndSendVerificationCode(email, authData.user.id)

    if (!verificationResult.success) {
      console.error("Erreur lors de l'envoi de l'email de vérification:", verificationResult.error)
      // Ne pas échouer l'inscription si l'envoi de l'email échoue
    }

    return NextResponse.json({
      success: true,
      message: "Utilisateur créé avec succès",
      userId: authData.user.id,
      email: email,
      requiresVerification: true,
      redirectUrl: `/verify-email?email=${encodeURIComponent(email)}`,
    })
  } catch (error: any) {
    console.error("Erreur lors de l'inscription:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de l'inscription",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
