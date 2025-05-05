import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Adresse email manquante",
        },
        { status: 400 },
      )
    }

    const result = await sendEmail({
      to: email,
      subject: "Test d'envoi d'email",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Test d'envoi d'email réussi!</h2>
          <p>Cet email confirme que votre configuration SMTP fonctionne correctement.</p>
          <p>Date et heure du test: ${new Date().toLocaleString()}</p>
          <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            <p style="margin: 0; font-weight: bold;">Code de test: 123456</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Email de test envoyé avec succès",
      details: result,
    })
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de test:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de l'envoi de l'email de test",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
