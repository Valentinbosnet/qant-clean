// Liste des actions populaires
export const popularStocks = [
  "AAPL", // Apple
  "MSFT", // Microsoft
  "GOOGL", // Alphabet (Google)
  "AMZN", // Amazon
  "META", // Meta (Facebook)
  "TSLA", // Tesla
]

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
  isSimulated: boolean
}

// Fonction pour obtenir les données d'une action
export async function getStockData(symbol: string) {
  // Version simplifiée qui retourne des données simulées
  return {
    symbol,
    name: getCompanyName(symbol),
    price: 100,
    previousPrice: 95,
    change: 5,
    changePercent: 5.26,
    history: generateSimpleHistory(),
    isSimulated: true,
  }
}

// Fonction pour obtenir une cotation d'action
export async function getStockQuote(symbol: string): Promise<StockData> {
  // Version simplifiée qui retourne des données simulées
  return {
    symbol,
    name: getCompanyName(symbol),
    currentPrice: 100,
    previousClose: 95,
    change: 5,
    changePercent: 5.26,
    volume: 1000000,
    marketCap: 1000000000,
    peRatio: 20,
    dividend: 1.5,
    volatility: 0.05,
    lastUpdated: new Date(),
    isSimulated: true,
  }
}

// Fonction pour rechercher des actions
export async function searchStocks(query: string) {
  // Version simplifiée qui retourne les actions populaires
  return popularStocks.map((symbol) => ({
    symbol,
    name: getCompanyName(symbol),
  }))
}

// Fonction pour obtenir l'historique des prix
export async function getStockHistory(symbol: string) {
  // Version simplifiée qui retourne un historique simulé
  return generateSimpleHistory()
}

// Fonction pour obtenir plusieurs actions
export async function getMultipleStocks(symbols: string[]): Promise<StockData[]> {
  // Version simplifiée qui retourne des données simulées pour chaque symbole
  return symbols.map((symbol) => ({
    symbol,
    name: getCompanyName(symbol),
    currentPrice: 100,
    previousClose: 95,
    change: 5,
    changePercent: 5.26,
    volume: 1000000,
    marketCap: 1000000000,
    peRatio: 20,
    dividend: 1.5,
    volatility: 0.05,
    lastUpdated: new Date(),
    isSimulated: true,
  }))
}

// Fonction utilitaire pour obtenir le nom d'une entreprise
function getCompanyName(symbol: string) {
  const companies: Record<string, string> = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com, Inc.",
    META: "Meta Platforms, Inc.",
    TSLA: "Tesla, Inc.",
  }

  return companies[symbol.toUpperCase()] || `${symbol.toUpperCase()} Inc.`
}

// Fonction utilitaire pour générer un historique simple
function generateSimpleHistory() {
  const history = []
  const now = new Date()

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    history.push({
      timestamp: date.toISOString(),
      price: 100 - i * 0.5 + Math.random() * 5,
    })
  }

  return history
}
