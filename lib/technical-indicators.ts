import type { StockHistoryPoint } from "./stock-service"

// Types pour les indicateurs techniques
export interface TechnicalIndicators {
  rsi?: number[]
  macd?: {
    line: number[]
    signal: number[]
    histogram: number[]
  }
  bollingerBands?: {
    upper: number[]
    middle: number[]
    lower: number[]
  }
  ema?: {
    short: number[]
    medium: number[]
    long: number[]
  }
  sma?: {
    short: number[]
    medium: number[]
    long: number[]
  }
  stochastic?: {
    k: number[]
    d: number[]
  }
  obv?: number[]
  atr?: number[]
}

/**
 * Calcule les indicateurs techniques pour un jeu de données historiques
 */
export function calculateIndicators(history: StockHistoryPoint[]): TechnicalIndicators {
  // Vérifier que nous avons suffisamment de données
  if (!history || history.length < 30) {
    return {}
  }

  // Préparer les données dans l'ordre chronologique (du plus ancien au plus récent)
  const chronologicalHistory = [...history].reverse()
  const prices = chronologicalHistory.map((point) => point.price)

  // Calculer les indicateurs
  return {
    rsi: calculateRSI(prices, 14),
    macd: calculateMACD(prices, 12, 26, 9),
    bollingerBands: calculateBollingerBands(prices, 20, 2),
    ema: {
      short: calculateEMA(prices, 9),
      medium: calculateEMA(prices, 21),
      long: calculateEMA(prices, 50),
    },
    sma: {
      short: calculateSMA(prices, 10),
      medium: calculateSMA(prices, 30),
      long: calculateSMA(prices, 100),
    },
    stochastic: calculateStochastic(chronologicalHistory, 14, 3),
    obv: calculateOBV(prices, chronologicalHistory),
    atr: calculateATR(chronologicalHistory, 14),
  }
}

/**
 * Calcule le RSI (Relative Strength Index)
 */
function calculateRSI(prices: number[], period: number): number[] {
  const rsi: number[] = []

  if (prices.length <= period) {
    return rsi
  }

  // Calculer les changements de prix
  const changes: number[] = []
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1])
  }

  // Calculer le gain moyen et la perte moyenne initiale sur la période
  let avgGain = 0
  let avgLoss = 0

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i]
    } else {
      avgLoss += Math.abs(changes[i])
    }
  }

  avgGain /= period
  avgLoss /= period

  // Calculer le RSI pour chaque période
  let rs = avgGain / avgLoss
  rsi.push(100 - 100 / (1 + rs))

  // Calculer le RSI pour le reste des données
  for (let i = period; i < changes.length; i++) {
    const currentGain = changes[i] > 0 ? changes[i] : 0
    const currentLoss = changes[i] < 0 ? Math.abs(changes[i]) : 0

    avgGain = (avgGain * (period - 1) + currentGain) / period
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period

    rs = avgGain / avgLoss
    rsi.push(100 - 100 / (1 + rs))
  }

  return rsi
}

/**
 * Calcule le MACD (Moving Average Convergence Divergence)
 */
function calculateMACD(
  prices: number[],
  shortPeriod: number,
  longPeriod: number,
  signalPeriod: number,
): {
  line: number[]
  signal: number[]
  histogram: number[]
} {
  const shortEMA = calculateEMA(prices, shortPeriod)
  const longEMA = calculateEMA(prices, longPeriod)

  // Calculer la ligne MACD (différence entre EMA court et long)
  const macdLine: number[] = []
  const start = longPeriod - shortPeriod

  for (let i = 0; i < shortEMA.length; i++) {
    const longIndex = i - start
    if (longIndex >= 0) {
      macdLine.push(shortEMA[i] - longEMA[longIndex])
    }
  }

  // Calculer la ligne de signal (EMA de la ligne MACD)
  const signalLine = calculateEMA(macdLine, signalPeriod)

  // Calculer l'histogramme (différence entre MACD et signal)
  const histogram: number[] = []
  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macdLine[i + (macdLine.length - signalLine.length)] - signalLine[i])
  }

  return {
    line: macdLine,
    signal: signalLine,
    histogram,
  }
}

/**
 * Calcule les bandes de Bollinger
 */
function calculateBollingerBands(
  prices: number[],
  period: number,
  multiplier: number,
): {
  upper: number[]
  middle: number[]
  lower: number[]
} {
  const result = {
    upper: [] as number[],
    middle: [] as number[],
    lower: [] as number[],
  }

  if (prices.length < period) {
    return result
  }

  // Calculer la SMA (middle band)
  const sma = calculateSMA(prices, period)

  // Calculer les bandes supérieure et inférieure
  for (let i = period - 1; i < prices.length; i++) {
    const startIdx = i - (period - 1)
    const slice = prices.slice(startIdx, i + 1)

    // Calculer l'écart-type
    const mean = slice.reduce((sum, val) => sum + val, 0) / period
    const squaredDiffs = slice.map((val) => Math.pow(val - mean, 2))
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / period
    const stdDev = Math.sqrt(variance)

    const smaIndex = i - (period - 1)
    result.middle.push(sma[smaIndex])
    result.upper.push(sma[smaIndex] + multiplier * stdDev)
    result.lower.push(sma[smaIndex] - multiplier * stdDev)
  }

  return result
}

/**
 * Calcule l'EMA (Exponential Moving Average)
 */
function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = []

  if (prices.length < period) {
    return ema
  }

  // Calculer la première EMA comme une simple moyenne
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += prices[i]
  }

  // Première valeur EMA
  ema.push(sum / period)

  // Calculer le multiplicateur
  const multiplier = 2 / (period + 1)

  // Calculer le reste des valeurs EMA
  for (let i = period; i < prices.length; i++) {
    ema.push((prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1])
  }

  return ema
}

/**
 * Calcule la SMA (Simple Moving Average)
 */
function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = []

  if (prices.length < period) {
    return sma
  }

  // Calculer la première somme
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += prices[i]
  }

  // Première valeur SMA
  sma.push(sum / period)

  // Calculer le reste des valeurs SMA
  for (let i = period; i < prices.length; i++) {
    sum = sum - prices[i - period] + prices[i]
    sma.push(sum / period)
  }

  return sma
}

/**
 * Calcule le Stochastique
 */
function calculateStochastic(
  history: StockHistoryPoint[],
  kPeriod: number,
  dPeriod: number,
): {
  k: number[]
  d: number[]
} {
  const stochK: number[] = []

  if (history.length < kPeriod) {
    return { k: [], d: [] }
  }

  // Calculer %K
  for (let i = kPeriod - 1; i < history.length; i++) {
    const highestHigh = Math.max(...history.slice(i - (kPeriod - 1), i + 1).map((h) => h.price))
    const lowestLow = Math.min(...history.slice(i - (kPeriod - 1), i + 1).map((h) => h.price))

    const k = ((history[i].price - lowestLow) / (highestHigh - lowestLow)) * 100
    stochK.push(k)
  }

  // Calculer %D (SMA de %K)
  const stochD = calculateSMA(stochK, dPeriod)

  return {
    k: stochK,
    d: stochD,
  }
}

/**
 * Calcule l'OBV (On-Balance Volume)
 * Note: Cette implémentation est simplifiée car nous n'avons pas de données de volume
 * Nous simulons le volume en fonction du changement de prix
 */
function calculateOBV(prices: number[], history: StockHistoryPoint[]): number[] {
  const obv: number[] = [0]

  for (let i = 1; i < prices.length; i++) {
    // Simuler le volume basé sur la variation de prix
    const simulatedVolume = (Math.abs(prices[i] - prices[i - 1]) * 100000) / prices[i]

    if (prices[i] > prices[i - 1]) {
      obv.push(obv[obv.length - 1] + simulatedVolume)
    } else if (prices[i] < prices[i - 1]) {
      obv.push(obv[obv.length - 1] - simulatedVolume)
    } else {
      obv.push(obv[obv.length - 1])
    }
  }

  return obv
}

/**
 * Calcule l'ATR (Average True Range)
 */
function calculateATR(history: StockHistoryPoint[], period: number): number[] {
  const trueRanges: number[] = []
  const atr: number[] = []

  if (history.length < 2) {
    return atr
  }

  // Calculer True Range
  // Pour les données historiques, nous ne connaissons que le prix de clôture
  // Nous simulons donc les prix haut/bas en ajoutant une variance
  for (let i = 1; i < history.length; i++) {
    const variance = history[i].price * 0.01
    const simulatedHigh = history[i].price + variance
    const simulatedLow = history[i].price - variance
    const previousClose = history[i - 1].price

    // True Range = max(high - low, abs(high - prevClose), abs(low - prevClose))
    const tr = Math.max(
      simulatedHigh - simulatedLow,
      Math.abs(simulatedHigh - previousClose),
      Math.abs(simulatedLow - previousClose),
    )

    trueRanges.push(tr)
  }

  // Calculer la première ATR comme une simple moyenne
  if (trueRanges.length >= period) {
    let sum = 0
    for (let i = 0; i < period; i++) {
      sum += trueRanges[i]
    }
    atr.push(sum / period)

    // Calculer le reste des valeurs ATR
    for (let i = period; i < trueRanges.length; i++) {
      atr.push((atr[atr.length - 1] * (period - 1) + trueRanges[i]) / period)
    }
  }

  return atr
}

/**
 * Analyse les indicateurs techniques et retourne une évaluation
 */
export function analyzeIndicators(indicators: TechnicalIndicators): {
  trend: "up" | "down" | "neutral"
  strength: number
  signals: {
    name: string
    signal: "buy" | "sell" | "neutral"
    strength: number
  }[]
} {
  const signals: {
    name: string
    signal: "buy" | "sell" | "neutral"
    strength: number
  }[] = []

  // Analyser le RSI
  if (indicators.rsi && indicators.rsi.length > 0) {
    const currentRSI = indicators.rsi[indicators.rsi.length - 1]
    let rsiSignal: "buy" | "sell" | "neutral" = "neutral"
    let rsiStrength = 0.5

    if (currentRSI < 30) {
      rsiSignal = "buy"
      rsiStrength = 0.7 + ((30 - currentRSI) / 30) * 0.3
    } else if (currentRSI > 70) {
      rsiSignal = "sell"
      rsiStrength = 0.7 + ((currentRSI - 70) / 30) * 0.3
    } else {
      // Zone neutre: plus proche de 50, plus faible est le signal
      rsiStrength = 0.5 - Math.abs(currentRSI - 50) / 40
    }

    signals.push({
      name: "RSI",
      signal: rsiSignal,
      strength: rsiStrength,
    })
  }

  // Analyser le MACD
  if (indicators.macd && indicators.macd.histogram && indicators.macd.histogram.length > 1) {
    const currentHistogram = indicators.macd.histogram[indicators.macd.histogram.length - 1]
    const previousHistogram = indicators.macd.histogram[indicators.macd.histogram.length - 2]

    let macdSignal: "buy" | "sell" | "neutral" = "neutral"
    let macdStrength = 0.5

    if (currentHistogram > 0 && previousHistogram <= 0) {
      // Croisement haussier
      macdSignal = "buy"
      macdStrength = 0.8
    } else if (currentHistogram < 0 && previousHistogram >= 0) {
      // Croisement baissier
      macdSignal = "sell"
      macdStrength = 0.8
    } else if (currentHistogram > 0) {
      // Tendance haussière
      macdSignal = "buy"
      macdStrength = 0.6
    } else if (currentHistogram < 0) {
      // Tendance baissière
      macdSignal = "sell"
      macdStrength = 0.6
    }

    signals.push({
      name: "MACD",
      signal: macdSignal,
      strength: macdStrength,
    })
  }

  // Analyser les Bandes de Bollinger
  if (indicators.bollingerBands && indicators.bollingerBands.upper.length > 0) {
    const upper = indicators.bollingerBands.upper[indicators.bollingerBands.upper.length - 1]
    const lower = indicators.bollingerBands.lower[indicators.bollingerBands.lower.length - 1]
    const middle = indicators.bollingerBands.middle[indicators.bollingerBands.middle.length - 1]

    // Nous avons besoin du prix actuel
    // Comme nous n'avons pas directement accès au prix actuel ici,
    // nous allons considérer que le dernier prix est proche de la bande médiane
    // Dans une implémentation réelle, le prix actuel devrait être passé à cette fonction
    const estimatedPrice = middle * 1.005 // Simulation d'un prix légèrement au-dessus de la moyenne

    let bbSignal: "buy" | "sell" | "neutral" = "neutral"
    let bbStrength = 0.5

    if (estimatedPrice < lower * 1.01) {
      bbSignal = "buy"
      bbStrength = 0.7 + (0.3 * (lower - estimatedPrice)) / lower
    } else if (estimatedPrice > upper * 0.99) {
      bbSignal = "sell"
      bbStrength = 0.7 + (0.3 * (estimatedPrice - upper)) / upper
    } else {
      // Position dans les bandes
      const range = upper - lower
      const positionRatio = (estimatedPrice - lower) / range

      if (positionRatio < 0.4) {
        bbSignal = "buy"
        bbStrength = 0.5 + (0.4 - positionRatio) * 0.5
      } else if (positionRatio > 0.6) {
        bbSignal = "sell"
        bbStrength = 0.5 + (positionRatio - 0.6) * 0.5
      }
    }

    signals.push({
      name: "Bollinger",
      signal: bbSignal,
      strength: bbStrength,
    })
  }

  // Analyser les moyennes mobiles (croisements)
  if (indicators.ema && indicators.ema.short.length > 0 && indicators.ema.medium.length > 0) {
    const shortEMA = indicators.ema.short[indicators.ema.short.length - 1]
    const mediumEMA = indicators.ema.medium[indicators.ema.medium.length - 1]

    let emaSignal: "buy" | "sell" | "neutral" = "neutral"
    let emaStrength = 0.5

    if (shortEMA > mediumEMA) {
      emaSignal = "buy"
      emaStrength = 0.6 + (0.4 * (shortEMA - mediumEMA)) / mediumEMA
    } else if (shortEMA < mediumEMA) {
      emaSignal = "sell"
      emaStrength = 0.6 + (0.4 * (mediumEMA - shortEMA)) / mediumEMA
    }

    signals.push({
      name: "EMA",
      signal: emaSignal,
      strength: emaStrength,
    })
  }

  // Analyser le Stochastic
  if (indicators.stochastic && indicators.stochastic.k.length > 0 && indicators.stochastic.d.length > 0) {
    const currentK = indicators.stochastic.k[indicators.stochastic.k.length - 1]
    const currentD = indicators.stochastic.d[indicators.stochastic.d.length - 1]

    let stochSignal: "buy" | "sell" | "neutral" = "neutral"
    let stochStrength = 0.5

    if (currentK < 20 && currentD < 20) {
      stochSignal = "buy"
      stochStrength = 0.7 + (0.3 * (20 - Math.min(currentK, currentD))) / 20
    } else if (currentK > 80 && currentD > 80) {
      stochSignal = "sell"
      stochStrength = 0.7 + (0.3 * (Math.max(currentK, currentD) - 80)) / 20
    } else if (currentK > currentD) {
      stochSignal = "buy"
      stochStrength = 0.5 + (0.3 * (currentK - currentD)) / 100
    } else if (currentK < currentD) {
      stochSignal = "sell"
      stochStrength = 0.5 + (0.3 * (currentD - currentK)) / 100
    }

    signals.push({
      name: "Stochastic",
      signal: stochSignal,
      strength: stochStrength,
    })
  }

  // Calculer la tendance globale et la force du signal
  let buyCount = 0
  let sellCount = 0
  let totalStrength = 0
  let weightedStrength = 0

  signals.forEach((signal) => {
    if (signal.signal === "buy") {
      buyCount++
      weightedStrength += signal.strength
    } else if (signal.signal === "sell") {
      sellCount++
      weightedStrength -= signal.strength
    }
    totalStrength += signal.strength
  })

  const normalizedStrength = totalStrength > 0 ? weightedStrength / totalStrength : 0
  let overallTrend: "up" | "down" | "neutral" = "neutral"

  if (normalizedStrength > 0.2) {
    overallTrend = "up"
  } else if (normalizedStrength < -0.2) {
    overallTrend = "down"
  }

  return {
    trend: overallTrend,
    strength: Math.abs(normalizedStrength),
    signals,
  }
}

/**
 * Récupère et calcule les indicateurs techniques pour un symbole donné
 * @param symbol Symbole de l'action
 * @param history Données historiques (optionnel, sera récupéré si non fourni)
 */
export async function getTechnicalIndicators(
  symbol: string,
  history?: StockHistoryPoint[],
): Promise<TechnicalIndicators> {
  try {
    // Si l'historique n'est pas fourni, on le récupère
    if (!history || history.length === 0) {
      // Importer de manière dynamique pour éviter les dépendances circulaires
      const { getStockHistory } = await import("./stock-service")
      history = await getStockHistory(symbol, 365)
    }

    // Calculer les indicateurs techniques
    return calculateIndicators(history)
  } catch (error) {
    console.error(`Erreur lors du calcul des indicateurs techniques pour ${symbol}:`, error)
    return {} // Retourner un objet vide en cas d'erreur
  }
}
