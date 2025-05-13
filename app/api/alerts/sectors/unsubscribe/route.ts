import { NextResponse } from "next/server"
import { sectorAlertsService } from "@/lib/sector-alerts-service"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsubscribe token is required",
        },
        { status: 400 },
      )
    }

    // Décoder le token pour obtenir l'ID utilisateur
    // Note: Dans une implémentation réelle, vous utiliseriez un système de jetons sécurisés
    // comme JWT avec une signature pour vérifier l'authenticité du jeton
    const userId = decodeUnsubscribeToken(token)

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid unsubscribe token",
        },
        { status: 400 },
      )
    }

    // Récupérer les préférences actuelles
    const preferences = await sectorAlertsService.getPreferences(userId)

    // Désactiver les notifications par email
    preferences.notificationChannels.email = false

    // Mettre à jour les préférences
    await sectorAlertsService.updatePreferences(preferences)

    // Rediriger vers une page de confirmation
    return NextResponse.redirect(new URL("/alerts/sectors/unsubscribed", request.url))
  } catch (error) {
    console.error("Error unsubscribing from sector alerts:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Fonction pour décoder le token de désabonnement
// Note: Dans une implémentation réelle, vous utiliseriez un système plus sécurisé
function decodeUnsubscribeToken(token: string): string | null {
  try {
    // Format simple pour l'exemple: "user_id:timestamp:hash"
    const parts = token.split(":")
    if (parts.length !== 3) {
      return null
    }

    const userId = parts[0]
    const timestamp = Number.parseInt(parts[1])
    const hash = parts[2]

    // Vérifier si le token a expiré (30 jours)
    const now = Date.now()
    if (now - timestamp > 30 * 24 * 60 * 60 * 1000) {
      return null
    }

    // Dans une implémentation réelle, vous vérifieriez également le hash
    // pour vous assurer que le token n'a pas été falsifié

    return userId
  } catch (error) {
    console.error("Error decoding unsubscribe token:", error)
    return null
  }
}
