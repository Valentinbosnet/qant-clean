// Define the types for our stock data
export interface StockQuote {
  symbol: string
  price: number
  change: number
  percentChange: number
}

export interface StockHistoryPoint {
  date: string
  price: number
}

export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  percentChange: number
  history: StockHistoryPoint[]
}

// Define our popular stocks
export const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "JPM"]

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
}

// Generate a random stock quote
export function getStockQuote(symbol: string): StockQuote {
  // Simulate API call with random data
  // Use the first character of the symbol to seed some variance
  const seedFactor = symbol.charCodeAt(0) % 10

  return {
    symbol,
    price: Number.parseFloat((Math.random() * 1000 + 50 + seedFactor * 20).toFixed(2)),
    change: Number.parseFloat((Math.random() * 20 - 10).toFixed(2)),
    percentChange: Number.parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
  }
}

// Generate historical stock data
export function getStockHistory(symbol: string, days = 365): StockHistoryPoint[] {
  const history: StockHistoryPoint[] = []
  // Start with a base price that's unique to the symbol
  const basePrice = 100 + (symbol.charCodeAt(0) % 26) * 30
  let price = basePrice
  const today = new Date()

  // Generate more realistic price movements
  for (let i = days; i >= 0; i--) {
    // Add some volatility based on the symbol
    const volatility = ((symbol.charCodeAt(0) % 5) + 1) / 100
    // Random daily change with some momentum
    const change = price * volatility * (Math.random() * 2 - 1)

    price = Math.max(price + change, 10) // Ensure price doesn't go too low

    const date = new Date(today)
    date.setDate(today.getDate() - i)

    history.push({
      date: date.toISOString().split("T")[0],
      price: Number.parseFloat(price.toFixed(2)),
    })
  }

  return history
}

// Get data for multiple stocks
export function getMultipleStocks(symbols: string[]): StockData[] {
  return symbols.map((symbol) => getStockData(symbol))
}

// Get complete stock data
export function getStockData(symbol: string): StockData {
  const quote = getStockQuote(symbol)

  return {
    symbol,
    name: companyNames[symbol] || `Company ${symbol}`,
    price: quote.price,
    change: quote.change,
    percentChange: quote.percentChange,
    history: getStockHistory(symbol),
  }
}
