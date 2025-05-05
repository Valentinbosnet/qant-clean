// Popular stocks list
export const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"]

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

// Voici la fonction manquante getStockData
export async function getStockData(symbol: string) {
  // Générer des données simulées
  const currentPrice = Math.random() * 500 + 100
  const previousClose = currentPrice * (1 + (Math.random() * 0.1 - 0.05))
  const change = currentPrice - previousClose
  const changePercent = (change / previousClose) * 100

  return {
    symbol: symbol.toUpperCase(),
    name: getCompanyName(symbol),
    price: currentPrice,
    previousPrice: previousClose,
    change,
    changePercent,
    history: generatePriceHistory(currentPrice),
    isSimulated: true,
  }
}

// Get stock quote
export async function getStockQuote(symbol: string): Promise<StockData> {
  // Generate simulated stock data
  const currentPrice = Math.random() * 500 + 100
  const previousClose = currentPrice * (1 + (Math.random() * 0.1 - 0.05))
  const change = currentPrice - previousClose
  const changePercent = (change / previousClose) * 100

  return {
    symbol,
    name: getCompanyName(symbol),
    currentPrice,
    previousClose,
    change,
    changePercent,
    volume: Math.floor(Math.random() * 10000000),
    marketCap: Math.floor(Math.random() * 1000000000000),
    peRatio: Math.random() * 30 + 10,
    dividend: Math.random() * 3,
    volatility: Math.abs(change / previousClose),
    lastUpdated: new Date(),
    isSimulated: true,
  }
}

// Search for stocks
export async function searchStocks(query: string): Promise<any[]> {
  // If query is empty, return popular stocks
  if (!query.trim()) {
    return popularStocks.map((symbol) => ({
      symbol,
      name: getCompanyName(symbol),
    }))
  }

  // Filter popular stocks based on query
  const filteredStocks = popularStocks.filter((stock) => stock.toLowerCase().includes(query.toLowerCase()))

  return filteredStocks.map((symbol) => ({
    symbol,
    name: getCompanyName(symbol),
  }))
}

// Generate price history
function generatePriceHistory(currentPrice: number) {
  const history = []
  const now = new Date()
  const volatility = 0.02

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

// Get company name from symbol
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
  }

  return companies[symbol.toUpperCase()] || `${symbol.toUpperCase()} Inc.`
}

// Get stock history
export async function getStockHistory(symbol: string): Promise<{ timestamp: string; price: number }[]> {
  // Generate simulated history
  const stockData = await getStockQuote(symbol)
  const currentPrice = stockData?.currentPrice || 100

  const history = []
  const now = new Date()

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const trend = Math.random() > 0.5 ? 1 : -1
    const volatility = 0.005 + (i / 30) * 0.015
    const randomVariation = trend * (Math.random() * volatility)

    const priceVariation = 1 - i * 0.005 * trend + randomVariation
    const price = currentPrice * priceVariation

    history.push({
      timestamp: date.toISOString(),
      price: Number.parseFloat(price.toFixed(2)),
    })
  }

  return history
}

// Get multiple stocks
export async function getMultipleStocks(symbols: string[]): Promise<StockData[]> {
  const stockPromises = symbols.map((symbol) => getStockQuote(symbol))
  return Promise.all(stockPromises.filter(Boolean)) as Promise<StockData[]>
}
