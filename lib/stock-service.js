// Liste des actions populaires
export const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"]

// Noms des entreprises correspondant aux symboles
const stockNames = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corporation",
  GOOGL: "Alphabet Inc.",
  AMZN: "Amazon.com, Inc.",
  META: "Meta Platforms, Inc.",
  TSLA: "Tesla, Inc.",
  NVDA: "NVIDIA Corporation",
  JPM: "JPMorgan Chase & Co.",
  NFLX: "Netflix, Inc.",
  DIS: "The Walt Disney Company",
}

/**
 * Génère un prix aléatoire dans une plage donnée
 * @param {number} min - Prix minimum
 * @param {number} max - Prix maximum
 * @returns {number} Prix aléatoire avec 2 décimales
 */
function getRandomPrice(min, max) {
  return Number.parseFloat((Math.random() * (max - min) + min).toFixed(2))
}

/**
 * Génère un pourcentage de changement aléatoire
 * @returns {number} Pourcentage de changement avec 2 décimales
 */
function getRandomChange() {
  return Number.parseFloat((Math.random() * 10 - 5).toFixed(2))
}

/**
 * Obtient les données d'une action
 * @param {string} symbol - Le symbole de l'action
 * @returns {Object} Les données de l'action
 */
export function getStockData(symbol) {
  // Plages de prix pour différentes actions
  const priceRanges = {
    AAPL: { min: 170, max: 190 },
    MSFT: { min: 330, max: 350 },
    GOOGL: { min: 130, max: 150 },
    AMZN: { min: 130, max: 150 },
    META: { min: 300, max: 320 },
    TSLA: { min: 170, max: 190 },
    NVDA: { min: 400, max: 450 },
    JPM: { min: 150, max: 170 },
    NFLX: { min: 550, max: 600 },
    DIS: { min: 90, max: 110 },
  }

  const range = priceRanges[symbol] || { min: 100, max: 200 }
  const price = getRandomPrice(range.min, range.max)
  const change = getRandomChange()

  return {
    symbol,
    name: stockNames[symbol] || `Unknown Stock (${symbol})`,
    price,
    change,
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
  }
}

/**
 * Obtient une cotation d'action
 * @param {string} symbol - Le symbole de l'action
 * @returns {Object} La cotation de l'action
 */
export function getStockQuote(symbol) {
  const stockData = getStockData(symbol)
  return {
    symbol: stockData.symbol,
    price: stockData.price,
    change: stockData.change,
    changePercent: stockData.change,
  }
}

/**
 * Obtient l'historique des prix d'une action
 * @param {string} symbol - Le symbole de l'action
 * @param {number} days - Nombre de jours d'historique
 * @returns {Array} Historique des prix
 */
export function getStockHistory(symbol, days = 30) {
  const history = []
  const today = new Date()
  const stockData = getStockData(symbol)
  let price = stockData.price

  for (let i = days; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Ajouter une variation aléatoire au prix
    const change = getRandomPrice(-5, 5)
    price += change
    if (price < 10) price = 10 // Éviter les prix négatifs ou trop bas

    history.push({
      date: date.toISOString().split("T")[0],
      price: Number(price.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
    })
  }

  return history
}

/**
 * Obtient les données de plusieurs actions
 * @param {Array} symbols - Liste des symboles d'actions
 * @returns {Array} Données des actions
 */
export function getMultipleStocks(symbols) {
  return symbols.map((symbol) => getStockData(symbol))
}
