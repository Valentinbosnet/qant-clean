import { NextResponse } from "next/server"
import { generateEnhancedAIPrediction } from "@/lib/enhanced-ai-prediction-service"
import { getStockData } from "@/lib/stock-service"
import { serverEnv } from "@/lib/env-config"

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

    // Vérifier que la clé API OpenAI est disponible
    const apiKey = serverEnv.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is missing. Please check your environment variables." },
        { status: 500 },
      )
    }

    // Générer la prédiction enrichie
    const prediction = await generateEnhancedAIPrediction(
      symbol,
      stockData.name,
      stockData.price,
      stockData.history,
      days,
      apiKey,
    )

    return NextResponse.json(prediction)
  } catch (error) {
    console.error("Erreur lors de la génération de prédictions IA enrichies via API:", error)
    return NextResponse.json(
      {
        error: "Échec de la génération de prédictions IA enrichies",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
