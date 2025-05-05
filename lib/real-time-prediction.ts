// Interface pour les prédictions en temps réel
export interface RealTimePrediction {
  symbol: string
  currentPrice: number
  predictedPrice: number
  confidence: number
  trend: "up" | "down" | "stable"
  timestamp: Date
}

// Fonction pour obtenir une prédiction en temps réel
export async function getRealTimePrediction(symbol: string): Promise<RealTimePrediction> {
  // Version simplifiée qui retourne des données simulées
  const currentPrice = 100
  const predictedPrice = currentPrice * (1 + (Math.random() * 0.1 - 0.05))
  const trend = predictedPrice > currentPrice ? "up" : predictedPrice < currentPrice ? "down" : "stable"

  return {
    symbol,
    currentPrice,
    predictedPrice,
    confidence: Math.random() * 0.3 + 0.7, // Entre 0.7 et 1.0
    trend,
    timestamp: new Date(),
  }
}

// Fonction pour obtenir plusieurs prédictions en temps réel
export async function getMultiplePredictions(symbols: string[]): Promise<RealTimePrediction[]> {
  // Version simplifiée qui retourne des données simulées pour chaque symbole
  return Promise.all(symbols.map((symbol) => getRealTimePrediction(symbol)))
}

// Fonction pour analyser une tendance
export function analyzeTrend(prediction: RealTimePrediction): string {
  if (prediction.trend === "up" && prediction.confidence > 0.8) {
    return "Forte tendance à la hausse"
  } else if (prediction.trend === "up") {
    return "Tendance à la hausse"
  } else if (prediction.trend === "down" && prediction.confidence > 0.8) {
    return "Forte tendance à la baisse"
  } else if (prediction.trend === "down") {
    return "Tendance à la baisse"
  } else {
    return "Tendance stable"
  }
}
