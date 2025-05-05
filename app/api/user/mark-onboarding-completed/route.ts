import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST() {
  try {
    console.log("Marquage de l'onboarding comme complété")

    // Obtenir la session actuelle
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.log("Utilisateur non authentifié")
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Mettre à jour l'utilisateur pour marquer l'onboarding comme complété
    await db.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: true,
      },
    })

    console.log("Onboarding marqué comme complété avec succès")
    return NextResponse.json({
      success: true,
      message: "Onboarding complété avec succès",
    })
  } catch (error) {
    console.error("Erreur lors du marquage de l'onboarding:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
