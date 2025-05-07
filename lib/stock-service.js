// Liste des actions populaires
export const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"]

// Fonction pour obtenir les données d'une action
export function getStockData(symbol) {
  // Simulation de données d'action
  const stockData = {
    symbol: symbol,
    name: getStockName(symbol),
    price: getRandomPrice(100, 1000),
    change: getRandomChange(-5, 5),
    volume: Math.floor(Math.random() * 10000000),
    marketCap: Math.floor(Math.random() * 1000000000000),
    peRatio: getRandomPrice(10, 30),
    dividend: getRandomPrice(0, 3),
    yield: getRandomPrice(0, 5),
    eps: getRandomPrice(1, 15),
  }

  return stockData
}

// Fonction pour obtenir une cotation d'action
export function getStockQuote(symbol) {
  // Simulation de cotation d'action
  const quote = {
    symbol: symbol,
    price: getRandomPrice(100, 1000),
    change: getRandomChange(-5, 5),
    volume: Math.floor(Math.random() * 10000000),
  }

  return quote
}

// Fonction pour obtenir l'historique des prix
export function getStockHistory(symbol) {
  // Simulation d'historique des prix
  const today = new Date()
  const history = []

  for (let i = 30; i >= 0; i--) {
    const date = new Date()
    date.setDate(today.getDate() - i)

    history.push({
      date: date.toISOString().split("T")[0],
      price: getRandomPrice(100, 1000),
      volume: Math.floor(Math.random() * 10000000),
    })
  }

  return history
}

// Fonction pour obtenir plusieurs actions
export function getMultipleStocks(symbols) {
  // Obtention de données pour plusieurs actions
  return symbols.map((symbol) => getStockData(symbol))
}

// Fonction utilitaire pour obtenir un nom d'action à partir d'un symbole
function getStockName(symbol) {
  const stockNames = {
    AAPL: "Apple Inc.",
    MSFT: "Microsoft Corporation",
    GOOGL: "Alphabet Inc.",
    AMZN: "Amazon.com, Inc.",
    META: "Meta Platforms, Inc.",
    TSLA: "Tesla, Inc.",
    NVDA: "NVIDIA Corporation",
    NFLX: "Netflix, Inc.",
    PYPL: "PayPal Holdings, Inc.",
    INTC: "Intel Corporation",
  }

  return stockNames[symbol] || `${symbol} Corp`
}

// Fonction utilitaire pour générer un prix aléatoire
function getRandomPrice(min, max) {
  return Number.parseFloat((Math.random() * (max - min) + min).toFixed(2))
}

// Fonction utilitaire pour générer un changement aléatoire
function getRandomChange(min, max) {
  return Number.parseFloat((Math.random() * (max - min) + min).toFixed(2))
}
