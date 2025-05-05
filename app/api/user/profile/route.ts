import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Récupérer l'ID utilisateur depuis le cookie
    const sessionCookie = cookies().get("app-session")
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    let userId
    try {
      const sessionData = JSON.parse(sessionCookie.value)
      userId = sessionData.id
    } catch (error) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 })
    }

    if (!userId) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Récupérer les informations de l'utilisateur
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Récupérer les informations d'abonnement
    let subscription = null
    try {
      const subscriptionData = await db.subscription.findUnique({
        where: { userId },
        select: {
          plan: true,
          status: true,
          stripeCurrentPeriodEnd: true,
        },
      })

      if (subscriptionData) {
        const isActive =
          subscriptionData.status === "active" &&
          subscriptionData.stripeCurrentPeriodEnd &&
          subscriptionData.stripeCurrentPeriodEnd.getTime() > Date.now()

        subscription = {
          plan: subscriptionData.plan,
          status: subscriptionData.status,
          active: isActive,
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'abonnement:", error)

      // Vérifier si nous avons un cookie d'abonnement
      const subscriptionCookie = cookies().get("has-subscription")
      if (subscriptionCookie?.value) {
        try {
          const subscriptionData = JSON.parse(subscriptionCookie.value)
          subscription = {
            plan: subscriptionData.plan,
            status: "active",
            active: subscriptionData.active,
          }
        } catch (e) {
          console.error("Erreur lors de la lecture du cookie d'abonnement:", e)
        }
      }
    }

    return NextResponse.json({
      ...user,
      subscription,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
