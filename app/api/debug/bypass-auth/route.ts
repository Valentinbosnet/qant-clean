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

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Mettre à jour l'utilisateur dans la table app_users
    const { error: updateError } = await supabase.from("app_users").update({ email_verified: true }).eq("email", email)

    if (updateError) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Récupérer l'ID de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from("app_users")
      .select("id")
      .eq("email", email)
      .single()

    if (userError || !userData) {
      console.error("Erreur lors de la récupération de l'utilisateur:", userError)
      return NextResponse.json({ error: userError?.message || "Utilisateur non trouvé" }, { status: 500 })
    }

    // Mettre à jour l'utilisateur dans Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(userData.id, { email_confirm: true })

    if (authError) {
      console.error("Erreur lors de la mise à jour de l'utilisateur dans Auth:", authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Email marqué comme vérifié avec succès",
    })
  } catch (error: any) {
    console.error("Erreur lors du bypass de l'authentification:", error)
    return NextResponse.json({ error: error.message || "Une erreur est survenue" }, { status: 500 })
  }
}
