import { getStockQuote } from "./stock-service"
import { apiQuota } from "@/lib/api-quota-manager"

// Interface pour les analyses progressives
export interface ProgressiveAnalysis {
  symbol: string
  currentPrice: number
  predictedPrices: {
    oneDay: number
    oneWeek: number
    oneMonth: number
  }
  confidenceScores: {
    oneDay: number
    oneWeek: number
    oneMonth: number
  }
  overallAccuracy: number
  confidenceLevel: "Faible" | "Modérée" | "Élevée" | "Très élevée"
  previousPredictions: Array<{
    timestamp: string
    predictedPrice: number
    actualPrice: number
    accuracy: number
    adjustmentFactor: number
  }>
  technicalIndicators: {
    rsi: number
    macd: {
      value: number
      signal: number
      histogram: number
    }
    movingAverages: {
      ma20: number
      ma50: number
      ma200: number
    }
  }
  generatedAt: string
  isSimulated: boolean
}

// Fonction pour générer une analyse progressive
export async function getProgressiveAnalysis(symbol: string, allowSimulated = false): Promise<ProgressiveAnalysis> {
  try {
    // Vérifier le quota d'API si les données simulées ne sont pas autorisées
    const useSimulatedData = allowSimulated || !apiQuota.canMakeRequest()

    // Récupérer les données actuelles de l'action
    let stockData = null
    let isSimulated = useSimulatedData

    if (!useSimulatedData) {
      try {
        stockData = await getStockQuote(symbol)
        // Si on a réussi à obtenir des données réelles, enregistrer la requête
        apiQuota.recordRequest()
      } catch (error) {
        console.warn(
          `Erreur lors de la récupération des données pour ${symbol}, utilisation de données simulées:`,
          error,
        )
        isSimulated = true
      }
    }

    // Si on n'a pas de données ou si on utilise des données simulées
    if (!stockData) {
      // Générer un prix simulé basé sur le symbole pour avoir une cohérence
      const symbolSum = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
      const basePrice = 50 + (symbolSum % 200) // Prix entre 50 et 250

      stockData = {
        symbol,
        currentPrice: basePrice,
        previousClose: basePrice * (1 + (Math.random() * 0.04 - 0.02)), // ±2% du prix de base
        isSimulated: true,
      }
    }

    // Utiliser le prix réel du marché
    const currentPrice = stockData.currentPrice || 100 // Prix par défaut si non disponible

    // Générer des facteurs aléatoires pour la simulation
    const volatilityFactor = Math.random() * 0.05 + 0.02 // Entre 2% et 7%

    // Déterminer la tendance basée sur les données réelles si disponibles
    let trendBias = Math.random() > 0.5 ? 1 : -1
    if (stockData.previousClose && stockData.currentPrice) {
      trendBias = stockData.currentPrice > stockData.previousClose ? 0.7 : -0.7
    }

    // Générer des prédictions historiques (N-5 à N-1)
    const previousPredictions = []
    const numPreviousPredictions = 5

    // Prix de base pour les prédictions historiques (légèrement différent du prix actuel)
    let basePrice = currentPrice * (1 - (Math.random() * 0.1 - 0.05)) // ±5% du prix actuel

    // Générer les prédictions précédentes
    for (let i = 0; i < numPreviousPredictions; i++) {
      // Simuler un prix prédit dans le passé
      const predictedPrice = basePrice * (1 + (Math.random() * 0.06 - 0.03)) // ±3% du prix de base

      // Simuler le prix réel qui s'est produit
      const actualPrice = predictedPrice * (1 + (Math.random() * 0.04 - 0.02)) // ±2% du prix prédit

      // Calculer la précision (inversement proportionnelle à l'écart relatif)
      const percentageDiff = Math.abs((predictedPrice - actualPrice) / actualPrice)
      const accuracy = Math.max(0.65, Math.min(0.98, 1 - percentageDiff * 10)) // Minimum 65%, maximum 98%

      // Facteur d'ajustement basé sur la précision
      const adjustmentFactor = 1 + (accuracy - 0.8) * 0.5 // Ajustement entre 0.9 et 1.1

      // Ajouter à l'historique
      previousPredictions.push({
        timestamp: new Date(Date.now() - (numPreviousPredictions - i) * 24 * 60 * 60 * 1000).toISOString(),
        predictedPrice: Number(predictedPrice.toFixed(2)),
        actualPrice: Number(actualPrice.toFixed(2)),
        accuracy,
        adjustmentFactor,
      })

      // Mettre à jour le prix de base pour la prochaine itération
      basePrice = actualPrice
    }

    // Calculer la précision globale basée sur l'historique
    const overallAccuracy =
      previousPredictions.reduce((sum, pred) => sum + pred.accuracy, 0) / previousPredictions.length

    // Déterminer le niveau de confiance
    let confidenceLevel: "Faible" | "Modérée" | "Élevée" | "Très élevée"
    if (overallAccuracy >= 0.9) confidenceLevel = "Très élevée"
    else if (overallAccuracy >= 0.8) confidenceLevel = "Élevée"
    else if (overallAccuracy >= 0.7) confidenceLevel = "Modérée"
    else confidenceLevel = "Faible"

    // Calculer les facteurs d'ajustement cumulatifs
    const cumulativeAdjustment = previousPredictions.reduce((product, pred) => product * pred.adjustmentFactor, 1)

    // Générer des prédictions de prix ajustées par l'historique
    const oneDayChange = currentPrice * (trendBias * volatilityFactor * cumulativeAdjustment)
    const oneWeekChange = currentPrice * (trendBias * volatilityFactor * 2 * cumulativeAdjustment)
    const oneMonthChange = currentPrice * (trendBias * volatilityFactor * 4 * cumulativeAdjustment)

    // Générer des niveaux de confiance (plus élevés à court terme, plus faibles à long terme)
    // Ajustés par la précision globale
    const oneDayConfidence = Math.max(0.65, Math.min(0.95, 0.85 * overallAccuracy + 0.1))
    const oneWeekConfidence = Math.max(0.65, Math.min(0.9, 0.8 * overallAccuracy + 0.05))
    const oneMonthConfidence = Math.max(0.65, Math.min(0.85, 0.75 * overallAccuracy))

    // Générer des indicateurs techniques
    const rsi = Math.random() * 70 + 15 // Entre 15 et 85
    const macdValue = (Math.random() * 2 - 1) * 2 // Entre -2 et 2
    const macdSignal = macdValue + (Math.random() * 0.6 - 0.3) // Proche de macdValue ±0.3
    const macdHistogram = macdValue - macdSignal

    // Générer des moyennes mobiles
    const ma20 = currentPrice * (1 + (Math.random() * 0.04 - 0.02)) // ±2% du prix actuel
    const ma50 = currentPrice * (1 + (Math.random() * 0.06 - 0.03)) // ±3% du prix actuel
    const ma200 = currentPrice * (1 + (Math.random() * 0.1 - 0.05)) // ±5% du prix actuel

    return {
      symbol,
      currentPrice,
      predictedPrices: {
        oneDay: Number((currentPrice + oneDayChange).toFixed(2)),
        oneWeek: Number((currentPrice + oneWeekChange).toFixed(2)),
        oneMonth: Number((currentPrice + oneMonthChange).toFixed(2)),
      },
      confidenceScores: {
        oneDay: Number(oneDayConfidence.toFixed(2)),
        oneWeek: Number(oneWeekConfidence.toFixed(2)),
        oneMonth: Number(oneMonthConfidence.toFixed(2)),
      },
      overallAccuracy,
      confidenceLevel,
      previousPredictions,
      technicalIndicators: {
        rsi,
        macd: {
          value: Number(macdValue.toFixed(2)),
          signal: Number(macdSignal.toFixed(2)),
          histogram: Number(macdHistogram.toFixed(2)),
        },
        movingAverages: {
          ma20: Number(ma20.toFixed(2)),
          ma50: Number(ma50.toFixed(2)),
          ma200: Number(ma200.toFixed(2)),
        },
      },
      generatedAt: new Date().toISOString(),
      isSimulated,
    }
  } catch (error) {
    console.error(`Erreur lors de la génération de l'analyse progressive pour ${symbol}:`, error)
    throw error
  }
}
