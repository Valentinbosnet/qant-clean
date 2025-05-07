// Stock service functions
export const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"]

export function getStockQuote(symbol) {
  // Simulate API call with random data
  return {
    symbol: symbol,
    price: Number.parseFloat((Math.random() * 1000 + 50).toFixed(2)),
    change: Number.parseFloat((Math.random() * 20 - 10).toFixed(2)),
    percentChange: Number.parseFloat((Math.random() * 5 - 2.5).toFixed(2)),
  }
}

export function getStockHistory(symbol) {
  // Simulate historical data
  const days = 30
  const history = []
  let price = Math.random() * 1000 + 100

  for (let i = 0; i < days; i++) {
    price = price + (Math.random() * 20 - 10)
    history.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      price: Number.parseFloat(price.toFixed(2)),
    })
  }

  return history
}

export function getMultipleStocks(symbols) {
  return symbols.map((symbol) => getStockData(symbol))
}

export function getStockData(symbol) {
  // Map company names to symbols
  const companyNames = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com, Inc.",
    META: "Meta Platforms, Inc.",
    TSLA: "Tesla, Inc.",
  }

  const quote = getStockQuote(symbol)

  return {
    symbol: symbol,
    name: companyNames[symbol] || `Company ${symbol}`,
    price: quote.price,
    change: quote.change,
    percentChange: quote.percentChange,
    history: getStockHistory(symbol),
  }
}
