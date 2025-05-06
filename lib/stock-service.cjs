// Liste des actions populaires
const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA"];

// Fonction pour obtenir les données d'une action
function getStockData(symbol) {
  return {
    symbol,
    name: symbol + " Inc.",
    price: 100
  };
}

// Fonction pour obtenir une cotation d'action
function getStockQuote(symbol) {
  return {
    symbol,
    name: symbol + " Inc.",
    currentPrice: 100
  };
}

// Fonction pour obtenir l'historique des prix
function getStockHistory(symbol) {
  return [
    { date: "2023-01-01", price: 100 }
  ];
}

// Fonction pour obtenir plusieurs actions
function getMultipleStocks(symbols) {
  return symbols.map(symbol => ({
    symbol,
    name: symbol + " Inc.",
    currentPrice: 100
  }));
}

module.exports = {
  popularStocks,
  getStockData,
  getStockQuote,
  getStockHistory,
  getMultipleStocks
};
