import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendEmail, generateVerificationEmailHtml } from "@/lib/email-service"

export async function POST(req: NextRequest) {
  try {
    // Récupérer l'email depuis le corps de la requête
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 })
    }

    // Vérifier si l'utilisateur existe
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Générer un nouveau code de vérification (6 chiffres)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Date d'expiration (24 heures)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    try {
      // Tenter de créer un token de vérification avec les champs disponibles
      // Essayer différentes combinaisons de champs en fonction du schéma
      try {
        // Première tentative avec le schéma standard
        await db.verificationToken.create({
          data: {
            token: verificationCode,
            expires,
            identifier: email,
          },
        })
      } catch (e) {
        if (e instanceof Error && e.message.includes("Unknown argument `identifier`")) {
          // Deuxième tentative sans identifier
          await db.verificationToken.create({
            data: {
              token: verificationCode,
              expires,
              email: email,
            },
          })
        } else {
          throw e
        }
      }

      // Envoyer l'email de vérification
      await sendEmail({
        to: email,
        subject: "Vérification de votre adresse email",
        html: generateVerificationEmailHtml(user.name || "Utilisateur", verificationCode),
      })

      // Afficher le code dans la console en développement
      if (process.env.NODE_ENV !== "production") {
        console.log(`Code de vérification pour ${email}: ${verificationCode}`)
      }

      return NextResponse.json({ success: true, message: "Code de vérification envoyé avec succès" }, { status: 200 })
    } catch (error) {
      console.error("Erreur lors de la création du token:", error)

      // En développement, renvoyer quand même un succès avec le code
      if (process.env.NODE_ENV !== "production") {
        console.log(`Code de vérification pour ${email} (non enregistré): ${verificationCode}`)
        return NextResponse.json(
          {
            success: true,
            message: "Code de vérification généré mais non enregistré en base de données",
            devCode: verificationCode,
          },
          { status: 200 },
        )
      }

      throw error
    }
  } catch (error) {
    console.error("Erreur lors du renvoi du code de vérification:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
