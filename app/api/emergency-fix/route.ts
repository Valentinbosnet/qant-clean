import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST() {
  try {
    console.log("Démarrage du processus de correction d'urgence")

    // Obtenir la session actuelle
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.log("Utilisateur non authentifié")
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    console.log("ID utilisateur:", session.user.id)
    console.log("Email:", session.user.email)

    // Récupérer l'état actuel de l'utilisateur pour le débogage
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        emailVerified: true,
      },
    })

    console.log("Current user state:", currentUser)

    // Mise à jour directe de la base de données pour marquer l'email comme vérifié
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        emailVerified: new Date(),
      },
      select: {
        id: true,
        emailVerified: true,
      },
    })

    console.log("Utilisateur mis à jour avec succès:", updatedUser)

    return NextResponse.json({
      success: true,
      message: "Utilisateur mis à jour avec succès",
      previousState: currentUser,
      currentState: updatedUser,
    })
  } catch (error) {
    console.error("Erreur lors de la correction d'urgence:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
