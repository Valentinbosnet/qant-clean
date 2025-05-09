// Configuration pour l'API Alpha Vantage
export const API_CONFIG = {
  // L'utilisateur a un plan premium à 50$
  PREMIUM_PLAN: true,

  // Limites du plan premium
  PREMIUM_RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 150,
    REQUESTS_PER_DAY: 5000,
  },

  // Durée du cache pour le plan premium (5 minutes)
  CACHE_DURATION: 5 * 60 * 1000,

  // Endpoints disponibles avec le plan premium
  PREMIUM_ENDPOINTS: [
    "TIME_SERIES_INTRADAY",
    "TIME_SERIES_DAILY",
    "TIME_SERIES_WEEKLY",
    "TIME_SERIES_MONTHLY",
    "GLOBAL_QUOTE",
    "SYMBOL_SEARCH",
    "OVERVIEW",
    "INCOME_STATEMENT",
    "BALANCE_SHEET",
    "CASH_FLOW",
    "EARNINGS",
    "SECTOR",
    "TECHNICAL_INDICATORS",
  ],
}
