// Version ultra simplifiée pour éviter les problèmes de build

export interface PredictionData {
  symbol: string
  name: string
  currentPrice: number
  prediction: string
  timestamp: string
}

export async function generateRealTimePrediction(symbol: string): Promise<PredictionData> {
  // Version simplifiée pour simuler des prédictions
  const currentPrice = Math.round((50 + Math.random() * 450) * 100) / 100

  return {
    symbol,
    name: `${symbol} Inc.`,
    currentPrice,
    prediction: Math.random() > 0.5 ? "Hausse attendue" : "Baisse probable",
    timestamp: new Date().toISOString(),
  }
}
