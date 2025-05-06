module.exports = {
  // Liste des actions populaires
  popularStocks: ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"],

  // Fonction pour obtenir les données d'une action
  getStockData: (symbol) => ({
    symbol: symbol,
    name: symbol + " Inc.",
    price: 100,
    isSimulated: true,
  }),

  // Fonction pour obtenir une cotation d'action
  getStockQuote: (symbol) => ({
    symbol: symbol,
    name: symbol + " Inc.",
    currentPrice: 100,
    isSimulated: true,
  }),

  // Fonction pour obtenir l'historique des prix
  getStockHistory: (symbol) => [{ date: "2023-01-01", price: 100 }],

  // Fonction pour obtenir plusieurs actions
  getMultipleStocks: (symbols) =>
    symbols.map((symbol) => ({
      symbol: symbol,
      name: symbol + " Inc.",
      currentPrice: 100,
      isSimulated: true,
    })),
}
