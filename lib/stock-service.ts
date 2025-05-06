// Liste des actions populaires
export const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"]

// Interface pour les données boursières
export interface StockData {
  symbol: string
  name: string
  currentPrice: number
}

// Fonction pour obtenir les données d'une action
export function getStockData(symbol: string) {
  return {
    symbol,
    name: symbol + " Inc.",
    price: 100,
  }
}

// Fonction pour obtenir une cotation d'action
export function getStockQuote(symbol: string) {
  return {
    symbol,
    name: symbol + " Inc.",
    currentPrice: 100,
  }
}

// Fonction pour obtenir l'historique des prix
export function getStockHistory(symbol: string) {
  return [{ date: "2023-01-01", price: 100 }]
}

// Fonction pour obtenir plusieurs actions
export function getMultipleStocks(symbols: string[]) {
  return symbols.map((symbol) => ({
    symbol,
    name: symbol + " Inc.",
    currentPrice: 100,
  }))
}

// Réexporter depuis le service from '../services/stockService'
