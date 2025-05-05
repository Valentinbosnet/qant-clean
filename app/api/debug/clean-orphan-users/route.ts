import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get("email")

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

    // Si un email spécifique est fourni, nettoyer uniquement cet utilisateur
    if (email) {
      // Vérifier si l'utilisateur existe dans auth.users
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

      // Vérifier si l'utilisateur existe dans app_users
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

      // Si l'utilisateur existe dans auth.users mais pas dans app_users, le supprimer de auth.users
      if (authUsers.users.length > 0 && (!appUsers || appUsers.length === 0)) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(authUsers.users[0].id)

        if (deleteError) {
          return NextResponse.json(
            {
              error: "Erreur lors de la suppression de l'utilisateur orphelin",
              details: deleteError.message,
            },
            { status: 500 },
          )
        }

        return NextResponse.json({
          success: true,
          message: `Utilisateur ${email} supprimé de auth.users avec succès.`,
        })
      }

      return NextResponse.json({
        message: "Aucune action nécessaire",
        details: {
          existsInAuth: authUsers.users.length > 0,
          existsInAppUsers: appUsers && appUsers.length > 0,
        },
      })
    }

    // Sinon, récupérer tous les utilisateurs de auth.users
    const { data: allAuthUsers, error: allAuthError } = await supabase.auth.admin.listUsers()

    if (allAuthError) {
      return NextResponse.json(
        {
          error: "Erreur lors de la récupération des utilisateurs de auth.users",
          details: allAuthError.message,
        },
        { status: 500 },
      )
    }

    // Récupérer tous les emails de app_users
    const { data: allAppUsers, error: allAppError } = await supabase.from("app_users").select("email")

    if (allAppError) {
      return NextResponse.json(
        {
          error: "Erreur lors de la récupération des utilisateurs de app_users",
          details: allAppError.message,
        },
        { status: 500 },
      )
    }

    // Créer un ensemble d'emails de app_users pour une recherche plus rapide
    const appUserEmails = new Set(allAppUsers.map((user) => user.email.toLowerCase()))

    // Trouver les utilisateurs orphelins (dans auth.users mais pas dans app_users)
    const orphanUsers = allAuthUsers.users.filter((user) => user.email && !appUserEmails.has(user.email.toLowerCase()))

    // Supprimer les utilisateurs orphelins
    const results = []
    for (const user of orphanUsers) {
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
        results.push({
          email: user.email,
          success: !deleteError,
          error: deleteError ? deleteError.message : null,
        })
      } catch (error: any) {
        results.push({
          email: user.email,
          success: false,
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.filter((r) => r.success).length} utilisateurs orphelins supprimés sur ${orphanUsers.length} trouvés.`,
      details: results,
    })
  } catch (error: any) {
    console.error("Erreur lors du nettoyage des utilisateurs orphelins:", error)
    return NextResponse.json(
      {
        error: "Erreur lors du nettoyage des utilisateurs orphelins",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
