import { NextResponse } from "next/server"
import { verifyAlphaVantageApiKey } from "@/lib/stock-service"

export async function GET() {
  try {
    const result = await verifyAlphaVantageApiKey()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Erreur lors de la vérification de la clé Alpha Vantage:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
