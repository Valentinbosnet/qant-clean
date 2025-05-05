import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST() {
  try {
    console.log("Début du traitement de la requête de bypass de vérification d'email")

    // Obtenir la session actuelle
    const session = await getServerSession(authOptions)
    console.log("Session récupérée:", session?.user?.email)

    if (!session?.user?.id) {
      console.log("Utilisateur non authentifié")
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Vérifier si l'email est déjà vérifié
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    })

    // Si l'email n'est pas vérifié, le marquer comme vérifié
    if (!user?.emailVerified) {
      console.log("Marquage de l'email comme vérifié")
      await db.user.update({
        where: { id: session.user.id },
        data: {
          emailVerified: new Date(),
        },
      })
    } else {
      console.log("L'email est déjà vérifié")
    }

    return NextResponse.json({
      success: true,
      message: "Bypass de vérification d'email effectué avec succès",
    })
  } catch (error) {
    console.error("Erreur lors du bypass de vérification d'email:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
