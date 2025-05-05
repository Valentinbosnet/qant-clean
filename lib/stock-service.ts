// Version ultra-minimaliste
export const popularStocks = ["AAPL", "MSFT", "GOOGL"]

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

export async function getStockData(symbol: string) {
  return {
    symbol,
    name: `${symbol} Inc.`,
    price: 100,
    isSimulated: true,
  }
}

export async function getStockQuote(symbol: string) {
  return {
    symbol,
    name: `${symbol} Inc.`,
    currentPrice: 100,
    lastUpdated: new Date(),
    isSimulated: true,
  }
}

export async function searchStocks(query: string) {
  return popularStocks.map((symbol) => ({
    symbol,
    name: `${symbol} Inc.`,
  }))
}

export async function getStockHistory() {
  return [{ timestamp: new Date().toISOString(), price: 100 }]
}

export async function getMultipleStocks(symbols: string[]) {
  return symbols.map((symbol) => ({
    symbol,
    name: `${symbol} Inc.`,
    currentPrice: 100,
    lastUpdated: new Date(),
    isSimulated: true,
  }))
}
