import { NextResponse } from "next/server"
import { sectorAlertsService } from "@/lib/sector-alerts-service"

export async function GET(request: Request) {
  try {
    // Récupérer l'ID utilisateur de la requête (si disponible)
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId") || undefined

    // Vérifier les mises à jour des indicateurs sectoriels
    const newAlerts = await sectorAlertsService.checkSectorIndicators(userId)

    return NextResponse.json({
      success: true,
      newAlertsCount: newAlerts.length,
      alerts: newAlerts,
    })
  } catch (error) {
    console.error("Error checking sector indicators:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
