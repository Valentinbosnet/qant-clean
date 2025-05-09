import type { StockData } from "./stock-service"
import type { PredictionResult, PredictionPoint, PredictionAlgorithm } from "./prediction-service"
import { calculateIndicators, analyzeIndicators } from "./technical-indicators"
import { getMacroeconomicData, evaluateMarcoImpact } from "./macroeconomic-service"
import { getSentimentAnalysis, evaluateSentimentImpact } from "./sentiment-service"

// Types pour les prédictions améliorées
export interface EnhancedPredictionResult extends PredictionResult {
  confidenceInterval?: {
    upper: PredictionPoint[]
    lower: PredictionPoint[]
  }
  technicalAnalysis?: {
    trend: "up" | "down" | "neutral"
    strength: number
    signals: {
      name: string
      signal: "buy" | "sell" | "neutral"
      strength: number
    }[]
  }
  macroeconomicAnalysis?: {
    impact: "positive" | "negative" | "neutral"
    strength: number
    details: string
  }
  sentimentAnalysis?: {
    impact: "positive" | "negative" | "neutral"
    strength: number
    details: string
  }
}

// Configuration pour les prédictions
export interface EnhancedPredictionConfig {
  algorithm: PredictionAlgorithm
  days: number
  historyDays?: number
  confidenceLevel?: number // 0.0 à 1.0, par défaut 0.95
  includeTechnicalAnalysis?: boolean
  includeMacroeconomicAnalysis?: boolean
  includeSentimentAnalysis?: boolean
}

// Valeurs par défaut
const DEFAULT_CONFIG: EnhancedPredictionConfig = {
  algorithm: "ensemble",
  days: 30,
  historyDays: 180,
  confidenceLevel: 0.95,
  includeTechnicalAnalysis: true,
  includeMacroeconomicAnalysis: true,
  includeSentimentAnalysis: true,
}

/**
 * Génère des prédictions améliorées pour une action donnée
 */
export async function generateEnhancedPrediction(
  stockData: StockData,
  basePrediction: PredictionResult,
  config: Partial<EnhancedPredictionConfig> = {},
): Promise<EnhancedPredictionResult> {
  // Fusionner la configuration par défaut avec celle fournie
  const fullConfig: EnhancedPredictionConfig = { ...DEFAULT_CONFIG, ...config }

  // Enrichir la prédiction de base
  const enhancedPrediction: EnhancedPredictionResult = {
    ...basePrediction,
  }

  // Calculer les intervalles de confiance
  if (fullConfig.confidenceLevel) {
    enhancedPrediction.confidenceInterval = calculateConfidenceIntervals(
      basePrediction.points,
      fullConfig.confidenceLevel,
      basePrediction.metrics.volatility || 0.02,
    )
  }

  // Intégrer l'analyse technique si demandé
  if (fullConfig.includeTechnicalAnalysis) {
    // Calculer les indicateurs techniques
    const indicators = calculateIndicators(stockData.history)

    // Analyser les indicateurs
    enhancedPrediction.technicalAnalysis = analyzeIndicators(indicators)

    // Ajuster la tendance si l'analyse technique est très forte dans une direction
    if (
      enhancedPrediction.technicalAnalysis.strength > 0.7 &&
      enhancedPrediction.technicalAnalysis.trend !== basePrediction.trend
    ) {
      // Ajuster légèrement la tendance si l'analyse technique est très confiante
      adjustPredictionBasedOnTechnicalAnalysis(
        enhancedPrediction,
        enhancedPrediction.technicalAnalysis.trend,
        enhancedPrediction.technicalAnalysis.strength,
      )
    }
  }

  // Intégrer l'analyse macroéconomique si demandé
  if (fullConfig.includeMacroeconomicAnalysis) {
    try {
      // Récupérer les données macroéconomiques
      const macroData = await getMacroeconomicData("US")

      // Évaluer l'impact sur le titre
      const macroImpact = evaluateMarcoImpact(stockData.symbol, macroData)

      // Ajouter l'analyse à la prédiction
      enhancedPrediction.macroeconomicAnalysis = macroImpact

      // Ajuster la prédiction en fonction de l'impact macroéconomique
      if (macroImpact.strength > 0.3) {
        adjustPredictionBasedOnExternalFactor(
          enhancedPrediction,
          macroImpact.impact,
          macroImpact.strength * 0.7, // Réduire légèrement l'influence
        )
      }
    } catch (error) {
      console.error("Erreur lors de l'analyse macroéconomique:", error)
      // Continue sans analyse macroéconomique en cas d'erreur
    }
  }

  // Intégrer l'analyse de sentiment si demandé
  if (fullConfig.includeSentimentAnalysis) {
    try {
      // Récupérer l'analyse de sentiment
      const sentimentData = await getSentimentAnalysis(stockData.symbol)

      // Évaluer l'impact sur le titre
      const sentimentImpact = evaluateSentimentImpact(sentimentData)

      // Ajouter l'analyse à la prédiction
      enhancedPrediction.sentimentAnalysis = sentimentImpact

      // Ajuster la prédiction en fonction de l'impact du sentiment
      if (sentimentImpact.strength > 0.3) {
        adjustPredictionBasedOnExternalFactor(
          enhancedPrediction,
          sentimentImpact.impact,
          sentimentImpact.strength * 0.8, // Sentiment a une influence importante
        )
      }
    } catch (error) {
      console.error("Erreur lors de l'analyse de sentiment:", error)
      // Continue sans analyse de sentiment en cas d'erreur
    }
  }

  return enhancedPrediction
}

/**
 * Calcule les intervalles de confiance pour une prédiction
 */
function calculateConfidenceIntervals(
  points: PredictionPoint[],
  confidenceLevel: number,
  volatility: number,
): {
  upper: PredictionPoint[]
  lower: PredictionPoint[]
} {
  const upper: PredictionPoint[] = []
  const lower: PredictionPoint[] = []

  // Trouver l'index où les prédictions commencent
  const firstEstimateIndex = points.findIndex((p) => p.isEstimate)
  if (firstEstimateIndex === -1) {
    return { upper, lower }
  }

  // Convertir le niveau de confiance en multiplicateur d'écart-type
  // Approximation: 1.65 pour 90%, 1.96 pour 95%, 2.58 pour 99%
  let multiplier = 1.96 // Défaut pour 95%
  if (confidenceLevel <= 0.9) {
    multiplier = 1.65
  } else if (confidenceLevel >= 0.99) {
    multiplier = 2.58
  }

  // Ajouter d'abord les points historiques
  for (let i = 0; i < firstEstimateIndex; i++) {
    upper.push({
      date: points[i].date,
      price: points[i].price,
      isEstimate: false,
    })
    lower.push({
      date: points[i].date,
      price: points[i].price,
      isEstimate: false,
    })
  }

  // Calculer les intervalles pour les points de prédiction
  for (let i = firstEstimateIndex; i < points.length; i++) {
    // L'incertitude augmente avec la distance dans le futur
    const daysFactor = Math.sqrt(i - firstEstimateIndex + 1)

    // Calculer l'écart-type à partir de la volatilité et du prix
    const stdDev = points[i].price * volatility * daysFactor

    // Calculer les limites supérieure et inférieure
    const upperBound = points[i].price + multiplier * stdDev
    const lowerBound = points[i].price - multiplier * stdDev

    upper.push({
      date: points[i].date,
      price: upperBound,
      isEstimate: true,
    })

    lower.push({
      date: points[i].date,
      price: lowerBound,
      isEstimate: true,
    })
  }

  return { upper, lower }
}

/**
 * Ajuste une prédiction en fonction de l'analyse technique
 */
function adjustPredictionBasedOnTechnicalAnalysis(
  prediction: EnhancedPredictionResult,
  technicalTrend: "up" | "down" | "neutral",
  strength: number,
): void {
  if (technicalTrend === "neutral" || !prediction.points) {
    return
  }

  // Trouver l'index où les prédictions commencent
  const firstEstimateIndex = prediction.points.findIndex((p) => p.isEstimate)
  if (firstEstimateIndex === -1) {
    return
  }

  // Calculer le facteur d'ajustement basé sur la force du signal technique
  const adjustmentFactor = 1 + (strength - 0.5) * 0.1 // Max 5% d'ajustement

  // Ajuster les points de prédiction
  for (let i = firstEstimateIndex; i < prediction.points.length; i++) {
    // L'effet augmente avec la distance dans le futur
    const distanceFactor = 1 + ((i - firstEstimateIndex) / (prediction.points.length - firstEstimateIndex)) * 0.5
    const dayAdjustment = adjustmentFactor * distanceFactor

    if (technicalTrend === "up") {
      prediction.points[i].price *= dayAdjustment

      // Ajuster aussi les intervalles de confiance si présents
      if (prediction.confidenceInterval) {
        prediction.confidenceInterval.upper[i].price *= dayAdjustment
        prediction.confidenceInterval.lower[i].price *= dayAdjustment
      }
    } else if (technicalTrend === "down") {
      prediction.points[i].price /= dayAdjustment

      // Ajuster aussi les intervalles de confiance si présents
      if (prediction.confidenceInterval) {
        prediction.confidenceInterval.upper[i].price /= dayAdjustment
        prediction.confidenceInterval.lower[i].price /= dayAdjustment
      }
    }
  }

  // Recalculer la tendance et les objectifs
  updatePredictionTrendAndTargets(prediction, firstEstimateIndex)
}

/**
 * Ajuste une prédiction en fonction d'un facteur externe (macroéconomique ou sentiment)
 */
function adjustPredictionBasedOnExternalFactor(
  prediction: EnhancedPredictionResult,
  impact: "positive" | "negative" | "neutral",
  strength: number,
): void {
  if (impact === "neutral" || !prediction.points || strength < 0.1) {
    return
  }

  // Trouver l'index où les prédictions commencent
  const firstEstimateIndex = prediction.points.findIndex((p) => p.isEstimate)
  if (firstEstimateIndex === -1) {
    return
  }

  // Calculer le facteur d'ajustement
  const baseFactor = 1 + strength * 0.15 // Max ~7.5% d'ajustement pour un facteur de 0.5

  // Ajuster les points de prédiction
  for (let i = firstEstimateIndex; i < prediction.points.length; i++) {
    // L'effet augmente progressivement avec la distance dans le futur
    const distanceFactor = 1 + (i - firstEstimateIndex) / (prediction.points.length - firstEstimateIndex)
    const adjustmentFactor = 1 + (baseFactor - 1) * distanceFactor

    if (impact === "positive") {
      prediction.points[i].price *= adjustmentFactor

      // Ajuster aussi les intervalles de confiance si présents
      if (prediction.confidenceInterval) {
        prediction.confidenceInterval.upper[i].price *= adjustmentFactor
        prediction.confidenceInterval.lower[i].price *= adjustmentFactor
      }
    } else if (impact === "negative") {
      prediction.points[i].price /= adjustmentFactor

      // Ajuster aussi les intervalles de confiance si présents
      if (prediction.confidenceInterval) {
        prediction.confidenceInterval.upper[i].price /= adjustmentFactor
        prediction.confidenceInterval.lower[i].price /= adjustmentFactor
      }
    }
  }

  // Recalculer la tendance et les objectifs
  updatePredictionTrendAndTargets(prediction, firstEstimateIndex)
}

/**
 * Met à jour la tendance et les objectifs d'une prédiction
 */
function updatePredictionTrendAndTargets(prediction: EnhancedPredictionResult, firstEstimateIndex: number): void {
  if (!prediction.points || firstEstimateIndex >= prediction.points.length - 1) {
    return
  }

  const firstEstimate = prediction.points[firstEstimateIndex]
  const lastEstimate = prediction.points[prediction.points.length - 1]
  const percentChange = (lastEstimate.price / firstEstimate.price - 1) * 100

  // Mettre à jour la tendance
  if (percentChange > 3) {
    prediction.trend = "up"
  } else if (percentChange < -3) {
    prediction.trend = "down"
  } else {
    prediction.trend = "neutral"
  }

  // Mettre à jour les objectifs de prix
  if (prediction.points.length > firstEstimateIndex + 7) {
    prediction.shortTermTarget = prediction.points[firstEstimateIndex + 6].price
  }
  prediction.longTermTarget = lastEstimate.price
}
