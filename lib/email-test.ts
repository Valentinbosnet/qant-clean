import nodemailer from "nodemailer"

export async function testEmailConfiguration() {
  const { EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD, EMAIL_FROM } = process.env

  console.log("=== TEST DE CONFIGURATION EMAIL ===")
  console.log(`Host: ${EMAIL_SERVER_HOST}`)
  console.log(`Port: ${EMAIL_SERVER_PORT}`)
  console.log(`User: ${EMAIL_SERVER_USER}`)
  console.log(`From: ${EMAIL_FROM}`)
  console.log(`Password: ${"*".repeat(EMAIL_SERVER_PASSWORD?.length || 0)}`)
  console.log(`Secure: ${process.env.EMAIL_SERVER_SECURE === "true"}`)

  try {
    // Créer un transporteur avec journalisation détaillée
    const transporter = nodemailer.createTransport({
      host: EMAIL_SERVER_HOST,
      port: Number.parseInt(EMAIL_SERVER_PORT || "587"),
      secure: process.env.EMAIL_SERVER_SECURE === "true",
      auth: {
        user: EMAIL_SERVER_USER,
        pass: EMAIL_SERVER_PASSWORD,
      },
      debug: true,
      logger: true,
    })

    // Vérifier la connexion
    console.log("Vérification de la connexion SMTP...")
    await transporter.verify()
    console.log("✅ Connexion SMTP réussie!")

    // Tenter d'envoyer un email de test
    console.log("Envoi d'un email de test...")
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: EMAIL_SERVER_USER, // Envoyer à soi-même pour le test
      subject: "Test de configuration email",
      text: "Si vous recevez cet email, la configuration SMTP fonctionne correctement.",
      html: "<p>Si vous recevez cet email, la configuration SMTP fonctionne correctement.</p>",
    })

    console.log("✅ Email de test envoyé avec succès!")
    console.log(`ID du message: ${info.messageId}`)
    console.log(`URL de prévisualisation: ${nodemailer.getTestMessageUrl(info)}`)

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("❌ Erreur lors du test de configuration email:", error)
    return { success: false, error }
  }
}
