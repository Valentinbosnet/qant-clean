// Liste des actions populaires
export const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"]

// Version ultra-simplifiée en JavaScript
export function getStockData(symbol) {
  return {
    symbol,
    name: `${symbol} Inc.`,
    currentPrice: 100,
    isSimulated: true,
  }
}

export function getStockQuote(symbol) {
  return {
    symbol,
    name: `${symbol} Inc.`,
    currentPrice: 100,
    isSimulated: true,
  }
}

export function getStockHistory(symbol) {
  return [
    {
      timestamp: "2023-01-01T00:00:00.000Z",
      price: 100,
    },
  ]
}

export function getMultipleStocks(symbols) {
  return symbols.map((symbol) => ({
    symbol,
    name: `${symbol} Inc.`,
    currentPrice: 100,
    isSimulated: true,
  }))
}
