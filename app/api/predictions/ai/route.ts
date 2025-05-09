import { NextResponse } from "next/server"
import { generateAIPrediction } from "@/lib/ai-prediction-service"
import { getStockData } from "@/lib/stock-service"
import { serverEnv } from "@/lib/env-config"
import { debugOpenAIKey } from "@/lib/api-key-debugger"

export async function POST(request: Request) {
  try {
    // Obtenir les informations de débogage de la clé API
    const apiKeyDebug = debugOpenAIKey()
    console.log("API Key Debug in Prediction AI Route:", apiKeyDebug)

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

    // Vérifier si la clé API est disponible
    if (!apiKeyDebug.keyExists) {
      return NextResponse.json(
        {
          error: "OpenAI API key is missing",
          debug: apiKeyDebug,
        },
        { status: 400 },
      )
    }

    // Si la clé n'a pas le bon format, avertir mais continuer
    if (apiKeyDebug.keyFormat === "invalid") {
      console.warn("OpenAI API key format may be invalid (does not start with sk-)")
    }

    // Générer la prédiction IA en passant explicitement la clé API
    console.log("Generating AI prediction with API key available")
    const prediction = await generateAIPrediction(
      symbol,
      stockData.name,
      stockData.price,
      stockData.history,
      days,
      stockData,
      serverEnv.OPENAI_API_KEY, // Passer explicitement la clé API
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
