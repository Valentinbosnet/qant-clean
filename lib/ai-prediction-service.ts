import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { StockHistoryPoint } from "./stock-service"
import type { PredictionPoint, PredictionResult } from "./prediction-service"
import { serverEnv } from "./env-config"

/**
 * Interface pour la réponse de l'IA
 */
interface AIPredictionResponse {
  trend: "up" | "down" | "neutral"
  shortTermTarget: number
  longTermTarget: number
  confidence: number
  reasoning: string
  dailyPredictions: Array<{
    date: string
    price: number
  }>
}

/**
 * Génère des prédictions pour une action en utilisant l'IA
 * Cette fonction doit être appelée uniquement côté serveur
 */
export async function generateAIPrediction(
  symbol: string,
  stockName: string,
  currentPrice: number,
  historicalData: StockHistoryPoint[],
  days = 30,
): Promise<PredictionResult> {
  try {
    // Vérifier que la clé API OpenAI est disponible
    if (!serverEnv.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is missing. Please check your environment variables.")
    }

    // Préparer les données historiques pour l'IA
    const historicalPrices = historicalData
      .slice(0, Math.min(60, historicalData.length))
      .map((point) => ({
        date: point.date,
        price: point.price,
      }))
      .reverse() // Ordre chronologique pour l'IA

    // Construire le prompt pour l'IA
    const prompt = `
Tu es un analyste financier expert. Analyse les données historiques suivantes pour l'action ${symbol} (${stockName}) et génère une prédiction de prix pour les ${days} prochains jours.

Prix actuel: ${currentPrice}

Données historiques (des plus anciennes aux plus récentes):
${JSON.stringify(historicalPrices, null, 2)}

Génère une prédiction détaillée qui inclut:
1. La tendance générale (up, down, ou neutral)
2. Un objectif de prix à court terme (7 jours)
3. Un objectif de prix à long terme (${days} jours)
4. Un niveau de confiance (entre 0 et 1)
5. Une explication de ton raisonnement
6. Des prédictions quotidiennes pour les ${days} prochains jours

Réponds uniquement avec un objet JSON valide au format suivant, sans texte supplémentaire:
{
  "trend": "up|down|neutral",
  "shortTermTarget": number,
  "longTermTarget": number,
  "confidence": number,
  "reasoning": "string",
  "dailyPredictions": [
    { "date": "YYYY-MM-DD", "price": number }
  ]
}
`

    // Appeler l'API OpenAI avec la clé API du serveur
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.2, // Réduire la température pour des résultats plus cohérents
      maxTokens: 2000,
      apiKey: serverEnv.OPENAI_API_KEY, // Utiliser la clé API du serveur
    })

    // Analyser la réponse JSON
    const aiResponse: AIPredictionResponse = JSON.parse(text)

    // Générer les points de prédiction
    const predictionPoints: PredictionPoint[] = []

    // Ajouter d'abord les points historiques
    for (let i = 0; i < historicalData.length; i++) {
      predictionPoints.push({
        date: historicalData[i].date,
        price: historicalData[i].price,
        isEstimate: false,
      })
    }

    // Ajouter les prédictions de l'IA
    for (const prediction of aiResponse.dailyPredictions) {
      predictionPoints.push({
        date: prediction.date,
        price: prediction.price,
        isEstimate: true,
      })
    }

    // Construire le résultat
    return {
      symbol,
      algorithm: "ai",
      points: predictionPoints,
      metrics: {
        confidence: aiResponse.confidence,
        accuracy: aiResponse.confidence * 0.9, // Estimation basée sur la confiance
      },
      trend: aiResponse.trend,
      shortTermTarget: aiResponse.shortTermTarget,
      longTermTarget: aiResponse.longTermTarget,
      aiReasoning: aiResponse.reasoning,
    }
  } catch (error) {
    console.error("Erreur lors de la génération de prédictions IA:", error)
    throw new Error(
      `Échec de la génération de prédictions IA: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
