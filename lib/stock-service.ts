// Liste des actions populaires
export const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "JPM", "V", "WMT"]

// Interface pour les données boursières
export interface StockData {
  symbol: string
  name: string
  currentPrice: number
  previousClose?: number
  change?: number
  changePercent?: number
  volume?: number
  marketCap?: number
  peRatio?: number
  dividend?: number
  volatility?: number
  lastUpdated: Date
  isSimulated: boolean // Indique si les données sont simulées ou réelles
}

// Cache pour limiter les requêtes API
interface CacheEntry {
  data: any
  timestamp: number
}

const stockCache: Record<string, CacheEntry> = {}
const CACHE_DURATION = 60000 // 60 secondes en millisecondes

// Cache pour l'historique des prix
const historyCache: Record<string, { data: any; timestamp: number }> = {}

// Fonction pour récupérer les données d'un stock
export async function getStockData(symbol: string) {
  try {
    // Simuler des données de stock puisque nous n'avons pas accès à une API réelle
    // Dans un environnement de production, vous feriez un appel à une API comme Alpha Vantage ici
    const currentPrice = Math.random() * 500 + 100
    const previousClose = currentPrice * (1 + (Math.random() * 0.1 - 0.05))
    const change = currentPrice - previousClose
    const changePercent = (change / previousClose) * 100

    // Générer un historique de prix simulé
    const history = generatePriceHistory(currentPrice)

    return {
      symbol: symbol.toUpperCase(),
      name: getCompanyName(symbol),
      currentPrice,
      previousClose,
      change,
      changePercent,
      history,
      isSimulated: true,
    }
  } catch (error) {
    console.error("Error in getStockData:", error)
    // Retourner des données par défaut en cas d'erreur
    return {
      symbol: symbol.toUpperCase(),
      name: getCompanyName(symbol),
      currentPrice: 200,
      previousClose: 195,
      change: 5,
      changePercent: 2.56,
      history: generateDefaultHistory(),
      isSimulated: true,
    }
  }
}

// Fonction pour récupérer les données d'une action
export async function getStockQuote(symbol: string): Promise<StockData | null> {
  try {
    // Vérifier le cache
    const now = Date.now()
    const cacheKey = `stock_${symbol}`
    const cacheEntry = stockCache[cacheKey]

    // Si les données sont en cache et encore valides, les retourner
    if (cacheEntry && now - cacheEntry.timestamp < CACHE_DURATION) {
      console.log(`[INFO] Utilisation des données en cache pour ${symbol}`)
      return cacheEntry.data
    }

    // Récupérer les données depuis l'API Alpha Vantage
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey) {
      console.warn("[WARN] Clé API Alpha Vantage non configurée, utilisation de données simulées")
      const simulatedData = generateSimulatedStockData(symbol)
      stockCache[cacheKey] = {
        data: simulatedData,
        timestamp: now,
      }
      return simulatedData
    }

    console.log(`[INFO] Récupération des données réelles pour ${symbol} depuis Alpha Vantage`)
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`,
    )

    if (!response.ok) {
      console.error(`[ERROR] Erreur API Alpha Vantage: ${response.status}`)
      throw new Error(`Erreur API: ${response.status}`)
    }

    const data = await response.json()

    // Vérifier si les données sont valides
    if (data["Error Message"]) {
      console.error(`[ERROR] Message d'erreur Alpha Vantage: ${data["Error Message"]}`)
      throw new Error(data["Error Message"])
    }

    if (!data["Global Quote"] || Object.keys(data["Global Quote"]).length === 0) {
      console.warn(`[WARN] Aucune donnée disponible pour ${symbol}, utilisation de données simulées`)
      // Si aucune donnée n'est disponible, générer des données simulées
      const simulatedData = generateSimulatedStockData(symbol)

      // Mettre en cache les données simulées
      stockCache[cacheKey] = {
        data: simulatedData,
        timestamp: now,
      }

      return simulatedData
    }

    const quote = data["Global Quote"]
    console.log(`[INFO] Données réelles reçues pour ${symbol}:`, quote)

    // Extraire les données pertinentes
    const stockData: StockData = {
      symbol,
      name: getStockName(symbol),
      currentPrice: Number.parseFloat(quote["05. price"]),
      previousClose: Number.parseFloat(quote["08. previous close"]),
      change: Number.parseFloat(quote["09. change"]),
      changePercent: Number.parseFloat(quote["10. change percent"].replace("%", "")),
      volume: Number.parseInt(quote["06. volume"]),
      volatility: calculateVolatility(
        Number.parseFloat(quote["05. price"]),
        Number.parseFloat(quote["08. previous close"]),
      ),
      lastUpdated: new Date(),
      isSimulated: false,
    }

    // Mettre en cache les données
    stockCache[cacheKey] = {
      data: stockData,
      timestamp: now,
    }

    return stockData
  } catch (error) {
    console.error(`[ERROR] Erreur lors de la récupération des données pour ${symbol}:`, error)

    // En cas d'erreur, générer des données simulées
    const simulatedData = generateSimulatedStockData(symbol)

    // Mettre en cache les données simulées
    stockCache[`stock_${symbol}`] = {
      data: simulatedData,
      timestamp: Date.now(),
    }

    return simulatedData
  }
}

// Fonction pour rechercher des actions
export async function searchStocks(query: string): Promise<any[]> {
  try {
    // Si la requête est vide, retourner les actions populaires
    if (!query.trim()) {
      return popularStocks.map((symbol) => ({
        symbol,
        name: getStockName(symbol),
      }))
    }

    // Vérifier le cache
    const now = Date.now()
    const cacheKey = `search_${query}`
    const cacheEntry = stockCache[cacheKey]

    // Si les résultats sont en cache et encore valides, les retourner
    if (cacheEntry && now - cacheEntry.timestamp < CACHE_DURATION) {
      return cacheEntry.data
    }

    // Récupérer les résultats depuis l'API Alpha Vantage
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey) {
      throw new Error("Clé API Alpha Vantage non configurée")
    }

    const response = await fetch(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${apiKey}`,
    )

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`)
    }

    const data = await response.json()

    // Vérifier si les données sont valides
    if (data["Error Message"]) {
      throw new Error(data["Error Message"])
    }

    if (!data.bestMatches || data.bestMatches.length === 0) {
      // Si aucun résultat n'est trouvé, filtrer les actions populaires
      const filteredStocks = popularStocks.filter((stock) => stock.toLowerCase().includes(query.toLowerCase()))

      const results = filteredStocks.map((symbol) => ({
        symbol,
        name: getStockName(symbol),
      }))

      // Mettre en cache les résultats
      stockCache[cacheKey] = {
        data: results,
        timestamp: now,
      }

      return results
    }

    // Extraire les résultats pertinents
    const results = data.bestMatches.map((match: any) => ({
      symbol: match["1. symbol"],
      name: match["2. name"],
      type: match["3. type"],
      region: match["4. region"],
    }))

    // Mettre en cache les résultats
    stockCache[cacheKey] = {
      data: results,
      timestamp: now,
    }

    return results
  } catch (error) {
    console.error("Erreur lors de la recherche d'actions:", error)

    // En cas d'erreur, filtrer les actions populaires
    const filteredStocks = popularStocks.filter((stock) => stock.toLowerCase().includes(query.toLowerCase()))

    return filteredStocks.map((symbol) => ({
      symbol,
      name: getStockName(symbol),
    }))
  }
}

// Fonction pour générer un historique de prix simulé
function generatePriceHistory(currentPrice: number) {
  const history = []
  const now = new Date()
  const volatility = 0.02 // 2% de volatilité

  // Générer des données pour les 7 derniers jours, avec des points toutes les heures
  for (let i = 168; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 60 * 60 * 1000)
    const randomChange = (Math.random() - 0.5) * volatility
    const price = currentPrice * (1 + randomChange * (i / 24))

    history.push({
      timestamp: date.toISOString(),
      price: price,
    })
  }

  return history
}

// Fonction pour générer un historique par défaut en cas d'erreur
function generateDefaultHistory() {
  const history = []
  const now = new Date()
  const basePrice = 200

  for (let i = 168; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 60 * 60 * 1000)
    const randomChange = (Math.random() - 0.5) * 0.01
    const price = basePrice * (1 + randomChange * (i / 24))

    history.push({
      timestamp: date.toISOString(),
      price: price,
    })
  }

  return history
}

// Fonction pour obtenir le nom de l'entreprise à partir du symbole
function getCompanyName(symbol: string) {
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
    // Ajouter d'autres entreprises au besoin
  }

  return companies[symbol.toUpperCase()] || `${symbol.toUpperCase()} Inc.`
}

// Fonction pour obtenir le nom d'une action à partir de son symbole
function getStockName(symbol: string): string {
  const stockNames: Record<string, string> = {
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

  return stockNames[symbol] || `${symbol} Stock`
}

// Fonction pour calculer la volatilité
function calculateVolatility(currentPrice: number, previousClose: number): number {
  if (!previousClose) return 0.02 // Valeur par défaut

  const absoluteChange = Math.abs(currentPrice - previousClose)
  return absoluteChange / previousClose
}

// Fonction pour générer des données simulées
function generateSimulatedStockData(symbol: string): StockData {
  // Utiliser des prix plus réalistes pour les actions populaires
  const realPrices: Record<string, number> = {
    AAPL: 202.14, // Prix réel d'Apple en USD
    MSFT: 415.5,
    GOOGL: 175.0,
    AMZN: 180.5,
    META: 500.0,
    TSLA: 175.0,
    NVDA: 950.0,
    JPM: 200.0,
    V: 275.0,
    WMT: 60.0,
  }

  // Utiliser le prix réel si disponible, sinon générer un prix aléatoire
  const basePrice = realPrices[symbol] || Math.floor(Math.random() * 500) + 50
  const previousClose = basePrice * (1 + (Math.random() * 0.04 - 0.02))
  const currentPrice = previousClose * (1 + (Math.random() * 0.04 - 0.02))
  const change = currentPrice - previousClose
  const changePercent = (change / previousClose) * 100

  return {
    symbol,
    name: getStockName(symbol),
    currentPrice,
    previousClose,
    change,
    changePercent,
    volume: Math.floor(Math.random() * 10000000),
    marketCap: currentPrice * (Math.floor(Math.random() * 1000000000) + 1000000000),
    peRatio: Math.floor(Math.random() * 50) + 10,
    dividend: Math.random() * 3,
    volatility: Math.abs(change / previousClose),
    lastUpdated: new Date(),
    isSimulated: true, // Marquer les données comme simulées
  }
}

// Fonction pour récupérer l'historique des prix d'une action
export async function getStockHistory(symbol: string): Promise<{ timestamp: string; price: number }[]> {
  try {
    // Vérifier le cache
    const now = Date.now()
    const cacheKey = `history_${symbol}`
    const cacheEntry = historyCache[cacheKey]

    // Si les données sont en cache et encore valides, les retourner
    if (cacheEntry && now - cacheEntry.timestamp < CACHE_DURATION) {
      console.log(`[INFO] Utilisation de l'historique en cache pour ${symbol}`)
      return cacheEntry.data
    }

    // Essayer de récupérer les données réelles depuis l'API Alpha Vantage
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey) {
      console.warn("[WARN] Clé API Alpha Vantage non configurée, utilisation d'historique simulé")
      const simulatedHistory = generateSimulatedHistory(symbol)
      historyCache[cacheKey] = {
        data: simulatedHistory,
        timestamp: now,
      }
      return simulatedHistory
    }

    // Essayer d'abord de récupérer les données intraday
    console.log(`[INFO] Récupération de l'historique réel pour ${symbol} depuis Alpha Vantage`)
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=60min&outputsize=compact&apikey=${apiKey}`,
    )

    if (!response.ok) {
      console.error(`[ERROR] Erreur API Alpha Vantage: ${response.status}`)
      throw new Error(`Erreur API: ${response.status}`)
    }

    const data = await response.json()

    // Vérifier si les données sont valides
    if (data["Error Message"]) {
      console.error(`[ERROR] Message d'erreur Alpha Vantage: ${data["Error Message"]}`)
      throw new Error(data["Error Message"])
    }

    if (!data["Time Series (60min)"] || Object.keys(data["Time Series (60min)"]).length === 0) {
      console.warn(`[WARN] Aucune donnée d'historique disponible pour ${symbol}, utilisation d'historique simulé`)
      const simulatedHistory = generateSimulatedHistory(symbol)
      historyCache[cacheKey] = {
        data: simulatedHistory,
        timestamp: now,
      }
      return simulatedHistory
    }

    // Extraire les données pertinentes
    const timeSeries = data["Time Series (60min)"]
    const history = Object.entries(timeSeries)
      .map(([timestamp, values]: [string, any]) => ({
        timestamp,
        price: Number.parseFloat(values["4. close"]),
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    // Mettre en cache les données
    historyCache[cacheKey] = {
      data: history,
      timestamp: now,
    }

    return history
  } catch (error) {
    console.error(`[ERROR] Erreur lors de la récupération de l'historique pour ${symbol}:`, error)

    // En cas d'erreur, générer un historique simulé
    const simulatedHistory = generateSimulatedHistory(symbol)
    historyCache[`history_${symbol}`] = {
      data: simulatedHistory,
      timestamp: Date.now(),
    }

    return simulatedHistory
  }
}

// Fonction pour générer un historique simulé
function generateSimulatedHistory(symbol: string): { timestamp: string; price: number }[] {
  // Récupérer le prix actuel simulé ou réel
  const stockData = stockCache[`stock_${symbol}`]?.data
  const currentPrice = stockData?.currentPrice || 100

  const history = []
  const now = new Date()

  // Générer 30 points de données pour les 30 derniers jours
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Variation aléatoire qui devient plus importante à mesure qu'on s'éloigne dans le passé
    // pour simuler une tendance
    const trend = Math.random() > 0.5 ? 1 : -1
    const volatility = 0.005 + (i / 30) * 0.015 // Plus volatile dans le passé
    const randomVariation = trend * (Math.random() * volatility)

    // Le prix actuel est le point de référence, on calcule les prix passés
    // en appliquant des variations aléatoires
    const priceVariation = 1 - i * 0.005 * trend + randomVariation
    const price = currentPrice * priceVariation

    history.push({
      timestamp: date.toISOString(),
      price: Number.parseFloat(price.toFixed(2)),
    })
  }

  return history
}

export async function getMultipleStocks(symbols: string[]): Promise<StockData[]> {
  const stockPromises = symbols.map((symbol) => getStockQuote(symbol))
  return Promise.all(stockPromises.filter(Boolean)) as Promise<StockData[]>
}
