interface SimulatedDataOptions {
  basedOnReal?: boolean
  volatility?: number
  trend?: "bullish" | "bearish" | "neutral"
  symbol: string
}

/**
 * Generate high-quality simulated stock data when API limits are reached
 */
export function generateEnhancedSimulatedData(options: SimulatedDataOptions) {
  const {
    basedOnReal = false,
    volatility = 0.02,
    trend = Math.random() > 0.6 ? "bullish" : Math.random() > 0.5 ? "bearish" : "neutral",
    symbol,
  } = options

  // Common stock price ranges for realistic simulation
  const priceRangesBySymbol: { [key: string]: [number, number] } = {
    AAPL: [150, 200],
    MSFT: [300, 380],
    GOOGL: [120, 150],
    AMZN: [130, 170],
    META: [260, 330],
    TSLA: [180, 240],
    NVDA: [700, 950],
    JPM: [160, 200],
    V: [230, 270],
    WMT: [55, 65],
    DEFAULT: [50, 200],
  }

  // Get a realistic price range for the symbol
  const [minPrice, maxPrice] = priceRangesBySymbol[symbol] || priceRangesBySymbol.DEFAULT

  // Generate a realistic base price
  const basePrice = minPrice + Math.random() * (maxPrice - minPrice)

  // Generate change based on trend
  let changeDirection = 0
  if (trend === "bullish") changeDirection = 0.5 + Math.random() * 0.5
  else if (trend === "bearish") changeDirection = -0.5 - Math.random() * 0.5
  else changeDirection = -0.3 + Math.random() * 0.6

  const change = basePrice * volatility * changeDirection
  const changePercent = (change / basePrice) * 100

  // Create realistic volume
  const volume = Math.floor(1000000 + Math.random() * 20000000)

  // Generate simulated data
  return {
    symbol,
    price: Number.parseFloat(basePrice.toFixed(2)),
    change: Number.parseFloat(change.toFixed(2)),
    changePercent: Number.parseFloat(changePercent.toFixed(2)),
    volume,
    timestamp: new Date().toISOString(),
    simulationQuality: basedOnReal ? "enhanced" : "basic",
    isSimulated: true,
  }
}

/**
 * Cache simulated data to avoid generating completely different data on each request
 */
const simulationCache = new Map<string, { data: any; timestamp: number }>()

/**
 * Get or generate simulated data with caching support
 */
export function getSimulatedData(symbol: string, forceRefresh = false) {
  const cacheKey = `sim_${symbol}`
  const now = Date.now()
  const cached = simulationCache.get(cacheKey)

  // Return cached data if it's less than 15 minutes old and we're not forcing a refresh
  if (!forceRefresh && cached && now - cached.timestamp < 15 * 60 * 1000) {
    return {
      ...cached.data,
      fromCache: true,
    }
  }

  // Generate new data
  const data = generateEnhancedSimulatedData({ symbol })

  // Cache it
  simulationCache.set(cacheKey, {
    data,
    timestamp: now,
  })

  return data
}
