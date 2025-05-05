import { type NextRequest, NextResponse } from "next/server"
import { generateAndSendVerificationCode, checkEmailVerificationStatus } from "@/lib/email-service"

export async function POST(req: NextRequest) {
  try {
    console.log("Requête de renvoi de code de vérification reçue")
    const { email } = await req.json()
    console.log("Email pour renvoi de code:", email)

    if (!email) {
      console.error("Email manquant")
      return NextResponse.json({ error: "Email requis" }, { status: 400 })
    }

    // Vérifier d'abord si l'email est déjà vérifié
    console.log("Vérification du statut de l'email")
    const verificationStatus = await checkEmailVerificationStatus(email)
    console.log("Statut de vérification:", verificationStatus)

    if (verificationStatus.isVerified) {
      console.log("Email déjà vérifié, redirection vers la page d'abonnement")
      return NextResponse.json({
        success: true,
        message: "Email déjà vérifié",
        alreadyVerified: true,
        redirectUrl: "/pricing", // Rediriger vers la page d'abonnement
      })
    }

    // Si l'email n'est pas encore vérifié, générer et envoyer un nouveau code
    console.log("Génération et envoi d'un nouveau code")
    const result = await generateAndSendVerificationCode(email)
    console.log("Résultat de l'envoi du code:", result)

    if (!result.success) {
      console.error("Échec de l'envoi du code:", result.error)
      return NextResponse.json({ error: result.error || "Erreur lors de l'envoi du code" }, { status: 500 })
    }

    console.log("Code envoyé avec succès")
    return NextResponse.json({
      success: true,
      message: "Code de vérification envoyé avec succès",
    })
  } catch (error: any) {
    console.error("Erreur lors de l'envoi du code de vérification:", error)
    return NextResponse.json({ error: error.message || "Une erreur s'est produite" }, { status: 500 })
  }
}
