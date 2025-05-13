import { verifyAlphaVantageApiKey } from "@/actions/stock-api"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await verifyAlphaVantageApiKey()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error checking Alpha Vantage API key:", error)
    return NextResponse.json(
      {
        valid: false,
        message: error instanceof Error ? error.message : "Une erreur s'est produite",
      },
      { status: 500 },
    )
  }
}
