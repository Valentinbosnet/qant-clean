import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ hasSubscription: false, error: "Non autorisé" }, { status: 401 })
    }

    // Récupérer l'utilisateur
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: {
          where: {
            OR: [{ status: "active" }, { status: "trialing" }],
          },
          select: {
            id: true,
            userId: true,
            plan: true,
            status: true,
            stripeCurrentPeriodEnd: true, // Include stripeCurrentPeriodEnd
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ hasSubscription: false, error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Vérifier si l'utilisateur a un abonnement actif
    const hasSubscription = user.subscription && user.subscription.length > 0

    return NextResponse.json({ hasSubscription })
  } catch (error) {
    console.error("Erreur lors de la vérification de l'abonnement:", error)
    return NextResponse.json(
      {
        hasSubscription: false,
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
