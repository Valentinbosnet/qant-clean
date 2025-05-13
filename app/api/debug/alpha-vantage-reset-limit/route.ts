import { resetRateLimitStatus } from "@/actions/stock-api"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const wasLimited = await resetRateLimitStatus()
    return NextResponse.json({
      success: true,
      wasLimited,
      message: wasLimited ? "Limite réinitialisée avec succès" : "Aucune limite n'était active",
    })
  } catch (error) {
    console.error("Error resetting rate limit status:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Une erreur s'est produite",
      },
      { status: 500 },
    )
  }
}
