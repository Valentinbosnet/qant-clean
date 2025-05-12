import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { StockHistoryPoint } from "./stock-service"
import type { PredictionPoint, PredictionResult } from "./prediction-service"
import { serverEnv } from "./env-config"
import { extractJsonFromMarkdown } from "./json-extractor"
import { getSectorInfo } from "./sector-classification"
import { generateSectorSpecificPrompt } from "./sector-prompts"

/**
 * Interface pour la réponse de l'IA spécifique au secteur
 */
interface SectorAwarePredictionResponse {
  trend: "up" | "down" | "neutral"
  shortTermTarget: number
  longTermTarget: number
  confidence: number
  reasoning: string
  catalysts: string[]
  risks: string[]
  sectorSpecificInsights: string
  dailyPredictions?: Array<{
    date: string
    price: number
  }>
}

/**
 * Génère une prédiction IA spécifique au secteur
 */
export async function generateSectorAwarePrediction(
  symbol: string,
  stockName: string,
  currentPrice: number,
  historicalData: StockHistoryPoint[],
  days = 30,
  apiKey?: string,
): Promise<PredictionResult> {
  try {
    // Vérifier si une clé API est disponible
    const key = apiKey || serverEnv.OPENAI_API_KEY

    if (!key || key.trim() === "") {
      console.log("No OpenAI API key available, using rule-based prediction")
      return generateSimplePrediction(symbol, stockName, currentPrice, historicalData, days)
    }

    // Déterminer le secteur du symbole
    const sectorInfo = getSectorInfo(symbol)
    console.log(`Generating sector-aware prediction for ${symbol} in sector: ${sectorInfo.sector}`)

    // Réduire les données historiques (seulement 10 points)
    const reducedHistoricalData = historicalData
      .filter((_, index) => index % 5 === 0) // Prendre 1 point sur 5
      .slice(0, 10) // Limiter à 10 points maximum
      .map((point) => ({
        date: point.date,
        price: Number.parseFloat(point.price.toFixed(2)), // Réduire la précision
      }))
      .reverse() // Ordre chronologique

    // Générer un prompt spécifique au secteur
    const prompt = generateSectorSpecificPrompt(sectorInfo.sector, symbol, stockName, currentPrice)

    // Configurer un timeout
    const timeoutMs = 20000 // 20 secondes
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      // Utiliser GPT-3.5 Turbo pour plus de rapidité
      const { text } = await generateText({
        model: openai("gpt-3.5-turbo"),
        prompt,
        temperature: 0.2,
        maxTokens: 1200,
        apiKey: key,
      })

      clearTimeout(timeoutId)
      console.log("OpenAI API response received, length:", text.length)

      // Extraire le JSON de la réponse
      const jsonText = extractJsonFromMarkdown(text)

      try {
        // Analyser la réponse JSON
        const aiResponse: SectorAwarePredictionResponse = JSON.parse(jsonText)

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

        // Générer les dates pour les prédictions
        const lastDate = new Date(historicalData[0].date)
        const predictedDates: string[] = []

        for (let i = 1; i <= days; i++) {
          const nextDate = new Date(lastDate)
          nextDate.setDate(lastDate.getDate() + i)
          predictedDates.push(nextDate.toISOString().split("T")[0])
        }

        // Ajouter les prédictions
        // Si l'IA n'a pas fourni de prédictions quotidiennes, interpoler
        if (!aiResponse.dailyPredictions || aiResponse.dailyPredictions.length < days) {
          const startPrice = historicalData[0].price
          const endPrice =
            aiResponse.longTermTarget ||
            startPrice * (1 + (aiResponse.trend === "up" ? 0.05 : aiResponse.trend === "down" ? -0.05 : 0))

          for (let i = 0; i < days; i++) {
            const progress = i / (days - 1)
            const price = startPrice + (endPrice - startPrice) * progress

            predictionPoints.push({
              date: predictedDates[i],
              price,
              isEstimate: true,
            })
          }
        } else {
          // Utiliser les prédictions fournies par l'IA
          for (let i = 0; i < Math.min(days, aiResponse.dailyPredictions.length); i++) {
            predictionPoints.push({
              date: predictedDates[i],
              price: aiResponse.dailyPredictions[i].price,
              isEstimate: true,
            })
          }
        }

        // Construire le résultat
        return {
          symbol,
          algorithm: "ai-sector-aware",
          points: predictionPoints,
          metrics: {
            confidence: aiResponse.confidence || 0.7,
            accuracy: (aiResponse.confidence || 0.7) * 0.9,
          },
          trend: aiResponse.trend,
          shortTermTarget: aiResponse.shortTermTarget || predictionPoints[historicalData.length + 6].price,
          longTermTarget: aiResponse.longTermTarget || predictionPoints[predictionPoints.length - 1].price,
          aiReasoning: aiResponse.reasoning || "Prédiction basée sur l'analyse des données historiques.",
          sectorInsights: aiResponse.sectorSpecificInsights,
          catalysts: aiResponse.catalysts || [],
          risks: aiResponse.risks || [],
          sector: sectorInfo.sector,
        }
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError)
        console.log("Raw response:", text.substring(0, 200) + "...")
        throw new Error("Failed to parse AI response")
      }
    } catch (apiError) {
      clearTimeout(timeoutId)
      console.error("API error:", apiError)
      throw new Error("OpenAI API request failed")
    }
  } catch (error) {
    console.error("Error in sector-aware prediction:", error)
    return generateSimplePrediction(symbol, stockName, currentPrice, historicalData, days)
  }
}

/**
 * Génère une prédiction simple basée sur des règles
 * Version simplifiée pour servir de fallback
 */
function generateSimplePrediction(
  symbol: string,
  stockName: string,
  currentPrice: number,
  historicalData: StockHistoryPoint[],
  days = 30,
): Promise<PredictionResult> {
  return new Promise((resolve) => {
    // Calculer la tendance récente (sur 10 jours ou moins)
    const recentDays = Math.min(10, historicalData.length)
    const recentHistory = historicalData.slice(0, recentDays)
    const oldestPrice = recentHistory[recentHistory.length - 1].price
    const newestPrice = recentHistory[0].price
    const trendPercentage = (newestPrice / oldestPrice - 1) * 100

    // Déterminer la tendance
    let trend: "up" | "down" | "neutral" = "neutral"
    if (trendPercentage > 3) {
      trend = "up"
    } else if (trendPercentage < -3) {
      trend = "down"
    }

    // Calculer la volatilité
    const returns: number[] = []
    for (let i = 1; i < Math.min(10, historicalData.length); i++) {
      const dailyReturn = historicalData[i - 1].price / historicalData[i].price - 1
      returns.push(dailyReturn)
    }
    const volatility = Math.sqrt(returns.reduce((sum, val) => sum + val * val, 0) / returns.length)

    // Générer les points de prédiction
    const predictionPoints: PredictionPoint[] = []

    // Ajouter les points historiques
    for (let i = 0; i < historicalData.length; i++) {
      predictionPoints.push({
        date: historicalData[i].date,
        price: historicalData[i].price,
        isEstimate: false,
      })
    }

    // Dernière date et prix connus
    const lastDate = new Date(historicalData[0].date)
    const lastPrice = historicalData[0].price

    // Facteur de tendance simplifié
    const trendFactor = trend === "up" ? 0.001 : trend === "down" ? -0.001 : 0

    // Générer les prédictions futures
    for (let i = 1; i <= days; i++) {
      const nextDate = new Date(lastDate)
      nextDate.setDate(lastDate.getDate() + i)

      // Calculer le prix prédit avec un peu de bruit aléatoire
      const dayFactor = 1 + trendFactor * i
      const noise = (Math.random() - 0.5) * volatility * lastPrice
      const nextPrice = lastPrice * dayFactor + noise

      predictionPoints.push({
        date: nextDate.toISOString().split("T")[0],
        price: nextPrice,
        isEstimate: true,
      })
    }

    // Calculer les objectifs de prix
    const shortTermIndex = Math.min(7, days)
    const shortTermTarget = predictionPoints[historicalData.length + shortTermIndex - 1].price
    const longTermTarget = predictionPoints[predictionPoints.length - 1].price

    // Obtenir le secteur
    const sectorInfo = getSectorInfo(symbol)

    // Résultat final
    resolve({
      symbol,
      algorithm: "simple",
      points: predictionPoints,
      metrics: {
        confidence: 0.7,
        accuracy: 0.65,
      },
      trend,
      shortTermTarget,
      longTermTarget,
      aiReasoning: `Prédiction basée sur l'analyse de la tendance récente de ${trendPercentage.toFixed(1)}% sur ${recentDays} jours.`,
      sector: sectorInfo.sector,
      catalysts: [],
      risks: [],
    })
  })
}
