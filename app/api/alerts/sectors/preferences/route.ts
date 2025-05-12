import { NextResponse } from "next/server"
import { sectorAlertsService } from "@/lib/sector-alerts-service"

export async function GET(request: Request) {
  try {
    // Récupérer l'ID utilisateur de la requête (si disponible)
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId") || undefined

    // Récupérer les préférences d'alertes sectorielles
    const preferences = await sectorAlertsService.getPreferences(userId)

    return NextResponse.json({
      success: true,
      preferences,
    })
  } catch (error) {
    console.error("Error getting sector alert preferences:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { preferences } = body

    if (!preferences) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing preferences in request body",
        },
        { status: 400 },
      )
    }

    // Mettre à jour les préférences d'alertes sectorielles
    await sectorAlertsService.updatePreferences(preferences)

    return NextResponse.json({
      success: true,
      message: "Preferences updated successfully",
    })
  } catch (error) {
    console.error("Error updating sector alert preferences:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
