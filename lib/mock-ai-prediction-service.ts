import type { StockHistoryPoint } from "./stock-service"
import type { PredictionPoint, PredictionResult } from "./prediction-service"

/**
 * Génère une prédiction IA simulée qui ne nécessite pas de clé API OpenAI
 * Cette fonction peut être utilisée comme solution de secours lorsque la clé API n'est pas disponible
 */
export async function generateMockAIPrediction(
  symbol: string,
  stockName: string,
  currentPrice: number,
  historicalData: StockHistoryPoint[],
  days = 30,
): Promise<PredictionResult> {
  console.log("Generating mock AI prediction for", symbol)

  // Analyser les données historiques pour déterminer la tendance
  const recentHistory = historicalData.slice(-30)
  const oldestPrice = recentHistory[0].price
  const newestPrice = recentHistory[recentHistory.length - 1].price

  // Calculer la tendance générale
  const overallTrend = newestPrice > oldestPrice ? "up" : newestPrice < oldestPrice ? "down" : "neutral"

  // Calculer la volatilité (écart-type des variations quotidiennes en pourcentage)
  const dailyChanges = []
  for (let i = 1; i < recentHistory.length; i++) {
    const dailyChange = recentHistory[i].price / recentHistory[i - 1].price - 1
    dailyChanges.push(dailyChange)
  }

  const avgChange = dailyChanges.reduce((sum, change) => sum + change, 0) / dailyChanges.length
  const volatility = Math.sqrt(
    dailyChanges.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / dailyChanges.length,
  )

  // Générer des prédictions basées sur la tendance et la volatilité
  const predictionPoints: PredictionPoint[] = []

  // Ajouter d'abord les points historiques
  for (let i = 0; i < historicalData.length; i++) {
    predictionPoints.push({
      date: historicalData[i].date,
      price: historicalData[i].price,
      isEstimate: false,
    })
  }

  // Générer les prédictions futures
  let lastPrice = currentPrice
  const today = new Date()

  for (let i = 1; i <= days; i++) {
    const futureDate = new Date(today)
    futureDate.setDate(today.getDate() + i)

    // Générer une variation quotidienne basée sur la tendance et la volatilité
    let dailyChangePercent

    if (overallTrend === "up") {
      // Tendance haussière: variation moyenne positive + bruit aléatoire
      dailyChangePercent = (avgChange > 0 ? avgChange : 0.001) + (Math.random() * 2 - 1) * volatility
    } else if (overallTrend === "down") {
      // Tendance baissière: variation moyenne négative + bruit aléatoire
      dailyChangePercent = (avgChange < 0 ? avgChange : -0.001) + (Math.random() * 2 - 1) * volatility
    } else {
      // Tendance neutre: bruit aléatoire autour de zéro
      dailyChangePercent = (Math.random() * 2 - 1) * volatility
    }

    // Appliquer la variation au prix
    lastPrice = lastPrice * (1 + dailyChangePercent)

    // Ajouter le point de prédiction
    predictionPoints.push({
      date: futureDate.toISOString().split("T")[0],
      price: lastPrice,
      isEstimate: true,
    })
  }

  // Calculer les objectifs de prix
  const shortTermTarget = predictionPoints[predictionPoints.length - Math.floor(days * 0.25)].price
  const longTermTarget = predictionPoints[predictionPoints.length - 1].price

  // Générer un raisonnement IA simulé
  const aiReasoning = generateMockReasoning(
    symbol,
    stockName,
    overallTrend,
    volatility,
    avgChange,
    shortTermTarget,
    longTermTarget,
    currentPrice,
  )

  // Construire le résultat
  return {
    symbol,
    algorithm: "ai",
    points: predictionPoints,
    metrics: {
      confidence: 0.7 + Math.random() * 0.2, // Confiance entre 0.7 et 0.9
      accuracy: 0.65 + Math.random() * 0.2, // Précision entre 0.65 et 0.85
    },
    trend: overallTrend,
    shortTermTarget,
    longTermTarget,
    aiReasoning,
  }
}

/**
 * Génère un raisonnement IA simulé basé sur les données de l'action
 */
function generateMockReasoning(
  symbol: string,
  stockName: string,
  trend: string,
  volatility: number,
  avgChange: number,
  shortTermTarget: number,
  longTermTarget: number,
  currentPrice: number,
): string {
  const volatilityDesc = volatility > 0.02 ? "élevée" : volatility > 0.01 ? "modérée" : "faible"
  const shortTermChangePercent = (shortTermTarget / currentPrice - 1) * 100
  const longTermChangePercent = (longTermTarget / currentPrice - 1) * 100

  let reasoning = `Analyse de ${symbol} (${stockName}): `

  if (trend === "up") {
    reasoning += `L'action montre une tendance haussière avec une volatilité ${volatilityDesc}. `
    reasoning += `Les données historiques indiquent une croissance moyenne quotidienne de ${(avgChange * 100).toFixed(2)}%. `
    reasoning += `À court terme, nous prévoyons une augmentation de ${shortTermChangePercent.toFixed(2)}% pour atteindre un objectif de prix de ${shortTermTarget.toFixed(2)}. `
    reasoning += `Sur ${longTermChangePercent > 0 ? "une trajectoire positive" : "un ralentissement potentiel"}, l'objectif à long terme est de ${longTermTarget.toFixed(2)}, soit ${Math.abs(longTermChangePercent).toFixed(2)}% ${longTermChangePercent > 0 ? "au-dessus" : "en-dessous"} du prix actuel. `
  } else if (trend === "down") {
    reasoning += `L'action montre une tendance baissière avec une volatilité ${volatilityDesc}. `
    reasoning += `Les données historiques indiquent une baisse moyenne quotidienne de ${Math.abs(avgChange * 100).toFixed(2)}%. `
    reasoning += `À court terme, nous prévoyons une baisse de ${Math.abs(shortTermChangePercent).toFixed(2)}% pour atteindre un objectif de prix de ${shortTermTarget.toFixed(2)}. `
    reasoning += `Sur ${longTermChangePercent < 0 ? "une trajectoire négative continue" : "un possible rebond"}, l'objectif à long terme est de ${longTermTarget.toFixed(2)}, soit ${Math.abs(longTermChangePercent).toFixed(2)}% ${longTermChangePercent > 0 ? "au-dessus" : "en-dessous"} du prix actuel. `
  } else {
    reasoning += `L'action montre une tendance neutre avec une volatilité ${volatilityDesc}. `
    reasoning += `Les données historiques indiquent une variation moyenne quotidienne proche de zéro (${(avgChange * 100).toFixed(2)}%). `
    reasoning += `À court terme, nous prévoyons une légère ${shortTermChangePercent > 0 ? "hausse" : "baisse"} de ${Math.abs(shortTermChangePercent).toFixed(2)}% pour atteindre un objectif de prix de ${shortTermTarget.toFixed(2)}. `
    reasoning += `L'objectif à long terme reste proche du prix actuel à ${longTermTarget.toFixed(2)}, soit ${Math.abs(longTermChangePercent).toFixed(2)}% ${longTermChangePercent > 0 ? "au-dessus" : "en-dessous"} du prix actuel. `
  }

  reasoning += `Cette prédiction est basée sur l'analyse des tendances historiques, de la volatilité et des modèles de prix récents. `
  reasoning += `Notez que ces prévisions sont sujettes à des changements en fonction des événements du marché et des nouvelles spécifiques à l'entreprise.`

  return reasoning
}
