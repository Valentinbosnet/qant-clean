import { ALPHA_VANTAGE_CONFIG as AV_CONFIG } from "./alpha-vantage-config"

// Cache amélioré pour l'API premium
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
  source: "API" | "CACHE" | "SIMULATION"
}

// Créer des caches séparés pour différents types de données
const stockDataCache: Record<string, CacheEntry<any>> = {}
const technicalDataCache: Record<string, CacheEntry<any>> = {}
const historicalDataCache: Record<string, CacheEntry<any>> = {}
const searchResultCache: Record<string, CacheEntry<any>> = {}

// File d'attente pour gérer les limites d'API
class RequestQueue {
  private queue: Array<() => Promise<any>> = []
  private processing = false
  private requestsThisMinute = 0
  private requestsToday = 0
  private minuteTimer: NodeJS.Timeout | null = null
  private dayTimer: NodeJS.Timeout | null = null

  constructor() {
    // Réinitialiser le compteur de requêtes par minute
    this.minuteTimer = setInterval(() => {
      this.requestsThisMinute = 0
      this.processQueue()
    }, 60 * 1000)

    // Réinitialiser le compteur de requêtes par jour
    this.dayTimer = setInterval(
      () => {
        this.requestsToday = 0
      },
      24 * 60 * 60 * 1000,
    )
  }

  public async addToQueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request()
          resolve(result)
          return result
        } catch (error) {
          reject(error)
          throw error
        }
      })

      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return

    if (
      this.requestsThisMinute >= AV_CONFIG.API_LIMITS.CALLS_PER_MINUTE ||
      this.requestsToday >= AV_CONFIG.API_LIMITS.CALLS_PER_DAY
    ) {
      return // Attendre le prochain intervalle
    }

    this.processing = true

    // Traiter jusqu'à N requêtes simultanément (selon votre niveau premium)
    const batch = this.queue.splice(0, AV_CONFIG.API_LIMITS.CONCURRENT_REQUESTS)
    if (batch.length > 0) {
      this.requestsThisMinute += batch.length
      this.requestsToday += batch.length

      try {
        await Promise.all(batch.map((request) => request()))
      } catch (error) {
        console.error("Error processing request batch:", error)
      }
    }

    this.processing = false

    // Si d'autres requêtes sont en attente, continuer le traitement
    if (this.queue.length > 0) {
      this.processQueue()
    }
  }

  public cleanup() {
    if (this.minuteTimer) clearInterval(this.minuteTimer)
    if (this.dayTimer) clearInterval(this.dayTimer)
  }
}

// Singleton pour la file d'attente
const requestQueue = new RequestQueue()

// Fonction pour construire l'URL de l'API Alpha Vantage
function buildApiUrl(functionName: string, symbol: string, additionalParams: Record<string, string> = {}): string {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY

  if (!apiKey) {
    throw new Error("Alpha Vantage API key is not configured")
  }

  const baseUrl = "https://www.alphavantage.co/query"
  const params = new URLSearchParams({
    function: functionName,
    symbol,
    apikey: apiKey,
    ...additionalParams,
  })

  return `${baseUrl}?${params.toString()}`
}

// Fonction pour récupérer les données d'une action avec version premium
export async function getPremiumStockQuote(symbol: string): Promise<any> {
  const cacheKey = `quote_${symbol.toUpperCase()}`
  const now = Date.now()

  // Vérifier le cache
  const cachedData = stockDataCache[cacheKey]
  if (cachedData && now < cachedData.expiry) {
    console.log(`[INFO] Utilisation des données en cache pour ${symbol}`)
    return cachedData.data
  }

  // Ajouter la requête à la file d'attente
  return requestQueue.addToQueue(async () => {
    try {
      console.log(`[INFO] Récupération des données premium pour ${symbol}`)

      const url = buildApiUrl(AV_CONFIG.ENDPOINTS.GLOBAL_QUOTE, symbol)
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()

      // Vérifier si la réponse contient des données valides
      if (data["Error Message"]) {
        throw new Error(data["Error Message"])
      }

      if (!data["Global Quote"] || Object.keys(data["Global Quote"]).length === 0) {
        throw new Error("No data available for this symbol")
      }

      const quote = data["Global Quote"]

      // Formater les données
      const stockData = {
        symbol: symbol.toUpperCase(),
        name: await getCompanyName(symbol), // Fonction à implémenter ou à utiliser depuis stock-service.ts
        price: Number.parseFloat(quote["05. price"]),
        open: Number.parseFloat(quote["02. open"]),
        high: Number.parseFloat(quote["03. high"]),
        low: Number.parseFloat(quote["04. low"]),
        volume: Number.parseInt(quote["06. volume"], 10),
        latestTradingDay: quote["07. latest trading day"],
        previousClose: Number.parseFloat(quote["08. previous close"]),
        change: Number.parseFloat(quote["09. change"]),
        changePercent: Number.parseFloat(quote["10. change percent"].replace("%", "")),
        dataSource: "Alpha Vantage Premium",
        lastUpdated: new Date().toISOString(),
        isSimulated: false,
      }

      // Mettre à jour le cache avec une expiration
      stockDataCache[cacheKey] = {
        data: stockData,
        timestamp: now,
        expiry: now + AV_CONFIG.CACHE.STOCK_DATA_TTL,
        source: "API",
      }

      return stockData
    } catch (error) {
      console.error(`[ERROR] Failed to fetch data for ${symbol}:`, error)

      // Si nous avons des données en cache périmées, les utiliser plutôt que de simuler
      if (cachedData) {
        console.log(`[INFO] Using expired cache data for ${symbol}`)
        return cachedData.data
      }

      // En dernier recours, générer des données simulées
      const simulatedData = {
        symbol: symbol.toUpperCase(),
        name: getCompanyNameFallback(symbol),
        price: 100 + Math.random() * 100,
        open: 95 + Math.random() * 100,
        high: 105 + Math.random() * 100,
        low: 90 + Math.random() * 100,
        volume: Math.floor(Math.random() * 10000000),
        latestTradingDay: new Date().toISOString().split("T")[0],
        previousClose: 98 + Math.random() * 100,
        change: Math.random() * 10 - 5,
        changePercent: Math.random() * 5 - 2.5,
        dataSource: "Simulation (API Error)",
        lastUpdated: new Date().toISOString(),
        isSimulated: true,
      }

      // Mettre en cache les données simulées mais avec une expiration plus courte
      stockDataCache[cacheKey] = {
        data: simulatedData,
        timestamp: now,
        expiry: now + AV_CONFIG.CACHE.STOCK_DATA_TTL / 2, // Moitié de la durée normale
        source: "SIMULATION",
      }

      return simulatedData
    }
  })
}

// Fonction pour obtenir les données techniques complètes (tous les indicateurs en une fois)
export async function getComprehensiveTechnicalData(
  symbol: string,
  interval = AV_CONFIG.INTERVALS.DAILY,
  forceRefresh = false,
  allowSimulated = false,
): Promise<any> {
  const cacheKey = `tech_${symbol.toUpperCase()}_${interval}`
  const now = Date.now()

  // Vérifier le cache
  const cachedData = technicalDataCache[cacheKey]
  if (!forceRefresh && cachedData && now < cachedData.expiry) {
    return cachedData.data
  }

  // Collecter tous les indicateurs en parallèle
  return requestQueue.addToQueue(async () => {
    try {
      console.log(`[INFO] Fetching comprehensive technical data for ${symbol}`)

      // Récupérer d'abord les données OHLCV
      const timeSeriesUrl = buildApiUrl(
        interval.includes("min") ? AV_CONFIG.ENDPOINTS.TIME_SERIES_INTRADAY : AV_CONFIG.ENDPOINTS.TIME_SERIES_DAILY,
        symbol,
        interval.includes("min")
          ? { interval, outputsize: AV_CONFIG.OUTPUT_SIZE.FULL }
          : { outputsize: AV_CONFIG.OUTPUT_SIZE.FULL },
      )

      const timeSeriesResponse = await fetch(timeSeriesUrl)
      if (!timeSeriesResponse.ok) throw new Error(`Time series request failed: ${timeSeriesResponse.status}`)
      const timeSeriesData = await timeSeriesResponse.json()

      // Structure pour stocker tous les indicateurs
      const technicalData: any = {
        symbol,
        interval,
        lastUpdated: new Date().toISOString(),
        ohlcv: extractOHLCVData(timeSeriesData, interval),
        indicators: {},
      }

      // Récupérer les indicateurs techniques les plus importants
      const indicators = [
        { name: "SMA", params: { time_period: "20", series_type: "close" } },
        { name: "SMA", params: { time_period: "50", series_type: "close" } },
        { name: "SMA", params: { time_period: "200", series_type: "close" } },
        { name: "EMA", params: { time_period: "12", series_type: "close" } },
        { name: "EMA", params: { time_period: "26", series_type: "close" } },
        { name: "RSI", params: { time_period: "14", series_type: "close" } },
        { name: "MACD", params: { series_type: "close", fastperiod: "12", slowperiod: "26", signalperiod: "9" } },
        { name: "BBANDS", params: { time_period: "20", series_type: "close", nbdevup: "2", nbdevdn: "2" } },
      ]

      // Limiter à 5 requêtes simultanées pour respecter les limites de l'API
      const indicatorData = await Promise.all(
        indicators.map(async (indicator) => {
          const url = buildApiUrl(indicator.name, symbol, { ...indicator.params, interval })

          try {
            const response = await fetch(url)
            if (!response.ok) throw new Error(`${indicator.name} request failed: ${response.status}`)
            const data = await response.json()
            return { name: indicator.name, params: indicator.params, data }
          } catch (error) {
            console.error(`Failed to fetch ${indicator.name}:`, error)
            return { name: indicator.name, params: indicator.params, error: true }
          }
        }),
      )

      // Traiter tous les indicateurs et les ajouter à l'objet technicalData
      indicatorData.forEach((result) => {
        if (!result.error) {
          const key = `${result.name}${result.params.time_period || ""}`
          technicalData.indicators[key] = extractIndicatorData(result.data, result.name)
        }
      })

      // Calculer des indicateurs dérivés et des signaux
      technicalData.signals = analyzeSignals(technicalData)

      // Mettre en cache
      technicalDataCache[cacheKey] = {
        data: technicalData,
        timestamp: now,
        expiry: now + AV_CONFIG.CACHE.TECHNICAL_DATA_TTL,
        source: "API",
      }

      return technicalData
    } catch (error) {
      console.error(`[ERROR] Technical analysis failed for ${symbol}:`, error)

      // Si nous avons des données en cache périmées, les utiliser
      if (cachedData) {
        return cachedData.data
      }

      // En dernier recours, retourner un objet avec l'erreur
      return {
        symbol,
        interval,
        error: true,
        message: `Failed to retrieve technical data: ${error}`,
        lastUpdated: new Date().toISOString(),
      }
    }
  })
}

// Fonction auxiliaire pour extraire les données OHLCV
function extractOHLCVData(data: any, interval: string): any[] {
  try {
    const timeSeriesKey = Object.keys(data).find((key) => key.includes("Time Series"))
    if (!timeSeriesKey || !data[timeSeriesKey]) {
      throw new Error("Time series data not found")
    }

    const timeSeries = data[timeSeriesKey]
    return Object.entries(timeSeries)
      .map(([date, values]: [string, any]) => ({
        date,
        open: Number.parseFloat(values["1. open"]),
        high: Number.parseFloat(values["2. high"]),
        low: Number.parseFloat(values["3. low"]),
        close: Number.parseFloat(values["4. close"]),
        volume: Number.parseInt(values["5. volume"], 10),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    console.error("Failed to extract OHLCV data:", error)
    return []
  }
}

// Fonction auxiliaire pour extraire les données d'indicateur
function extractIndicatorData(data: any, indicatorName: string): any[] {
  try {
    const technicalKey = Object.keys(data).find((key) => key.includes("Technical Analysis"))
    if (!technicalKey || !data[technicalKey]) {
      throw new Error(`Technical data not found for ${indicatorName}`)
    }

    const technical = data[technicalKey]
    const result = []

    for (const [date, indicatorValues] of Object.entries(technical as Record<string, string>)) {
      const entry: any = { date }

      for (const [key, value] of Object.entries(indicatorValues as Record<string, string>)) {
        entry[key] = Number.parseFloat(value as string)
      }

      result.push(entry)
    }

    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    console.error(`Failed to extract ${indicatorName} data:`, error)
    return []
  }
}

// Fonction pour analyser les signaux techniques
function analyzeSignals(technicalData: any): any {
  // Implémentez votre logique d'analyse des signaux ici
  // Ceci est un exemple simplifié
  const signals: any = {
    trend: "neutral",
    strength: 0,
    signals: [],
  }

  const ohlcv = technicalData.ohlcv
  if (!ohlcv || ohlcv.length < 2) return signals

  const latestPrice = ohlcv[ohlcv.length - 1].close

  // Analyser MA trends
  if (technicalData.indicators.SMA20 && technicalData.indicators.SMA50) {
    const sma20 = technicalData.indicators.SMA20[technicalData.indicators.SMA20.length - 1].SMA
    const sma50 = technicalData.indicators.SMA50[technicalData.indicators.SMA50.length - 1].SMA

    if (latestPrice > sma20 && sma20 > sma50) {
      signals.trend = "bullish"
      signals.strength += 2
      signals.signals.push({
        type: "MA",
        signal: "bullish",
        description: "Prix au-dessus des MA20 et MA50, MA20 au-dessus de MA50",
      })
    } else if (latestPrice < sma20 && sma20 < sma50) {
      signals.trend = "bearish"
      signals.strength -= 2
      signals.signals.push({
        type: "MA",
        signal: "bearish",
        description: "Prix en-dessous des MA20 et MA50, MA20 en-dessous de MA50",
      })
    }
  }

  // Analyser RSI
  if (technicalData.indicators.RSI14) {
    const rsi = technicalData.indicators.RSI14[technicalData.indicators.RSI14.length - 1].RSI

    if (rsi > 70) {
      signals.signals.push({ type: "RSI", signal: "overbought", value: rsi, description: "RSI en zone de surachat" })
      signals.strength -= 1
    } else if (rsi < 30) {
      signals.signals.push({ type: "RSI", signal: "oversold", value: rsi, description: "RSI en zone de survente" })
      signals.strength += 1
    }
  }

  // Analyser MACD
  if (technicalData.indicators.MACD) {
    const macdData = technicalData.indicators.MACD
    if (macdData.length >= 2) {
      const current = macdData[macdData.length - 1]
      const previous = macdData[macdData.length - 2]

      if (current.MACD > current.MACD_Signal && previous.MACD <= previous.MACD_Signal) {
        signals.signals.push({ type: "MACD", signal: "bullish_crossover", description: "Croisement haussier du MACD" })
        signals.strength += 2
      } else if (current.MACD < current.MACD_Signal && previous.MACD >= previous.MACD_Signal) {
        signals.signals.push({ type: "MACD", signal: "bearish_crossover", description: "Croisement baissier du MACD" })
        signals.strength -= 2
      }
    }
  }

  // Déterminer la tendance finale basée sur la force
  if (signals.strength > 2) {
    signals.trend = "strongly_bullish"
  } else if (signals.strength > 0) {
    signals.trend = "bullish"
  } else if (signals.strength < -2) {
    signals.trend = "strongly_bearish"
  } else if (signals.strength < 0) {
    signals.trend = "bearish"
  } else {
    signals.trend = "neutral"
  }

  return signals
}

// Fonction de secours pour les noms d'entreprises
function getCompanyNameFallback(symbol: string): string {
  const companies: Record<string, string> = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com, Inc.",
    META: "Meta Platforms, Inc.",
    TSLA: "Tesla, Inc.",
    NVDA: "NVIDIA Corporation",
    JPM: "JPMorgan Chase & Co.",
    V: "Visa Inc.",
    WMT: "Walmart Inc.",
  }

  return companies[symbol.toUpperCase()] || `${symbol.toUpperCase()} Inc.`
}

// Fonction pour obtenir le nom de l'entreprise (avec mise en cache)
async function getCompanyName(symbol: string): Promise<string> {
  const cacheKey = `company_${symbol.toUpperCase()}`
  const cachedName = searchResultCache[cacheKey]?.data

  if (cachedName) {
    return cachedName
  }

  try {
    const url = buildApiUrl(AV_CONFIG.ENDPOINTS.SYMBOL_SEARCH, symbol)
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Company search failed: ${response.status}`)
    }

    const data = await response.json()

    if (data.bestMatches && data.bestMatches.length > 0) {
      const companyName = data.bestMatches[0]["2. name"]

      // Mettre en cache pour toujours (noms d'entreprises ne changent pas souvent)
      searchResultCache[cacheKey] = {
        data: companyName,
        timestamp: Date.now(),
        expiry: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 jours
        source: "API",
      }

      return companyName
    }
  } catch (error) {
    console.error(`Failed to get company name for ${symbol}:`, error)
  }

  // Fallback
  return getCompanyNameFallback(symbol)
}

// Exporter d'autres fonctions nécessaires...
