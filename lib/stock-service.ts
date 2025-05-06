// Liste des actions populaires
export const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"]

// Interface pour les données boursières
export interface StockData {
  symbol: string
  name: string
  currentPrice: number
  lastUpdated: Date
  isSimulated: boolean
}

// Fonction pour obtenir les données d'une action
export function getStockData(symbol: string) {
  return {
    symbol,
    name: `${symbol} Inc.`,
    price: 100,
    isSimulated: true,
  }
}

// Fonction pour obtenir une cotation d'action
export function getStockQuote(symbol: string): StockData {
  return {
    symbol,
    name: `${symbol} Inc.`,
    currentPrice: 100,
    lastUpdated: new Date(),
    isSimulated: true,
  }
}

// Fonction pour obtenir l'historique des prix
export function getStockHistory(symbol: string) {
  return [{ timestamp: new Date().toISOString(), price: 100 }]
}

// Fonction pour obtenir plusieurs actions
export function getMultipleStocks(symbols: string[]): StockData[] {
  return symbols.map((symbol) => ({
    symbol,
    name: `${symbol} Inc.`,
    currentPrice: 100,
    lastUpdated: new Date(),
    isSimulated: true,
  }))
}
