import { type NextRequest, NextResponse } from "next/server"
import { generateVerificationCode, saveVerificationCode, sendVerificationEmail } from "@/lib/email-service"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 })
    }

    // Générer un code de vérification
    const code = generateVerificationCode()

    // Enregistrer le code dans la base de données
    const saveResult = await saveVerificationCode(email, code)

    if (!saveResult.success) {
      return NextResponse.json({ error: saveResult.error }, { status: 500 })
    }

    // Envoyer l'email de vérification
    const sendResult = await sendVerificationEmail(email, code)

    if (!sendResult.success) {
      return NextResponse.json({ error: sendResult.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Email de vérification envoyé" })
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de l'email de vérification:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'envoi de l'email de vérification" },
      { status: 500 },
    )
  }
}
