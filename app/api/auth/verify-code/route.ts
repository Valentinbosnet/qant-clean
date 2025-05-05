import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyCode } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email et code requis" }, { status: 400 })
    }

    // 1. Vérifier le code
    const verificationResult = await verifyCode(email, code)

    if (!verificationResult.success) {
      return NextResponse.json(
        {
          error: "Code invalide ou expiré",
          details: verificationResult.error,
        },
        { status: 400 },
      )
    }

    // 2. Mettre à jour le statut dans auth.users
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

    // Trouver l'utilisateur dans auth.users
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

    // Mettre à jour le statut dans auth.users
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
      message: "Email vérifié avec succès",
      userId: user.id,
      email: email,
    })
  } catch (error: any) {
    console.error("Erreur lors de la vérification du code:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la vérification du code",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
