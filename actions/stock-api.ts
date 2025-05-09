"use server"

// Server-side Alpha Vantage API service
// This keeps the API key secure on the server

// Types for API responses
export interface AlphaVantageQuote {
  "Global Quote": {
    "01. symbol": string
    "02. open": string
    "03. high": string
    "04. low": string
    "05. price": string
    "06. volume": string
    "07. latest trading day": string
    "08. previous close": string
    "09. change": string
    "10. change percent": string
  }
}

export interface AlphaVantageSearch {
  bestMatches: Array<{
    "1. symbol": string
    "2. name": string
    "3. type": string
    "4. region": string
    "5. marketOpen": string
    "6. marketClose": string
    "7. timezone": string
    "8. currency": string
    "9. matchScore": string
  }>
}

export interface AlphaVantageTimeSeries {
  "Meta Data": {
    "1. Information": string
    "2. Symbol": string
    "3. Last Refreshed": string
    "4. Output Size": string
    "5. Time Zone": string
  }
  "Time Series (Daily)": {
    [date: string]: {
      "1. open": string
      "2. high": string
      "3. low": string
      "4. close": string
      "5. volume": string
    }
  }
}

export interface AlphaVantageIntraday {
  "Meta Data": {
    "1. Information": string
    "2. Symbol": string
    "3. Last Refreshed": string
    "4. Interval": string
    "5. Output Size": string
    "6. Time Zone": string
  }
  "Time Series (5min)": {
    [timestamp: string]: {
      "1. open": string
      "2. high": string
      "3. low": string
      "4. close": string
      "5. volume": string
    }
  }
}

// Cache for API responses
interface CacheItem {
  data: any
  timestamp: number
}

const cache: Record<string, CacheItem> = {}
// Premium plan cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

// Helper function to check if cache is valid
function getCachedData(key: string): any | null {
  const item = cache[key]
  if (!item) return null

  const now = Date.now()
  if (now - item.timestamp > CACHE_DURATION) {
    // Cache expired
    delete cache[key]
    return null
  }

  return item.data
}

// Helper function to set cache
function setCachedData(key: string, data: any): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
  }
}

// Base API function with caching
async function fetchFromAPI<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  // Get API key from server environment variable (not exposed to client)
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY

  if (!apiKey) {
    console.error("Alpha Vantage API key is not configured")
    throw new Error("API configuration error")
  }

  // Create URL with parameters
  const url = new URL("https://www.alphavantage.co/query")
  url.searchParams.append("apikey", apiKey)

  // Add all parameters to the URL
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value)
  })

  const cacheKey = url.toString()

  // Check cache first
  const cachedData = getCachedData(cacheKey)
  if (cachedData) {
    return cachedData as T
  }

  try {
    console.log(`Fetching from Alpha Vantage API: ${params.function} for ${params.symbol || "N/A"}`)

    const response = await fetch(url.toString(), {
      // Add a timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      console.error(`API request failed with status ${response.status} for ${params.function}`)
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    // Log the response structure for debugging
    console.log(`API response structure for ${params.function}:`, Object.keys(data))

    // Check for API error messages
    if (data.hasOwnProperty("Error Message")) {
      console.error(`API error for ${params.function}:`, data["Error Message"])
      throw new Error(data["Error Message"])
    }

    // For premium plan, we still want to check for rate limit information but handle it differently
    if (data.hasOwnProperty("Information") && data["Information"].includes("API rate limit")) {
      console.warn(`API rate limit warning for ${params.function}:`, data["Information"])
      // Log the warning but don't throw an error for premium users
      // Instead, we'll continue with the request
    }

    // Check for other information messages that indicate issues
    if (data.hasOwnProperty("Information") && !data["Information"].includes("API rate limit")) {
      console.warn(`API information for ${params.function}:`, data["Information"])
      // Only throw for non-rate limit information messages
      throw new Error("API_INFORMATION: " + data["Information"])
    }

    // With a $50 subscription, we're less concerned about rate limits
    // but we'll still check for the note and log it without throwing an error
    if (data.hasOwnProperty("Note") && data["Note"].includes("API call frequency")) {
      console.warn(`API rate limit warning for ${params.function}:`, data["Note"])
      // For premium users, we'll log but continue with the request
    }

    // Validate that we have the expected data structure
    // This will vary based on the endpoint, so we'll do a basic check
    if (Object.keys(data).length === 0) {
      console.error(`API returned empty response for ${params.function}`)
      throw new Error("API returned empty response")
    }

    // Cache the successful response
    setCachedData(cacheKey, data)

    return data as T
  } catch (error) {
    console.error(`Alpha Vantage API error for ${params.function} (${params.symbol || ""}):`, error)
    throw error
  }
}

// Server action to get stock quote
export async function getStockQuote(symbol: string): Promise<AlphaVantageQuote> {
  try {
    const data = await fetchFromAPI<any>("query", {
      function: "GLOBAL_QUOTE",
      symbol,
    })

    // Check if the response has the expected structure
    if (!data || !data["Global Quote"] || Object.keys(data["Global Quote"]).length === 0) {
      console.error(`Invalid quote response format for ${symbol}:`, data)
      throw new Error(`Invalid quote data for ${symbol}`)
    }

    return data as AlphaVantageQuote
  } catch (error: any) {
    console.error(`Error in getStockQuote for ${symbol}:`, error)

    // Check for rate limit error - but we should rarely hit this with premium plan
    if (error.message === "API_RATE_LIMIT_REACHED" || (error.message && error.message.includes("API_INFORMATION"))) {
      // For premium users, we'll try to continue with cached data if available
      const cachedData = getCachedData(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}`)
      if (cachedData) {
        console.log(`Using cached data for ${symbol} due to API issue`)
        return cachedData as AlphaVantageQuote
      }

      // If no cached data, return a special structure but don't trigger the rate limit UI
      return {
        "Global Quote": {
          "01. symbol": symbol,
          "02. open": "0",
          "03. high": "0",
          "04. low": "0",
          "05. price": "0",
          "06. volume": "0",
          "07. latest trading day": new Date().toISOString().split("T")[0],
          "08. previous close": "0",
          "09. change": "0",
          "10. change percent": "0%",
          // Don't include error: "rate_limit" for premium users
        },
      } as any
    }

    // Return a minimal valid structure to prevent client-side errors
    return {
      "Global Quote": {
        "01. symbol": symbol,
        "02. open": "0",
        "03. high": "0",
        "04. low": "0",
        "05. price": "0",
        "06. volume": "0",
        "07. latest trading day": new Date().toISOString().split("T")[0],
        "08. previous close": "0",
        "09. change": "0",
        "10. change percent": "0%",
      },
    }
  }
}

// Server action to get batch quotes for multiple symbols
export async function getBatchQuotes(symbols: string[]): Promise<any> {
  try {
    // Make parallel requests for each symbol
    const promises = symbols.map((symbol) => getStockQuote(symbol))
    const results = await Promise.all(promises)

    // Format the results into a batch-like response
    const batchResults: any = {}
    results.forEach((result, index) => {
      if (result && result["Global Quote"]) {
        batchResults[symbols[index]] = result["Global Quote"]
      } else {
        console.warn(`Missing Global Quote for ${symbols[index]} in batch results`)
        // Add a placeholder to prevent client-side errors
        batchResults[symbols[index]] = {
          "01. symbol": symbols[index],
          "02. open": "0",
          "03. high": "0",
          "04. low": "0",
          "05. price": "0",
          "06. volume": "0",
          "07. latest trading day": new Date().toISOString().split("T")[0],
          "08. previous close": "0",
          "09. change": "0",
          "10. change percent": "0%",
        }
      }
    })

    return batchResults
  } catch (error) {
    console.error("Error in getBatchQuotes:", error)
    // Return an empty object to prevent client-side errors
    return {}
  }
}

// Server action to search for stocks
export async function searchStocks(keywords: string): Promise<AlphaVantageSearch> {
  try {
    const data = await fetchFromAPI<any>("query", {
      function: "SYMBOL_SEARCH",
      keywords,
    })

    // Check if the response has the expected structure
    if (!data || !data.bestMatches) {
      console.error(`Invalid search response format for "${keywords}":`, data)
      return { bestMatches: [] }
    }

    return data as AlphaVantageSearch
  } catch (error) {
    console.error(`Error in searchStocks for "${keywords}":`, error)
    // Return a minimal valid structure to prevent client-side errors
    return { bestMatches: [] }
  }
}

// Server action to get historical daily time series
export async function getStockTimeSeries(
  symbol: string,
  outputSize: "compact" | "full" = "compact",
): Promise<AlphaVantageTimeSeries> {
  try {
    const data = await fetchFromAPI<any>("query", {
      function: "TIME_SERIES_DAILY",
      symbol,
      outputsize: outputSize,
    })

    // Check if the response has the expected structure
    if (!data || !data["Time Series (Daily)"]) {
      console.error(`Invalid time series response format for ${symbol}:`, data)
      throw new Error(`Invalid time series data for ${symbol}`)
    }

    return data as AlphaVantageTimeSeries
  } catch (error) {
    console.error(`Error in getStockTimeSeries for ${symbol}:`, error)

    // Return a minimal valid structure with mock data to prevent client-side errors
    const today = new Date()
    const mockData: any = {
      "Meta Data": {
        "1. Information": "Mock Daily Time Series",
        "2. Symbol": symbol,
        "3. Last Refreshed": today.toISOString().split("T")[0],
        "4. Output Size": outputSize,
        "5. Time Zone": "US/Eastern",
      },
      "Time Series (Daily)": {},
    }

    // Generate 30 days of mock data
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      // Base price on symbol's first character code for consistency
      const basePrice = 100 + (symbol.charCodeAt(0) % 26) * 10
      const variance = (i % 5) * 2

      mockData["Time Series (Daily)"][dateStr] = {
        "1. open": (basePrice - variance).toFixed(2),
        "2. high": (basePrice + 5).toFixed(2),
        "3. low": (basePrice - 5).toFixed(2),
        "4. close": (basePrice + variance).toFixed(2),
        "5. volume": "1000000",
      }
    }

    return mockData
  }
}

// Server action to get intraday time series
export async function getIntradayData(
  symbol: string,
  interval: "1min" | "5min" | "15min" | "30min" | "60min" = "5min",
  outputSize: "compact" | "full" = "compact",
): Promise<AlphaVantageIntraday> {
  try {
    const data = await fetchFromAPI<any>("query", {
      function: "TIME_SERIES_INTRADAY",
      symbol,
      interval,
      outputsize: outputSize,
    })

    // Check if the response has the expected structure
    if (!data || !data[`Time Series (${interval})`]) {
      console.error(`Invalid intraday response format for ${symbol}:`, data)
      throw new Error(`Invalid intraday data for ${symbol}`)
    }

    return {
      "Meta Data": data["Meta Data"] || {
        "1. Information": "Mock Intraday Data",
        "2. Symbol": symbol,
        "3. Last Refreshed": new Date().toISOString(),
        "4. Interval": interval,
        "5. Output Size": outputSize,
        "6. Time Zone": "US/Eastern",
      },
      "Time Series (5min)": data[`Time Series (${interval})`] || {},
    }
  } catch (error) {
    console.error(`Error in getIntradayData for ${symbol}:`, error)

    // Return a minimal valid structure with mock data to prevent client-side errors
    const now = new Date()
    const mockData: any = {
      "Meta Data": {
        "1. Information": "Mock Intraday Time Series",
        "2. Symbol": symbol,
        "3. Last Refreshed": now.toISOString(),
        "4. Interval": interval,
        "5. Output Size": outputSize,
        "6. Time Zone": "US/Eastern",
      },
      "Time Series (5min)": {},
    }

    // Generate 12 intervals (1 hour) of mock data
    for (let i = 0; i < 12; i++) {
      const timestamp = new Date(now)
      timestamp.setMinutes(now.getMinutes() - i * 5)
      const timestampStr = timestamp.toISOString().replace(/\.\d+Z$/, "")

      // Base price on symbol's first character code for consistency
      const basePrice = 100 + (symbol.charCodeAt(0) % 26) * 10
      const variance = (i % 5) * 0.5

      mockData["Time Series (5min)"][timestampStr] = {
        "1. open": (basePrice - variance).toFixed(2),
        "2. high": (basePrice + 1).toFixed(2),
        "3. low": (basePrice - 1).toFixed(2),
        "4. close": (basePrice + variance).toFixed(2),
        "5. volume": "50000",
      }
    }

    return mockData
  }
}

// Server action to get company overview
export async function getCompanyOverview(symbol: string): Promise<any> {
  try {
    return await fetchFromAPI("query", {
      function: "OVERVIEW",
      symbol,
    })
  } catch (error) {
    console.error(`Error in getCompanyOverview for ${symbol}:`, error)
    // Return a minimal valid structure to prevent client-side errors
    return {
      Symbol: symbol,
      Name: null, // This will trigger the fallback in the client code
      Description: "Data not available",
      Sector: "Unknown",
      Industry: "Unknown",
    }
  }
}

// Server action to get sector performance
export async function getSectorPerformance(): Promise<any> {
  try {
    return await fetchFromAPI("query", {
      function: "SECTOR",
    })
  } catch (error) {
    console.error("Error in getSectorPerformance:", error)
    // Return a minimal valid structure to prevent client-side errors
    return {
      "Meta Data": {
        Information: "Mock Sector Performance",
        "Last Refreshed": new Date().toISOString(),
      },
      "Rank A: Real-Time Performance": {
        Technology: "0.00%",
        "Consumer Cyclical": "0.00%",
        "Financial Services": "0.00%",
        Healthcare: "0.00%",
        "Communication Services": "0.00%",
        Energy: "0.00%",
        Industrials: "0.00%",
        "Consumer Defensive": "0.00%",
        Utilities: "0.00%",
        "Basic Materials": "0.00%",
        "Real Estate": "0.00%",
      },
    }
  }
}

// Server action to get technical indicators
export async function getTechnicalIndicator(
  symbol: string,
  indicator: string,
  interval = "daily",
  timePeriod = 14,
): Promise<any> {
  try {
    return await fetchFromAPI("query", {
      function: indicator,
      symbol,
      interval,
      time_period: timePeriod.toString(),
    })
  } catch (error) {
    console.error(`Error in getTechnicalIndicator (${indicator}) for ${symbol}:`, error)
    // Return a minimal valid structure to prevent client-side errors
    return {
      "Meta Data": {
        "1: Symbol": symbol,
        "2: Indicator": indicator,
        "3: Last Refreshed": new Date().toISOString(),
        "4: Interval": interval,
        "5: Time Period": timePeriod,
      },
      "Technical Analysis": {},
    }
  }
}
