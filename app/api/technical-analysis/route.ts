// Cache pour limiter les requêtes API
interface CacheEntry {
  data: any
  timestamp: number
}

const cache: Record<string, CacheEntry> = {}
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes en millisecondes au lieu de 5

// Mocked functions for simulation
function generateRandomMAValues(baseValue: number, count: number): number[] {
  const values = []
  for (let i = 0; i < count; i++) {
    const randomFactor = 1 + (Math.random() - 0.5) * 0.1 // Random variation around 1
    values.push(baseValue * randomFactor)
  }
  return values
}

function generateRandomHistogram(count: number): number[] {
  return Array.from({ length: count }, () => Math.random() * 2 - 1) // Values between -1 and 1
}

function generateSimulatedTechnicalData(symbol: string) {
  const currentPrice = 50 + Math.random() * 50 // Simulated price
  const change = (Math.random() - 0.5) * 5 // Simulated change
  const changePercent = (change / currentPrice) * 100
  const rsi = 30 + Math.random() * 70 // Simulated RSI
  const ma20 = currentPrice * (0.95 + Math.random() * 0.1) // Simulated MA20
  const ma50 = currentPrice * (0.9 + Math.random() * 0.15) // Simulated MA50
  const ma200 = currentPrice * (0.8 + Math.random() * 0.2) // Simulated MA200

  const shortTermTrend = analyzeTrend(changePercent, rsi, 0, ma20, ma50, currentPrice)
  const mediumTermTrend = analyzeTrend(null, null, null, ma20, ma50, currentPrice, ma200)
  const longTermTrend = analyzeTrend(null, null, null, null, ma50, currentPrice, ma200)

  const fibonacciLevels = generateFibonacciLevels(currentPrice, shortTermTrend.trend)
  const supportsResistances = generateSupportsResistances(currentPrice, null, ma20, ma50, ma200)
  const pattern = detectPattern(currentPrice, null, rsi, ma20, ma50, ma200, shortTermTrend.trend)

  return {
    symbol,
    name: getStockName(symbol),
    price: currentPrice,
    change: change,
    changePercent: changePercent,
    shortTerm: shortTermTrend,
    mediumTerm: mediumTermTrend,
    longTerm: longTermTrend,
    dayHigh: currentPrice + Math.random() * 5,
    dayLow: currentPrice - Math.random() * 5,
    volume: Math.floor(Math.random() * 1000000),
    rsi: rsi,
    macd: {
      value: Math.random() * 2 - 1,
      signal: Math.random() * 2 - 1,
      histogram: generateRandomHistogram(20),
    },
    movingAverages: {
      ma20: ma20,
      ma50: ma50,
      ma200: ma200,
      alignment: "Mixte",
      values: {
        ma20: generateRandomMAValues(ma20, 30),
        ma50: generateRandomMAValues(ma50, 30),
        ma200: generateRandomMAValues(ma200, 30),
      },
    },
    bollingerBands: {
      upper: currentPrice * 1.02,
      middle: currentPrice,
      lower: currentPrice * 0.98,
      width: 4,
      trend: Math.random() > 0.5 ? "Expansion" : "Contraction",
    },
    fibonacci: {
      levels: fibonacciLevels,
      trend: shortTermTrend.trend,
    },
    pattern: pattern,
    supportResistance: supportsResistances,
    volumeProfile: {
      trend: Math.random() > 0.6 ? "Haussier" : Math.random() > 0.3 ? "Baissier" : "Neutre",
      strength: Math.random() * 100,
      distribution: Array.from({ length: 10 }, () => Math.random() * 100),
    },
    summary: `Simulated data for ${symbol}`,
    detailedAnalysis: `This is a simulated analysis for ${symbol}`,
    lastUpdated: new Date(),
    isSimulated: true,
    dataQuality: "Entièrement simulée",
    realDataPoints: {
      price: false,
      volume: false,
      rsi: false,
      macd: false,
      ma20: false,
      ma50: false,
      ma200: false,
    },
  }
}

function getStockName(symbol: string): string {
  // Replace with a real implementation if needed
  return `Simulated Name for ${symbol}`
}

function isDataSufficientlyReal(realDataPoints: {
  price: boolean
  volume: boolean
  rsi: boolean
  macd: boolean
  ma20: boolean
  ma50: boolean
  ma200: boolean
}): boolean {
  // Define your criteria for "sufficiently real" data here
  // For example, require at least price and volume to be real
  return realDataPoints.price && realDataPoints.volume
}

// Analyser la tendance basée sur différents indicateurs
function analyzeTrend(
  changePercent: number | null,
  rsi: number | null,
  macd: number | null,
  ma20: number | null,
  ma50: number | null,
  currentPrice: number | null,
  ma200: number | null = null,
): { trend: "Haussière" | "Baissière" | "Neutre"; value: number; strength: number } {
  let points = 0
  let totalFactors = 0

  // Tendance basée sur le changement de prix récent
  if (changePercent !== null) {
    points += changePercent > 1 ? 1 : changePercent < -1 ? -1 : 0
    totalFactors++
  }

  // Tendance basée sur le RSI
  if (rsi !== null) {
    if (rsi > 70)
      points -= 0.5 // Suracheté (signal baissier)
    else if (rsi > 60)
      points += 1 // Fort (signal haussier)
    else if (rsi < 30)
      points += 0.5 // Survendu (possible rebond haussier)
    else if (rsi < 40) points -= 1 // Faible (signal baissier)
    totalFactors++
  }

  // Tendance basée sur le MACD
  if (macd !== null) {
    points += macd > 0 ? 1 : macd < 0 ? -1 : 0
    totalFactors++
  }

  // Tendance basée sur les moyennes mobiles
  if (currentPrice !== null) {
    if (ma20 !== null) {
      points += currentPrice > ma20 ? 1 : currentPrice < ma20 ? -1 : 0
      totalFactors++
    }

    if (ma50 !== null) {
      points += currentPrice > ma50 ? 1 : currentPrice < ma50 ? -1 : 0
      totalFactors++
    }

    if (ma200 !== null) {
      points += currentPrice > ma200 ? 1 : currentPrice < ma200 ? -1 : 0
      totalFactors++
    }
  }

  // Alignement des moyennes mobiles
  if (ma20 !== null && ma50 !== null) {
    points += ma20 > ma50 ? 1 : ma20 < ma50 ? -1 : 0
    totalFactors++
  }

  if (ma50 !== null && ma200 !== null) {
    points += ma50 > ma200 ? 1 : ma50 < ma200 ? -1 : 0
    totalFactors++
  }

  // Normaliser le score
  const normalizedScore = totalFactors > 0 ? points / totalFactors : 0

  // Déterminer la tendance
  let trend: "Haussière" | "Baissière" | "Neutre" = "Neutre"
  if (normalizedScore > 0.3) trend = "Haussière"
  else if (normalizedScore < -0.3) trend = "Baissière"

  // Calculer la force relative et la valeur
  const strength = Math.min(100, Math.abs(normalizedScore) * 100 + 40)
  const value = normalizedScore * 5 // Multiplier pour avoir une échelle plus lisible

  return { trend, value, strength }
}

// Générer des niveaux de Fibonacci
function generateFibonacciLevels(currentPrice: number, trend: string) {
  const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]
  const range =
    trend === "Haussière" ? currentPrice * 0.2 : trend === "Baissière" ? -currentPrice * 0.2 : currentPrice * 0.1
  const basePrice = trend === "Haussière" ? currentPrice - range : currentPrice

  return levels.map((level) => {
    const price = basePrice + range * level
    let significance: "Support" | "Résistance" | "Neutre" = "Neutre"

    if (trend === "Haussière") {
      significance = price < currentPrice ? "Support" : "Résistance"
    } else if (trend === "Baissière") {
      significance = price > currentPrice ? "Résistance" : "Support"
    } else {
      significance = Math.random() > 0.5 ? "Support" : "Résistance"
    }

    return { level, price, significance }
  })
}

// Mocked functions for support and resistance, pattern detection, summary, and detailed analysis
function generateSupportsResistances(
  currentPrice: number,
  previousClose: number | null,
  ma20: number | null,
  ma50: number | null,
  ma200: number | null,
) {
  return {
    support1: currentPrice * 0.95,
    resistance1: currentPrice * 1.05,
    support2: currentPrice * 0.9,
    resistance2: currentPrice * 1.1,
  }
}

function detectPattern(
  currentPrice: number,
  previousClose: number | null,
  rsi: number | null,
  ma20: number | null,
  ma50: number | null,
  ma200: number | null,
  trend: string,
) {
  return {
    name: "Simulated Pattern",
    confidence: 0.5,
  }
}

function generateSummary(
  symbol: string,
  trend: string,
  rsi: number | null,
  macdSignal: string,
  maAlignment: string,
  currentPrice: number,
  ma20: number | null,
) {
  return `Simulated summary for ${symbol}. Trend: ${trend}, RSI: ${rsi}, MACD Signal: ${macdSignal}, MA Alignment: ${maAlignment}, Current Price: ${currentPrice}, MA20: ${ma20}.`
}

function generateDetailedAnalysis(
  symbol: string,
  shortTermTrend: any,
  mediumTermTrend: any,
  longTermTrend: any,
  rsi: number | null,
  maAlignment: string,
  ma20: number | null,
  ma50: number | null,
  ma200: number | null,
  pattern: any,
  currentPrice: number,
) {
  return `Simulated detailed analysis for ${symbol}. Short Term Trend: ${shortTermTrend.trend}, Medium Term Trend: ${mediumTermTrend.trend}, Long Term Trend: ${longTermTrend.trend}, RSI: ${rsi}, MA Alignment: ${maAlignment}, MA20: ${ma20}, MA50: ${ma50}, MA200: ${ma200}, Pattern: ${pattern.name}, Current Price: ${currentPrice}.`
}
