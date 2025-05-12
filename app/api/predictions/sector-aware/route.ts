import { type NextRequest, NextResponse } from "next/server"
import { generateSectorAwarePrediction } from "@/lib/sector-aware-prediction-service"
import { getStockHistory } from "@/lib/stock-service"

export const maxDuration = 30 // 30 secondes maximum

export async function POST(request: NextRequest) {
  try {
    const { symbol, days = 30 } = await request.json()

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    // Récupérer les données historiques
    const stockData = await getStockHistory(symbol)

    if (!stockData || !stockData.history || stockData.history.length === 0) {
      return NextResponse.json({ error: "No historical data available for this symbol" }, { status: 404 })
    }

    // Générer la prédiction spécifique au secteur
    const prediction = await generateSectorAwarePrediction(
      symbol,
      stockData.name || symbol,
      stockData.history[0].price,
      stockData.history,
      days,
    )

    return NextResponse.json(prediction)
  } catch (error) {
    console.error("Error in sector-aware prediction API:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
