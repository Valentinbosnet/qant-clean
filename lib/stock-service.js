export const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"]

export interface StockData {
  symbol: string
  name: string
  currentPrice: number
}

export function getStockQuote(symbol: string): StockData {
  return {
    symbol: symbol,
    name: symbol + " Inc.",
    currentPrice: 100,
  }
}

export function getStockHistory(symbol: string) {
  return [{ date: "2023-01-01", price: 100 }]
}

export function getMultipleStocks(symbols: string[]): StockData[] {
  return symbols.map((symbol) => ({
    symbol: symbol,
    name: symbol + " Inc.",
    currentPrice: 100,
  }))
}

export function getStockData(symbol: string): StockData {
  return {
    symbol: symbol,
    name: symbol + " Inc.",
    currentPrice: 100,
  }
}
