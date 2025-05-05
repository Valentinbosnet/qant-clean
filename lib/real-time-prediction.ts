// Version ultra-minimaliste
export interface RealTimePrediction {
  symbol: string
  name: string
  currentPrice: number
  prediction: string
  timestamp: string
}

export async function generateRealTimePrediction(symbol: string): Promise<RealTimePrediction> {
  return {
    symbol: symbol,
    name: `${symbol} Inc.`,
    currentPrice: 100,
    prediction: "Stable",
    timestamp: new Date().toISOString(),
  }
}
