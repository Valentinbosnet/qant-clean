import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { StockHistoryPoint } from "./stock-service"
import type { PredictionPoint, PredictionResult } from "./prediction-service"
import { serverEnv } from "./env-config"
import { extractJsonFromMarkdown } from "./json-extractor"
import { getTechnicalIndicators } from "./technical-indicators"
import { getCompanyFundamentals } from "./stock-service"
import { getSentimentData } from "./sentiment-service"
import { getMacroeconomicData } from "./macroeconomic-service"

/**
 * Interface pour la réponse de l'IA enrichie
 */
interface EnhancedAIPredictionResponse {
  trend: "up" | "down" | "neutral"
  shortTermTarget: number
  longTermTarget: number
  confidence: number
  reasoning: string
  technicalAnalysis: {
    summary: string
    indicators: Record<string, number>
    trend: "bullish" | "bearish" | "neutral"
  }
  fundamentalAnalysis: {
    summary: string
    keyMetrics: Record<string, number | string>
    outlook: "positive" | "negative" | "neutral"
  }
  sentimentAnalysis: {
    summary: string
    score: number
    sources: string[]
  }
  macroeconomicFactors: {
    summary: string
    impact: "positive" | "negative" | "neutral"
    keyFactors: string[]
  }
  catalysts: string[]
  risks: string[]
  dailyPredictions: Array<{
    date: string
    price: number
    confidenceLow?: number
    confidenceHigh?: number
  }>
}

/**
 * Génère des prédictions enrichies pour une action en utilisant l'IA
 */
export async function generateEnhancedAIPrediction(
  symbol: string,
  stockName: string,
  currentPrice: number,
  historicalData: StockHistoryPoint[],
  days = 30,
  apiKey?: string,
): Promise<PredictionResult> {
  try {
    // Utiliser la clé API fournie ou celle de l'environnement
    const key = apiKey || serverEnv.OPENAI_API_KEY

    if (!key) {
      throw new Error("OpenAI API key is missing. Please check your environment variables.")
    }

    console.log("Generating enhanced AI prediction with OpenAI API key available")

    // Récupérer des données supplémentaires pour enrichir l'analyse
    const technicalIndicators = await getTechnicalIndicators(symbol)
    const fundamentals = await getCompanyFundamentals(symbol)
    const sentimentData = await getSentimentData(symbol)
    const macroData = await getMacroeconomicData()

    // Préparer les données historiques pour l'IA
    const historicalPrices = historicalData
      .slice(0, Math.min(60, historicalData.length))
      .map((point) => ({
        date: point.date,
        price: point.price,
      }))
      .reverse() // Ordre chronologique pour l'IA

    // Construire un prompt beaucoup plus directif et détaillé
    const prompt = `
Tu es un analyste financier expert spécialisé dans les prédictions de prix d'actions. Ta mission est de fournir une prédiction précise et détaillée pour l'action ${symbol} (${stockName}) sur les ${days} prochains jours.

DONNÉES ACTUELLES:
- Prix actuel: ${currentPrice}
- Date d'aujourd'hui: ${new Date().toISOString().split("T")[0]}

DONNÉES HISTORIQUES:
${JSON.stringify(historicalPrices, null, 2)}

INDICATEURS TECHNIQUES:
${JSON.stringify(technicalIndicators, null, 2)}

DONNÉES FONDAMENTALES:
${JSON.stringify(fundamentals, null, 2)}

ANALYSE DE SENTIMENT:
${JSON.stringify(sentimentData, null, 2)}

CONTEXTE MACROÉCONOMIQUE:
${JSON.stringify(macroData, null, 2)}

INSTRUCTIONS:
1. Analyse TOUTES les données fournies et formule une prédiction PRÉCISE et NUMÉRIQUE.
2. Tu DOIS fournir des prix cibles spécifiques, pas des généralités.
3. Utilise les indicateurs techniques, l'analyse fondamentale, le sentiment et les facteurs macroéconomiques.
4. Identifie les catalyseurs potentiels et les risques qui pourraient affecter le prix.
5. Fournis une prédiction quotidienne pour chaque jour de la période demandée.
6. Inclus des intervalles de confiance pour tes prédictions.
7. Explique ton raisonnement de manière détaillée.

IMPORTANT: Ta réponse DOIT être un objet JSON valide avec la structure exacte suivante, sans aucun texte supplémentaire:

{
  "trend": "up|down|neutral",
  "shortTermTarget": number,
  "longTermTarget": number,
  "confidence": number,
  "reasoning": "string",
  "technicalAnalysis": {
    "summary": "string",
    "indicators": {"RSI": number, "MACD": number, "MA50": number},
    "trend": "bullish|bearish|neutral"
  },
  "fundamentalAnalysis": {
    "summary": "string",
    "keyMetrics": {"P/E": number, "EPS": number},
    "outlook": "positive|negative|neutral"
  },
  "sentimentAnalysis": {
    "summary": "string",
    "score": number,
    "sources": ["string"]
  },
  "macroeconomicFactors": {
    "summary": "string",
    "impact": "positive|negative|neutral",
    "keyFactors": ["string"]
  },
  "catalysts": ["string"],
  "risks": ["string"],
  "dailyPredictions": [
    {"date": "YYYY-MM-DD", "price": number, "confidenceLow": number, "confidenceHigh": number}
  ]
}

N'inclus PAS de délimiteurs de bloc de code comme \`\`\`json ou \`\`\`. Réponds UNIQUEMENT avec l'objet JSON.
`

    try {
      // Appeler l'API OpenAI avec la clé API
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.1, // Température plus basse pour des résultats plus déterministes
        maxTokens: 3000, // Augmenter pour permettre des réponses plus détaillées
        apiKey: key,
      })

      console.log("OpenAI API response received, length:", text.length)

      // Extraire le JSON de la réponse
      const jsonText = extractJsonFromMarkdown(text)
      console.log("Extracted JSON starts with:", jsonText.substring(0, 50))

      try {
        // Analyser la réponse JSON
        const aiResponse: EnhancedAIPredictionResponse = JSON.parse(jsonText)

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
            confidenceLow: prediction.confidenceLow,
            confidenceHigh: prediction.confidenceHigh,
          })
        }

        // Construire le résultat enrichi
        return {
          symbol,
          algorithm: "ai-enhanced",
          points: predictionPoints,
          metrics: {
            confidence: aiResponse.confidence,
            accuracy: aiResponse.confidence * 0.9,
          },
          trend: aiResponse.trend,
          shortTermTarget: aiResponse.shortTermTarget,
          longTermTarget: aiResponse.longTermTarget,
          aiReasoning: aiResponse.reasoning,
          technicalAnalysis: {
            summary: aiResponse.technicalAnalysis.summary,
            indicators: aiResponse.technicalAnalysis.indicators,
            trend: aiResponse.technicalAnalysis.trend,
          },
          fundamentalAnalysis: {
            summary: aiResponse.fundamentalAnalysis.summary,
            keyMetrics: aiResponse.fundamentalAnalysis.keyMetrics,
            outlook: aiResponse.fundamentalAnalysis.outlook,
          },
          sentimentAnalysis: {
            summary: aiResponse.sentimentAnalysis.summary,
            score: aiResponse.sentimentAnalysis.score,
            sources: aiResponse.sentimentAnalysis.sources,
          },
          macroeconomicAnalysis: {
            summary: aiResponse.macroeconomicFactors.summary,
            impact: aiResponse.macroeconomicFactors.impact,
            keyFactors: aiResponse.macroeconomicFactors.keyFactors,
          },
          catalysts: aiResponse.catalysts,
          risks: aiResponse.risks,
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
      throw new Error(
        `Erreur lors de l'appel à l'API OpenAI: ${openaiError instanceof Error ? openaiError.message : String(openaiError)}`,
      )
    }
  } catch (error) {
    console.error("Erreur lors de la génération de prédictions IA enrichies:", error)
    throw new Error(
      `Échec de la génération de prédictions IA enrichies: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
