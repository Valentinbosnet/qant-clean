import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 })
    }

    // Vérification des variables d'environnement
    const mailjetApiKey = process.env.MAILJET_API_KEY
    const mailjetSecretKey = process.env.MAILJET_SECRET_KEY
    const mailjetSender = process.env.MAILJET_SENDER

    if (!mailjetApiKey || !mailjetSecretKey || !mailjetSender) {
      return NextResponse.json(
        { error: "Configuration Mailjet incomplète. Vérifiez vos variables d'environnement." },
        { status: 500 },
      )
    }

    // Envoi d'email avec Mailjet
    const mailjet = require("node-mailjet").apiConnect(mailjetApiKey, mailjetSecretKey)

    const response = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: mailjetSender,
            Name: "Test d'Authentification",
          },
          To: [
            {
              Email: email,
              Name: "Utilisateur",
            },
          ],
          Subject: "Test d'envoi d'email",
          TextPart: "Ceci est un email de test pour vérifier la configuration de Mailjet.",
          HTMLPart: `
            <h3>Test d'envoi d'email</h3>
            <p>Ceci est un email de test pour vérifier la configuration de Mailjet.</p>
            <p>Si vous recevez cet email, cela signifie que votre configuration fonctionne correctement.</p>
          `,
        },
      ],
    })

    // Enregistrement du log d'email
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)

      await supabase.from("email_logs").insert({
        to_email: email,
        subject: "Test d'envoi d'email",
        content: "Ceci est un email de test pour vérifier la configuration de Mailjet.",
        success: true,
        sent_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      message: "Email de test envoyé avec succès",
    })
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de l'email de test:", error)
    return NextResponse.json({ error: error.message || "Erreur lors de l'envoi de l'email de test" }, { status: 500 })
  }
}
