export const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"]

export function getStockQuote(symbol) {
  // Simulate getting a stock quote
  return {
    symbol: symbol,
    name: getStockName(symbol),
    currentPrice: getRandomPrice(100, 500),
  }
}

export function getStockHistory(symbol) {
  // Simulate getting stock history
  const history = []
  const today = new Date()

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    history.push({
      date: date.toISOString().split("T")[0],
      price: getRandomPrice(100, 500),
    })
  }

  return history
}

export function getMultipleStocks(symbols) {
  // Get data for multiple stocks
  return symbols.map((symbol) => ({
    symbol: symbol,
    name: getStockName(symbol),
    currentPrice: getRandomPrice(100, 500),
  }))
}

export function getStockData(symbol) {
  // Get comprehensive stock data
  return {
    symbol: symbol,
    name: getStockName(symbol),
    currentPrice: getRandomPrice(100, 500),
    dayHigh: getRandomPrice(100, 500),
    dayLow: getRandomPrice(100, 500),
    volume: Math.floor(Math.random() * 10000000),
    marketCap: Math.floor(Math.random() * 1000000000000),
  }
}

// Helper functions
function getStockName(symbol) {
  const names = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com, Inc.",
    META: "Meta Platforms, Inc.",
    TSLA: "Tesla, Inc.",
  }

  return names[symbol] || `${symbol} Inc.`
}

function getRandomPrice(min, max) {
  return Number.parseFloat((Math.random() * (max - min) + min).toFixed(2))
}
