import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    console.log("Vérification du statut de l'utilisateur")

    // Obtenir la session actuelle
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.log("Utilisateur non authentifié")
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Récupérer les informations actuelles de l'utilisateur
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        emailVerified: true,
        onboardingCompleted: true,
      },
    })

    if (!user) {
      console.log("Utilisateur non trouvé")
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    console.log("Statut de l'utilisateur récupéré:", {
      emailVerified: !!user.emailVerified,
      onboardingCompleted: user.onboardingCompleted,
    })

    return NextResponse.json({
      emailVerified: !!user.emailVerified,
      onboardingCompleted: user.onboardingCompleted,
    })
  } catch (error) {
    console.error("Erreur lors de la vérification du statut:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
