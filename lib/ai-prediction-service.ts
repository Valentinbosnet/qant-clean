import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { StockHistoryPoint } from "./stock-service"
import type { PredictionPoint, PredictionResult } from "./prediction-service"
import { generatePrediction } from "./prediction-service"
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
 * Extrait le JSON d'une réponse potentiellement formatée en Markdown
 * @param text Texte à analyser
 * @returns JSON extrait ou le texte original si aucun bloc JSON n'est trouvé
 */
function extractJsonFromMarkdown(text: string): string {
  // Rechercher un bloc JSON dans la réponse Markdown
  const jsonRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
  const match = text.match(jsonRegex)

  if (match && match[1]) {
    console.log("JSON extrait du bloc Markdown")
    return match[1]
  }

  // Vérifier si le texte commence directement par {
  if (text.trim().startsWith("{") && text.trim().endsWith("}")) {
    console.log("Le texte est déjà au format JSON")
    return text
  }

  // Si aucun bloc JSON n'est trouvé, essayer d'extraire tout ce qui ressemble à du JSON
  const anyJsonRegex = /(\{[\s\S]*?\})/
  const anyMatch = text.match(anyJsonRegex)

  if (anyMatch && anyMatch[1]) {
    console.log("JSON extrait du texte (méthode alternative)")
    return anyMatch[1]
  }

  console.log("Aucun JSON trouvé dans la réponse, retour du texte original")
  console.log("Premiers 100 caractères de la réponse:", text.substring(0, 100))
  return text
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
  stock?: any,
): Promise<PredictionResult> {
  try {
    // Vérifier que la clé API OpenAI est disponible
    // Utiliser directement la clé API de l'environnement serveur
    const apiKey = serverEnv.OPENAI_API_KEY

    // Log pour le débogage (ne pas inclure la clé complète en production)
    console.log("OpenAI API key status:", apiKey ? "Available (length: " + apiKey.length + ")" : "Missing")

    if (!apiKey) {
      console.warn("OpenAI API key is missing. Falling back to ensemble prediction algorithm.")

      // Si la clé API n'est pas disponible, utiliser l'algorithme d'ensemble comme solution de secours
      if (stock && historicalData) {
        const fallbackPrediction = await generatePrediction(
          symbol,
          historicalData,
          {
            algorithm: "ensemble",
            days,
          },
          stock,
        )

        // Ajouter une note dans le raisonnement pour indiquer que c'est une prédiction de secours
        return {
          ...fallbackPrediction,
          algorithm: "ai-fallback",
          aiReasoning:
            "Prédiction générée par l'algorithme d'ensemble car la clé API OpenAI n'est pas configurée. Veuillez configurer votre clé API dans les paramètres pour utiliser les prédictions basées sur l'IA.",
        }
      }

      throw new Error("OpenAI API key is missing. Please check your environment variables.")
    }

    console.log("Generating AI prediction with OpenAI API key available:", !!apiKey)

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

IMPORTANT: Réponds UNIQUEMENT avec un objet JSON brut sans utiliser de délimiteurs de bloc de code comme \`\`\`json ou \`\`\`.
N'utilise pas de Markdown. Réponds directement avec l'objet JSON au format suivant:

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

    try {
      // Appeler l'API OpenAI avec la clé API du serveur
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.2, // Réduire la température pour des résultats plus cohérents
        maxTokens: 2000,
        apiKey, // Utiliser la clé API du serveur
      })

      console.log("OpenAI API response received, length:", text.length)
      console.log("OpenAI API response starts with:", text.substring(0, 50))

      // Extraire le JSON de la réponse Markdown si nécessaire
      const jsonText = extractJsonFromMarkdown(text)
      console.log("Extracted JSON starts with:", jsonText.substring(0, 50))

      try {
        // Analyser la réponse JSON
        const aiResponse: AIPredictionResponse = JSON.parse(jsonText)

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
      } catch (jsonError) {
        console.error("Erreur lors de l'analyse JSON:", jsonError)
        console.error("Contenu brut de la réponse:", text)
        throw new Error(
          `Erreur lors de l'analyse JSON: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`,
        )
      }
    } catch (openaiError) {
      console.error("Erreur spécifique à l'API OpenAI:", openaiError)

      // Erreur plus détaillée pour faciliter le débogage
      throw new Error(
        `Erreur lors de l'appel à l'API OpenAI: ${openaiError instanceof Error ? openaiError.message : String(openaiError)}`,
      )
    }
  } catch (error) {
    console.error("Erreur lors de la génération de prédictions IA:", error)

    // Si l'erreur est liée à la clé API et que nous avons les données nécessaires pour une prédiction de secours
    if (error instanceof Error && error.message.includes("API key") && stock && historicalData) {
      console.log("Falling back to ensemble prediction due to API key error")

      // Utiliser l'algorithme d'ensemble comme solution de secours
      const fallbackPrediction = await generatePrediction(
        symbol,
        historicalData,
        {
          algorithm: "ensemble",
          days,
        },
        stock,
      )

      // Ajouter une note dans le raisonnement pour indiquer que c'est une prédiction de secours
      return {
        ...fallbackPrediction,
        algorithm: "ai-fallback",
        aiReasoning:
          "Prédiction générée par l'algorithme d'ensemble car la clé API OpenAI n'est pas configurée correctement. Veuillez vérifier votre clé API dans les paramètres.",
      }
    }

    throw new Error(
      `Échec de la génération de prédictions IA: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
