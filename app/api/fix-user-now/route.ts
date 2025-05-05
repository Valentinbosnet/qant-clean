import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Obtenir la session actuelle
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Mettre à jour l'utilisateur pour marquer l'email comme vérifié et l'onboarding comme complété
    await db.user.update({
      where: { id: session.user.id },
      data: {
        emailVerified: new Date(),
        onboardingCompleted: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Utilisateur mis à jour avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
