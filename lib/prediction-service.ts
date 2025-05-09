import type { StockHistoryPoint, StockData } from "./stock-service"
import { generateAIPrediction } from "./ai-prediction-service"

// Types pour les prédictions
export interface PredictionPoint {
  date: string
  price: number
  isEstimate: boolean
}

export interface PredictionResult {
  symbol: string
  algorithm: string
  points: PredictionPoint[]
  metrics: {
    accuracy?: number
    confidence?: number
    rmse?: number // Root Mean Square Error
  }
  trend: "up" | "down" | "neutral"
  shortTermTarget?: number
  longTermTarget?: number
  aiReasoning?: string // Nouveau champ pour le raisonnement de l'IA
}

// Algorithmes de prédiction disponibles
export type PredictionAlgorithm = "sma" | "ema" | "linear" | "polynomial" | "ensemble" | "ai"

// Configuration pour les prédictions
export interface PredictionConfig {
  algorithm: PredictionAlgorithm
  days: number // Nombre de jours à prédire
  historyDays?: number // Nombre de jours d'historique à utiliser
  smoothing?: number // Facteur de lissage pour certains algorithmes
  degree?: number // Degré pour les régressions polynomiales
}

// Valeurs par défaut
const DEFAULT_CONFIG: PredictionConfig = {
  algorithm: "ensemble",
  days: 30,
  historyDays: 180,
  smoothing: 0.2,
  degree: 2,
}

/**
 * Génère des prédictions pour une action donnée
 */
export async function generatePrediction(
  symbol: string,
  historicalData: StockHistoryPoint[],
  config: Partial<PredictionConfig> = {},
  stockData?: StockData, // Ajout des données complètes de l'action pour l'IA
): Promise<PredictionResult> {
  // Fusionner la configuration par défaut avec celle fournie
  const fullConfig: PredictionConfig = { ...DEFAULT_CONFIG, ...config }

  // S'assurer que nous avons suffisamment de données historiques
  if (historicalData.length < 30) {
    throw new Error("Insufficient historical data for prediction")
  }

  // Limiter les données historiques à la période spécifiée
  const limitedHistory = historicalData.slice(0, fullConfig.historyDays)

  // Si l'algorithme est "ai", utiliser le service d'IA
  if (fullConfig.algorithm === "ai") {
    if (!stockData) {
      throw new Error("Stock data is required for AI predictions")
    }
    return generateAIPrediction(symbol, stockData.name, stockData.price, historicalData, fullConfig.days)
  }

  // Sélectionner l'algorithme approprié
  let predictionPoints: PredictionPoint[]
  let metrics = {}
  let trend: "up" | "down" | "neutral" = "neutral"
  let shortTermTarget: number | undefined
  let longTermTarget: number | undefined

  switch (fullConfig.algorithm) {
    case "sma":
      predictionPoints = simpleMovingAverage(limitedHistory, fullConfig.days)
      break
    case "ema":
      predictionPoints = exponentialMovingAverage(limitedHistory, fullConfig.days, fullConfig.smoothing || 0.2)
      break
    case "linear":
      predictionPoints = linearRegression(limitedHistory, fullConfig.days)
      break
    case "polynomial":
      predictionPoints = polynomialRegression(limitedHistory, fullConfig.days, fullConfig.degree || 2)
      break
    case "ensemble":
    default:
      predictionPoints = ensembleMethod(limitedHistory, fullConfig.days)
      break
  }

  // Calculer les métriques et la tendance
  metrics = calculateMetrics(limitedHistory, predictionPoints)
  trend = determineTrend(predictionPoints)

  // Calculer les objectifs de prix
  const lastActualPrice = limitedHistory[0].price
  shortTermTarget = calculatePriceTarget(predictionPoints, 7, lastActualPrice)
  longTermTarget = calculatePriceTarget(predictionPoints, fullConfig.days, lastActualPrice)

  return {
    symbol,
    algorithm: fullConfig.algorithm,
    points: predictionPoints,
    metrics,
    trend,
    shortTermTarget,
    longTermTarget,
  }
}

/**
 * Algorithme de moyenne mobile simple (SMA)
 */
function simpleMovingAverage(history: StockHistoryPoint[], daysToPredict: number): PredictionPoint[] {
  // Inverser l'historique pour avoir les dates les plus anciennes en premier
  const reversedHistory = [...history].reverse()

  // Calculer la SMA sur les 30 derniers jours
  const period = 30
  const sma = []

  for (let i = 0; i < reversedHistory.length - period + 1; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) {
      sum += reversedHistory[i + j].price
    }
    sma.push({
      date: reversedHistory[i + period - 1].date,
      price: sum / period,
      isEstimate: false,
    })
  }

  // Utiliser la tendance récente pour prédire les prix futurs
  const predictions: PredictionPoint[] = []

  // Ajouter d'abord les points historiques
  for (let i = 0; i < history.length; i++) {
    predictions.push({
      date: history[i].date,
      price: history[i].price,
      isEstimate: false,
    })
  }

  // Calculer la tendance moyenne des 7 derniers jours
  const recentTrend = calculateRecentTrend(history, 7)

  // Générer les prédictions futures
  const lastDate = new Date(history[0].date)
  const lastPrice = history[0].price

  for (let i = 1; i <= daysToPredict; i++) {
    const nextDate = new Date(lastDate)
    nextDate.setDate(lastDate.getDate() + i)

    // Appliquer la tendance avec un peu de bruit aléatoire
    const noise = (Math.random() - 0.5) * 0.01 * lastPrice
    const nextPrice = lastPrice * (1 + recentTrend * i) + noise

    predictions.push({
      date: nextDate.toISOString().split("T")[0],
      price: nextPrice,
      isEstimate: true,
    })
  }

  return predictions
}

/**
 * Algorithme de moyenne mobile exponentielle (EMA)
 */
function exponentialMovingAverage(
  history: StockHistoryPoint[],
  daysToPredict: number,
  smoothingFactor: number,
): PredictionPoint[] {
  // Inverser l'historique pour avoir les dates les plus anciennes en premier
  const reversedHistory = [...history].reverse()

  // Calculer l'EMA
  const ema = []
  let currentEma = reversedHistory[0].price

  ema.push({
    date: reversedHistory[0].date,
    price: currentEma,
    isEstimate: false,
  })

  for (let i = 1; i < reversedHistory.length; i++) {
    currentEma = reversedHistory[i].price * smoothingFactor + currentEma * (1 - smoothingFactor)
    ema.push({
      date: reversedHistory[i].date,
      price: currentEma,
      isEstimate: false,
    })
  }

  // Préparer les prédictions
  const predictions: PredictionPoint[] = []

  // Ajouter d'abord les points historiques
  for (let i = 0; i < history.length; i++) {
    predictions.push({
      date: history[i].date,
      price: history[i].price,
      isEstimate: false,
    })
  }

  // Calculer la tendance basée sur l'EMA
  const emaTrend = calculateEmaTrend(ema.reverse(), 14)

  // Générer les prédictions futures
  const lastDate = new Date(history[0].date)
  const lastPrice = history[0].price

  for (let i = 1; i <= daysToPredict; i++) {
    const nextDate = new Date(lastDate)
    nextDate.setDate(lastDate.getDate() + i)

    // Appliquer la tendance EMA avec un peu de bruit aléatoire
    const noise = (Math.random() - 0.5) * 0.015 * lastPrice
    const nextPrice = lastPrice * (1 + emaTrend * i) + noise

    predictions.push({
      date: nextDate.toISOString().split("T")[0],
      price: nextPrice,
      isEstimate: true,
    })
  }

  return predictions
}

/**
 * Algorithme de régression linéaire
 */
function linearRegression(history: StockHistoryPoint[], daysToPredict: number): PredictionPoint[] {
  // Préparer les données pour la régression
  const x: number[] = []
  const y: number[] = []

  // Utiliser les 90 derniers jours pour la régression
  const dataPoints = history.slice(0, 90).reverse()

  for (let i = 0; i < dataPoints.length; i++) {
    x.push(i)
    y.push(dataPoints[i].price)
  }

  // Calculer les coefficients de régression linéaire (y = mx + b)
  const n = x.length
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0

  for (let i = 0; i < n; i++) {
    sumX += x[i]
    sumY += y[i]
    sumXY += x[i] * y[i]
    sumXX += x[i] * x[i]
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Fonction pour prédire le prix
  const predict = (day: number) => slope * day + intercept

  // Préparer les prédictions
  const predictions: PredictionPoint[] = []

  // Ajouter d'abord les points historiques
  for (let i = 0; i < history.length; i++) {
    predictions.push({
      date: history[i].date,
      price: history[i].price,
      isEstimate: false,
    })
  }

  // Générer les prédictions futures
  const lastDate = new Date(history[0].date)
  const lastDay = dataPoints.length - 1

  for (let i = 1; i <= daysToPredict; i++) {
    const nextDate = new Date(lastDate)
    nextDate.setDate(lastDate.getDate() + i)

    // Prédire le prix avec un peu de bruit aléatoire
    const predictedDay = lastDay + i
    const basePrice = predict(predictedDay)
    const noise = (Math.random() - 0.5) * 0.02 * basePrice

    predictions.push({
      date: nextDate.toISOString().split("T")[0],
      price: basePrice + noise,
      isEstimate: true,
    })
  }

  return predictions
}

/**
 * Algorithme de régression polynomiale
 */
function polynomialRegression(history: StockHistoryPoint[], daysToPredict: number, degree: number): PredictionPoint[] {
  // Pour simplifier, nous allons implémenter une approximation de régression polynomiale
  // en utilisant une combinaison de tendances à court et long terme

  // Préparer les prédictions
  const predictions: PredictionPoint[] = []

  // Ajouter d'abord les points historiques
  for (let i = 0; i < history.length; i++) {
    predictions.push({
      date: history[i].date,
      price: history[i].price,
      isEstimate: false,
    })
  }

  // Calculer différentes tendances
  const shortTermTrend = calculateRecentTrend(history, 14)
  const mediumTermTrend = calculateRecentTrend(history, 30)
  const longTermTrend = calculateRecentTrend(history, 90)

  // Générer les prédictions futures
  const lastDate = new Date(history[0].date)
  const lastPrice = history[0].price

  for (let i = 1; i <= daysToPredict; i++) {
    const nextDate = new Date(lastDate)
    nextDate.setDate(lastDate.getDate() + i)

    // Pondérer les tendances différemment selon la distance dans le futur
    const shortWeight = Math.max(0, 1 - i / 10)
    const mediumWeight = Math.max(0, 1 - Math.abs(i - 15) / 15)
    const longWeight = Math.min(1, i / 20)

    const totalWeight = shortWeight + mediumWeight + longWeight
    const weightedTrend =
      (shortTermTrend * shortWeight + mediumTermTrend * mediumWeight + longTermTrend * longWeight) / totalWeight

    // Ajouter un facteur polynomial basé sur le degré
    const polyFactor = 1 + (i / daysToPredict) * (degree - 1) * 0.1

    // Appliquer la tendance avec un peu de bruit aléatoire
    const noise = (Math.random() - 0.5) * 0.02 * lastPrice
    const nextPrice = lastPrice * (1 + weightedTrend * i * polyFactor) + noise

    predictions.push({
      date: nextDate.toISOString().split("T")[0],
      price: nextPrice,
      isEstimate: true,
    })
  }

  return predictions
}

/**
 * Méthode d'ensemble combinant plusieurs algorithmes
 */
function ensembleMethod(history: StockHistoryPoint[], daysToPredict: number): PredictionPoint[] {
  // Obtenir les prédictions de chaque algorithme
  const smaPredictions = simpleMovingAverage(history, daysToPredict)
  const emaPredictions = exponentialMovingAverage(history, daysToPredict, 0.2)
  const linearPredictions = linearRegression(history, daysToPredict)
  const polyPredictions = polynomialRegression(history, daysToPredict, 2)

  // Préparer les prédictions d'ensemble
  const predictions: PredictionPoint[] = []

  // Ajouter d'abord les points historiques
  for (let i = 0; i < history.length; i++) {
    predictions.push({
      date: history[i].date,
      price: history[i].price,
      isEstimate: false,
    })
  }

  // Combiner les prédictions futures avec des poids
  const historyLength = history.length

  for (let i = 0; i < daysToPredict; i++) {
    const index = historyLength + i

    // Ajuster les poids en fonction de la distance dans le futur
    const smaWeight = Math.max(0.1, 0.4 - (i / daysToPredict) * 0.3)
    const emaWeight = Math.max(0.1, 0.3 - (i / daysToPredict) * 0.2)
    const linearWeight = 0.2 + (i / daysToPredict) * 0.1
    const polyWeight = 0.1 + (i / daysToPredict) * 0.4

    const totalWeight = smaWeight + emaWeight + linearWeight + polyWeight

    // Calculer le prix pondéré
    const weightedPrice =
      (smaPredictions[index].price * smaWeight +
        emaPredictions[index].price * emaWeight +
        linearPredictions[index].price * linearWeight +
        polyPredictions[index].price * polyWeight) /
      totalWeight

    predictions.push({
      date: smaPredictions[index].date,
      price: weightedPrice,
      isEstimate: true,
    })
  }

  return predictions
}

/**
 * Calcule la tendance récente basée sur l'historique
 */
function calculateRecentTrend(history: StockHistoryPoint[], days: number): number {
  const recentHistory = history.slice(0, Math.min(days, history.length))

  if (recentHistory.length < 2) {
    return 0
  }

  const oldestPrice = recentHistory[recentHistory.length - 1].price
  const newestPrice = recentHistory[0].price
  const daysDiff = recentHistory.length - 1

  // Calculer la tendance quotidienne moyenne
  return (newestPrice / oldestPrice - 1) / daysDiff
}

/**
 * Calcule la tendance basée sur l'EMA
 */
function calculateEmaTrend(ema: PredictionPoint[], days: number): number {
  const recentEma = ema.slice(0, Math.min(days, ema.length))

  if (recentEma.length < 2) {
    return 0
  }

  const oldestEma = recentEma[recentEma.length - 1].price
  const newestEma = recentEma[0].price
  const daysDiff = recentEma.length - 1

  // Calculer la tendance quotidienne moyenne
  return (newestEma / oldestEma - 1) / daysDiff
}

/**
 * Calcule les métriques pour évaluer la qualité des prédictions
 */
function calculateMetrics(history: StockHistoryPoint[], predictions: PredictionPoint[]): any {
  // Pour l'instant, nous allons simplement estimer la confiance
  // basée sur la volatilité récente

  // Calculer la volatilité (écart-type des rendements quotidiens)
  const returns: number[] = []

  for (let i = 1; i < Math.min(30, history.length); i++) {
    const dailyReturn = history[i - 1].price / history[i].price - 1
    returns.push(dailyReturn)
  }

  // Calculer l'écart-type
  const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length
  const variance = returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / returns.length
  const volatility = Math.sqrt(variance)

  // Estimer la confiance (inversement proportionnelle à la volatilité)
  const confidence = Math.max(0, Math.min(1, 1 - volatility * 10))

  // Estimer la précision (simplifiée)
  const accuracy = Math.max(0, Math.min(1, 0.8 - volatility * 5))

  return {
    confidence,
    accuracy,
    volatility,
  }
}

/**
 * Détermine la tendance globale des prédictions
 */
function determineTrend(predictions: PredictionPoint[]): "up" | "down" | "neutral" {
  // Trouver le premier point de prédiction
  const firstEstimateIndex = predictions.findIndex((p) => p.isEstimate)

  if (firstEstimateIndex === -1 || firstEstimateIndex === predictions.length - 1) {
    return "neutral"
  }

  const firstEstimate = predictions[firstEstimateIndex]
  const lastEstimate = predictions[predictions.length - 1]

  // Calculer le changement en pourcentage
  const percentChange = (lastEstimate.price / firstEstimate.price - 1) * 100

  if (percentChange > 3) {
    return "up"
  } else if (percentChange < -3) {
    return "down"
  } else {
    return "neutral"
  }
}

/**
 * Calcule un objectif de prix à un horizon donné
 */
function calculatePriceTarget(
  predictions: PredictionPoint[],
  horizon: number,
  lastActualPrice: number,
): number | undefined {
  // Trouver le premier point de prédiction
  const firstEstimateIndex = predictions.findIndex((p) => p.isEstimate)

  if (firstEstimateIndex === -1) {
    return undefined
  }

  // Trouver le point correspondant à l'horizon
  const targetIndex = firstEstimateIndex + horizon - 1

  if (targetIndex >= predictions.length) {
    return undefined
  }

  return predictions[targetIndex].price
}
