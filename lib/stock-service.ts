export const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"]

export interface StockData {
  symbol: string
  name: string
  currentPrice: number
  previousPrice: number
  change: number
  changePercent: number
  lastUpdated: string
}

export function getStockQuote(symbol: string): Promise<StockData | null> {
  return Promise.resolve({
    symbol: symbol,
    name: symbol + " Inc.",
    currentPrice: 150,
    previousPrice: 140,
    change: 10,
    changePercent: 0.05,
    lastUpdated: new Date().toISOString(),
  })
}

export async function getStockHistory(symbol: string): Promise<{ timestamp: string; price: number }[]> {
  const now = new Date()
  const history = []

  for (let i = 0; i < 30; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const price = 100 + Math.random() * 10
    history.push({ timestamp: date.toISOString(), price })
  }

  return Promise.resolve(history)
}

export async function getMultipleStocks(symbols: string[]): Promise<StockData[]> {
  return symbols.map((symbol) => ({
    symbol: symbol,
    name: symbol + " Inc.",
    currentPrice: 100 + Math.random() * 10,
    previousPrice: 90 + Math.random() * 10,
    change: Math.random() * 5,
    changePercent: Math.random() * 0.05,
    lastUpdated: new Date().toISOString(),
  }))
}

export function getStockData(symbol: string): Promise<StockData | null> {
  return Promise.resolve({
    symbol: symbol,
    name: symbol + " Inc.",
    currentPrice: 100,
    previousPrice: 90,
    change: 10,
    changePercent: 0.1,
    lastUpdated: new Date().toISOString(),
  })
}
