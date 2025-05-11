import { type NextRequest, NextResponse } from "next/server"
import { getStockData } from "@/lib/stock-service"
import { generateEnhancedAIPrediction } from "@/lib/enhanced-ai-prediction-service"
import { serverEnv } from "@/lib/env-config"

export async function POST(request: NextRequest) {
  try {
    const { symbol, days = 30 } = await request.json()

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    // Vérifier que la clé API est disponible
    const apiKey = serverEnv.OPENAI_API_KEY
    console.log(
      "API Key Status:",
      apiKey ? "Available (starting with " + apiKey.substring(0, 3) + "...)" : "Not available",
    )

    // Récupérer les données de l'action
    const stockData = await getStockData(symbol)

    if (!stockData) {
      return NextResponse.json({ error: "Stock data not found" }, { status: 404 })
    }

    // Générer la prédiction enrichie en passant explicitement la clé API
    const prediction = await generateEnhancedAIPrediction(
      symbol,
      stockData.name,
      stockData.price,
      stockData.history,
      days,
      apiKey, // Passer explicitement la clé API
    )

    return NextResponse.json(prediction)
  } catch (error) {
    console.error("Error in AI enhanced prediction API:", error)
    return NextResponse.json(
      { error: `Failed to generate enhanced prediction: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
