// Stock service in JavaScript

// Popular stocks
export const popularStocks = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com, Inc." },
  { symbol: "FB", name: "Meta Platforms, Inc." },
]

// Get stock data
export function getStockData(symbol) {
  return {
    symbol,
    name: "Sample Company",
    price: 150.0,
    previousPrice: 145.0,
    change: 5.0,
    percentChange: 3.45,
    history: [140, 142, 145, 143, 147, 150],
    isSimulated: true,
  }
}

// Get stock quote
export function getStockQuote(symbol) {
  return {
    symbol,
    price: 150.0,
    change: 5.0,
    percentChange: 3.45,
  }
}

// Get stock history
export function getStockHistory(symbol) {
  return {
    symbol,
    history: [140, 142, 145, 143, 147, 150],
  }
}

// Get multiple stocks
export function getMultipleStocks(symbols) {
  return symbols.map((symbol) => ({
    symbol,
    price: 150.0,
    change: 5.0,
    percentChange: 3.45,
  }))
}
