import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { generateVerificationCode } from "@/lib/email-utils"
import { saveVerificationCode, sendVerificationEmail } from "@/lib/email-service"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Configuration Supabase manquante" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from("app_users")
      .select("id, email_verified")
      .eq("email", email)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Si l'email est déjà vérifié, retourner une erreur
    if (user.email_verified) {
      return NextResponse.json(
        {
          error: "Email déjà vérifié",
          redirectUrl: "/login",
        },
        { status: 400 },
      )
    }

    // Générer un nouveau code de vérification
    const code = generateVerificationCode()

    // Enregistrer le code dans la base de données
    const saveResult = await saveVerificationCode(email, code)

    if (!saveResult.success) {
      console.error("Erreur lors de l'enregistrement du code de vérification:", saveResult.error)
      return NextResponse.json({ error: "Erreur lors de l'enregistrement du code de vérification" }, { status: 500 })
    }

    // Envoyer l'email de vérification
    const sendResult = await sendVerificationEmail(email, code, user.id)

    if (!sendResult.success) {
      console.error("Erreur lors de l'envoi de l'email de vérification:", sendResult.error)
      return NextResponse.json({ error: "Erreur lors de l'envoi de l'email de vérification" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Code de vérification envoyé avec succès",
      redirectUrl: `/verify-email?email=${encodeURIComponent(email)}`,
    })
  } catch (error: any) {
    console.error("Erreur lors du traitement de l'email non vérifié:", error)
    return NextResponse.json({ error: error.message || "Une erreur s'est produite" }, { status: 500 })
  }
}
