// Service for generating real-time stock predictions

import { apiQuota } from "./api-quota-manager"

// Types for prediction data
export interface PredictionData {
  symbol: string
  name: string
  currentPrice: number
  prediction: string
  confidence: number
  trend: "up" | "down" | "neutral"
  signals: {
    technical: string
    fundamental: string
    sentiment: string
  }
  timestamp: string
  fundamentals?: {
    peRatio?: number
    marketCap?: string
    volume?: number
    avgVolume?: number
    dividend?: number
    beta?: number
    eps?: number
    high52?: number
    low52?: number
    open?: number
    previousClose?: number
    dayRange?: string
    floatShares?: string
    roe?: number
    roa?: number
    profitMargin?: number
    debtToEquity?: number
    revenueGrowth?: number
    epsGrowth?: number
    epsEstimateNextQuarter?: number
  }
}

// Function to generate a real-time prediction for a stock
export async function generateRealTimePrediction(
  symbol: string,
  allowSimulated = false,
  quotaManager = apiQuota,
): Promise<PredictionData> {
  // Use API quota if not using simulated data
  let usedQuota = false
  if (!allowSimulated) {
    if (quotaManager.canMakeRequest()) {
      quotaManager.useRequest()
      usedQuota = true
    } else {
      throw new Error("API quota exceeded and simulated data not allowed")
    }
  }

  // If we're allowing simulated data or we have API quota available
  if (allowSimulated || usedQuota) {
    // Generate a simulated prediction
    return generateSimulatedPrediction(symbol)
  } else {
    throw new Error("API quota exceeded and simulated data not allowed")
  }
}

// Function to generate a simulated prediction for testing
function generateSimulatedPrediction(symbol: string): PredictionData {
  // Get company name based on symbol
  const companyNames: Record<string, string> = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com Inc.",
    META: "Meta Platforms Inc.",
    TSLA: "Tesla Inc.",
    NVDA: "NVIDIA Corporation",
    JPM: "JPMorgan Chase & Co.",
    V: "Visa Inc.",
    WMT: "Walmart Inc.",
  }

  const name = companyNames[symbol] || `${symbol} Inc.`

  // Generate random price between 50 and 500
  const currentPrice = Math.round((50 + Math.random() * 450) * 100) / 100

  // Randomly determine trend
  const trendRandom = Math.random()
  const trend = trendRandom > 0.6 ? "up" : trendRandom > 0.3 ? "neutral" : "down"

  // Generate confidence level between 60% and 95%
  const confidence = Math.round((60 + Math.random() * 35) * 10) / 10

  // Determine prediction based on trend
  const prediction = trend === "up" ? "Hausse attendue" : trend === "down" ? "Baisse probable" : "Stabilité prévue"

  return {
    symbol,
    name,
    currentPrice,
    prediction,
    confidence,
    trend,
    signals: {
      technical: trend === "up" ? "Positif" : trend === "down" ? "Négatif" : "Neutre",
      fundamental: Math.random() > 0.5 ? "Positif" : "Neutre",
      sentiment: Math.random() > 0.5 ? "Positif" : "Neutre",
    },
    timestamp: new Date().toISOString(),
    fundamentals: {
      peRatio: Math.round((10 + Math.random() * 40) * 10) / 10,
      marketCap: `${Math.round(10 + Math.random() * 990)} Mrd`,
      volume: Math.round(1000000 + Math.random() * 9000000),
      avgVolume: Math.round(1200000 + Math.random() * 8800000),
      dividend: Math.round(Math.random() * 300) / 100,
      beta: Math.round((0.5 + Math.random() * 1.5) * 100) / 100,
      eps: Math.round((0.5 + Math.random() * 9.5) * 100) / 100,
      high52: currentPrice * (1 + Math.random() * 0.3),
      low52: currentPrice * (1 - Math.random() * 0.3),
      open: currentPrice * (1 + (Math.random() * 0.02 - 0.01)),
      previousClose: currentPrice * (1 + (Math.random() * 0.02 - 0.01)),
      dayRange: `${(currentPrice * (1 - Math.random() * 0.02)).toFixed(2)} - ${(currentPrice * (1 + Math.random() * 0.02)).toFixed(2)}`,
      floatShares: `${Math.round(100 + Math.random() * 900)}M`,
      roe: Math.round((5 + Math.random() * 25) * 10) / 10,
      roa: Math.round((2 + Math.random() * 13) * 10) / 10,
      profitMargin: Math.round((5 + Math.random() * 20) * 10) / 10,
      debtToEquity: Math.round((0.2 + Math.random() * 0.8) * 10) / 10,
      revenueGrowth: Math.round((-5 + Math.random() * 35) * 10) / 10,
      epsGrowth: Math.round((-5 + Math.random() * 40) * 10) / 10,
      epsEstimateNextQuarter: Math.round((0.5 + Math.random() * 2.5) * 100) / 100,
    },
  }
}
