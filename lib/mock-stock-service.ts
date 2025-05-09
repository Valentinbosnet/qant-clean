import type { StockData, StockHistoryPoint, IntradayPoint } from "./stock-service"

// Company names mapping
const companyNames: Record<string, string> = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corporation",
  GOOGL: "Alphabet Inc.",
  AMZN: "Amazon.com, Inc.",
  META: "Meta Platforms, Inc.",
  TSLA: "Tesla, Inc.",
  NVDA: "NVIDIA Corporation",
  JPM: "JPMorgan Chase & Co.",
  // Ajoutez d'autres symboles au besoin
}

// Generate mock stock data
export function generateMockStockData(symbol: string): StockData {
  // Use the symbol's character code to generate consistent random values
  const seed = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const rand = (min: number, max: number) => {
    const x = Math.sin(seed) * 10000
    const r = x - Math.floor(x)
    return min + r * (max - min)
  }

  const price = rand(50, 1000)
  const change = rand(-10, 10)
  const percentChange = rand(-2.5, 2.5)

  return {
    symbol,
    name: companyNames[symbol] || `Company ${symbol}`,
    price,
    change,
    percentChange,
    history: generateMockHistory(symbol),
    cachedAt: Date.now(),
  }
}

// Generate mock historical data
export function generateMockHistory(symbol: string, days = 365): StockHistoryPoint[] {
  const history: StockHistoryPoint[] = []
  const today = new Date()

  // Use the symbol to generate a consistent starting price
  let price = 100 + (symbol.charCodeAt(0) % 26) * 30

  for (let i = days; i >= 0; i--) {
    const volatility = ((symbol.charCodeAt(0) % 5) + 1) / 100
    const change = price * volatility * (Math.random() * 2 - 1)

    price = Math.max(price + change, 10)

    const date = new Date(today)
    date.setDate(today.getDate() - i)

    history.push({
      date: date.toISOString().split("T")[0],
      price: Number.parseFloat(price.toFixed(2)),
    })
  }

  return history
}

// Generate mock intraday data
export function generateMockIntraday(symbol: string): IntradayPoint[] {
  const intraday: IntradayPoint[] = []
  const now = new Date()

  // Start 24 hours ago
  const startTime = new Date(now)
  startTime.setHours(now.getHours() - 24)

  // Use the symbol to generate a consistent starting price
  let price = 100 + (symbol.charCodeAt(0) % 26) * 30

  // Generate data points every 5 minutes
  for (let i = 0; i < 288; i++) {
    // 24 hours * 12 (5-minute intervals)
    const timestamp = new Date(startTime)
    timestamp.setMinutes(timestamp.getMinutes() + i * 5)

    const volatility = ((symbol.charCodeAt(0) % 5) + 1) / 100
    const change = price * volatility * (Math.random() * 2 - 1)

    price = Math.max(price + change, 10)

    intraday.push({
      timestamp: timestamp.toISOString(),
      price: Number.parseFloat(price.toFixed(2)),
    })
  }

  return intraday
}

// Get mock data for multiple stocks
export function getMockMultipleStocks(symbols: string[]): StockData[] {
  return symbols.map((symbol) => generateMockStockData(symbol))
}

// Get mock stock data
export function getMockStockData(symbol: string): StockData {
  return generateMockStockData(symbol)
}
