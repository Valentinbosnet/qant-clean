// Liste des actions populaires
export const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"]

// Version ultra-simplifiée en JavaScript
export async function getStockData(symbol) {
  return {
    symbol,
    name: `${symbol} Inc.`,
    price: 100,
    isSimulated: true,
  }
}

export async function getStockQuote(symbol) {
  return {
    symbol,
    name: `${symbol} Inc.`,
    currentPrice: 100,
    isSimulated: true,
  }
}

export async function getStockHistory(symbol) {
  return [
    {
      timestamp: "2023-01-01T00:00:00.000Z",
      price: 100,
    },
  ]
}

export async function getMultipleStocks(symbols) {
  return symbols.map((symbol) => ({
    symbol,
    name: `${symbol} Inc.`,
    currentPrice: 100,
    isSimulated: true,
  }))
}
