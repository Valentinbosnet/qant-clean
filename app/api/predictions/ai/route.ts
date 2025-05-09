import { NextResponse } from "next/server"
import { generateAIPrediction } from "@/lib/ai-prediction-service"
import { getStockData } from "@/lib/stock-service"

export async function POST(request: Request) {
  try {
    const { symbol, days = 30 } = await request.json()

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    // Récupérer les données de l'action
    const stockData = await getStockData(symbol)

    if (!stockData.history || stockData.history.length < 30) {
      return NextResponse.json(
        { error: "Données historiques insuffisantes pour générer une prédiction" },
        { status: 400 },
      )
    }

    // Générer la prédiction IA
    const prediction = await generateAIPrediction(
      symbol,
      stockData.name,
      stockData.price,
      stockData.history,
      days,
      stockData,
    )

    return NextResponse.json(prediction)
  } catch (error) {
    console.error("Erreur lors de la génération de prédictions IA via API:", error)
    return NextResponse.json(
      {
        error: "Échec de la génération de prédictions IA",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
