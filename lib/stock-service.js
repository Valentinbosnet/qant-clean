export const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"]

/**
 * @typedef {Object} StockData
 * @property {string} symbol
 * @property {string} name
 * @property {number} currentPrice
 */

/**
 * Obtient les données d'une action
 * @param {string} symbol - Le symbole de l'action
 * @returns {StockData} Les données de l'action
 */
export function getStockData(symbol) {
  return {
    symbol: symbol,
    name: getStockName(symbol),
    currentPrice: getRandomPrice(100, 500),
    isSimulated: true,
  }
}

/**
 * Obtient une cotation d'action
 * @param {string} symbol - Le symbole de l'action
 * @returns {StockData} La cotation de l'action
 */
export function getStockQuote(symbol) {
  return {
    symbol: symbol,
    name: getStockName(symbol),
    currentPrice: getRandomPrice(100, 500),
    isSimulated: true,
  }
}

/**
 * Obtient l'historique des prix d'une action
 * @param {string} symbol - Le symbole de l'action
 * @returns {Array<Object>} L'historique des prix
 */
export function getStockHistory(symbol) {
  const history = []
  const today = new Date()

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    history.push({
      timestamp: date.toISOString().split("T")[0],
      price: getRandomPrice(100, 500),
    })
  }

  return history
}

/**
 * Obtient les données de plusieurs actions
 * @param {string[]} symbols - Les symboles des actions
 * @returns {Array<StockData>} Les données des actions
 */
export function getMultipleStocks(symbols) {
  return symbols.map((symbol) => ({
    symbol: symbol,
    name: getStockName(symbol),
    currentPrice: getRandomPrice(100, 500),
    isSimulated: true,
  }))
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
