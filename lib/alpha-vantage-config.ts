// Configuration d'Alpha Vantage pour clé premium
export const ALPHA_VANTAGE_CONFIG = {
  // Votre niveau de service premium
  PREMIUM_TIER: "PREMIUM", // Options: "FREE", "PREMIUM", "ENTERPRISE"

  // Limites de la clé API premium (ajustez selon votre forfait exact)
  API_LIMITS: {
    CALLS_PER_MINUTE: 6, // Exemple pour premium, ajustez selon votre forfait
    CALLS_PER_DAY: 5000, // Exemple pour premium, ajustez selon votre forfait
    CONCURRENT_REQUESTS: 5, // Nombre de requêtes simultanées recommandé
  },

  // Paramètres de cache
  CACHE: {
    STOCK_DATA_TTL: 5 * 60 * 1000, // 5 minutes pour les données de base
    TECHNICAL_DATA_TTL: 15 * 60 * 1000, // 15 minutes pour les indicateurs techniques
    HISTORICAL_DATA_TTL: 60 * 60 * 1000, // 1 heure pour les données historiques
  },

  // Endpoints API les plus utilisés
  ENDPOINTS: {
    GLOBAL_QUOTE: "GLOBAL_QUOTE",
    SYMBOL_SEARCH: "SYMBOL_SEARCH",
    TIME_SERIES_INTRADAY: "TIME_SERIES_INTRADAY",
    TIME_SERIES_DAILY: "TIME_SERIES_DAILY",
    SMA: "SMA",
    EMA: "EMA",
    RSI: "RSI",
    MACD: "MACD",
    BBANDS: "BBANDS",
    VWAP: "VWAP",
  },

  // Options de sortie
  OUTPUT_SIZE: {
    COMPACT: "compact", // 100 derniers points de données
    FULL: "full", // Toutes les données disponibles (avec premium)
  },

  // Intervalles de temps disponibles (plus nombreux avec premium)
  INTERVALS: {
    ONE_MIN: "1min",
    FIVE_MIN: "5min",
    FIFTEEN_MIN: "15min",
    THIRTY_MIN: "30min",
    SIXTY_MIN: "60min",
    DAILY: "daily",
    WEEKLY: "weekly",
    MONTHLY: "monthly",
  },
}
