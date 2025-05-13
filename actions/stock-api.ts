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
async function getCachedData(key: string): Promise<any | null> {
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
async function setCachedData(key: string, data: any): Promise<void> {
  cache[key] = {
    data,
    timestamp: Date.now(),
  }
}

// Flag to track if we've detected API rate limiting
let isRateLimited = false
let rateLimitDetectedTime = 0
const RATE_LIMIT_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Helper function to check if we're currently rate limited
async function checkRateLimit(): Promise<boolean> {
  if (!isRateLimited) return false

  const now = Date.now()
  if (now - rateLimitDetectedTime > RATE_LIMIT_DURATION) {
    // Rate limit duration has passed, reset the flag
    isRateLimited = false
    return false
  }

  return true
}

// Helper function to set rate limit flag
async function setRateLimit(): Promise<void> {
  isRateLimited = true
  rateLimitDetectedTime = Date.now()
  console.warn("API rate limit detected, switching to fallback mode for 24 hours")
}

// Base API function with caching and rate limit handling
async function fetchFromAPI<T>(endpoint: string, params: Record<string, string>, forceFallback = false): Promise<T> {
  // If we're rate limited or forceFallback is true, immediately return null to trigger fallback
  if ((await checkRateLimit()) || forceFallback) {
    return null as any
  }

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
  const cachedData = await getCachedData(cacheKey)
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

    // Check for rate limit messages
    if (
      (data.Information && data.Information.includes("API rate limit")) ||
      (data.Information && data.Information.includes("API key"))
    ) {
      console.warn(`API rate limit detected for ${params.function}:`, data.Information)
      await setRateLimit() // Set the rate limit flag
      return null as any // Return null to trigger fallback
    }

    // Check for API error messages
    if (data.hasOwnProperty("Error Message")) {
      console.error(`API error for ${params.function}:`, data["Error Message"])
      throw new Error(data["Error Message"])
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
    await setCachedData(cacheKey, data)

    return data as T
  } catch (error) {
    console.error(`Alpha Vantage API error for ${params.function} (${params.symbol || ""}):`, error)

    // If the error message contains rate limit information, set the rate limit flag
    if (
      error instanceof Error &&
      (error.message.includes("API rate limit") ||
        error.message.includes("API key") ||
        error.message.includes("API_INFORMATION"))
    ) {
      await setRateLimit()
    }

    return null as any // Return null to trigger fallback
  }
}

// Helper function to generate mock time series data
async function generateMockTimeSeries(symbol: string, outputSize: string): Promise<AlphaVantageTimeSeries> {
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

// Helper function to generate mock intraday data
async function generateMockIntraday(
  symbol: string,
  interval: string,
  outputSize: string,
): Promise<AlphaVantageIntraday> {
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

// Helper function to generate mock sector performance data
async function generateMockSectorPerformance(): Promise<any> {
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

// Server action to get stock quote
export async function getStockQuote(symbol: string): Promise<AlphaVantageQuote> {
  try {
    const data = await fetchFromAPI<any>("query", {
      function: "GLOBAL_QUOTE",
      symbol,
    })

    // If data is null (due to rate limiting), return a mock response
    if (!data) {
      console.log(`Using mock data for ${symbol} due to rate limiting`)
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

    // Check if the response has the expected structure
    if (!data || !data["Global Quote"] || Object.keys(data["Global Quote"]).length === 0) {
      console.error(`Invalid quote response format for ${symbol}:`, data)
      throw new Error(`Invalid quote data for ${symbol}`)
    }

    return data as AlphaVantageQuote
  } catch (error: any) {
    console.error(`Error in getStockQuote for ${symbol}:`, error)

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

    // If data is null (due to rate limiting), return an empty response
    if (!data) {
      return { bestMatches: [] }
    }

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

    // If data is null (due to rate limiting), return a mock response
    if (!data) {
      return await generateMockTimeSeries(symbol, outputSize)
    }

    // Check if the response has the expected structure
    if (!data || !data["Time Series (Daily)"]) {
      console.error(`Invalid time series response format for ${symbol}:`, data)
      return await generateMockTimeSeries(symbol, outputSize)
    }

    return data as AlphaVantageTimeSeries
  } catch (error) {
    console.error(`Error in getStockTimeSeries for ${symbol}:`, error)
    return await generateMockTimeSeries(symbol, outputSize)
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

    // If data is null (due to rate limiting), return a mock response
    if (!data) {
      return await generateMockIntraday(symbol, interval, outputSize)
    }

    // Check if the response has the expected structure
    if (!data || !data[`Time Series (${interval})`]) {
      console.error(`Invalid intraday response format for ${symbol}:`, data)
      return await generateMockIntraday(symbol, interval, outputSize)
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
    return await generateMockIntraday(symbol, interval, outputSize)
  }
}

// Server action to get company overview
export async function getCompanyOverview(symbol: string): Promise<any> {
  try {
    const data = await fetchFromAPI("query", {
      function: "OVERVIEW",
      symbol,
    })

    // If data is null (due to rate limiting), return a mock response
    if (!data) {
      return {
        Symbol: symbol,
        Name: null,
        Description: "Data not available due to API limitations",
        Sector: "Unknown",
        Industry: "Unknown",
      }
    }

    return data
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
    const data = await fetchFromAPI("query", {
      function: "SECTOR",
    })

    // If data is null (due to rate limiting), return a mock response
    if (!data) {
      return await generateMockSectorPerformance()
    }

    return data
  } catch (error) {
    console.error("Error in getSectorPerformance:", error)
    return await generateMockSectorPerformance()
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
    const data = await fetchFromAPI("query", {
      function: indicator,
      symbol,
      interval,
      time_period: timePeriod.toString(),
    })

    // If data is null (due to rate limiting), return a mock response
    if (!data) {
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

    return data
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

// Function to verify API key status
export async function verifyAlphaVantageApiKey(): Promise<{
  valid: boolean
  message: string
  key?: string
  isPremium?: boolean
  response?: any
}> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY

  if (!apiKey) {
    return {
      valid: false,
      message: "Clé API non définie",
    }
  }

  try {
    // Effectuer une requête simple pour vérifier la validité de la clé
    const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${apiKey}`)

    if (!response.ok) {
      return {
        valid: false,
        message: `Erreur HTTP: ${response.status}`,
        key: apiKey.substring(0, 5) + "...",
      }
    }

    const data = await response.json()

    // Vérifier si la réponse contient un message d'erreur concernant la limite de requêtes
    if (data.Information && data.Information.includes("API key")) {
      return {
        valid: true,
        isPremium: false,
        message: data.Information,
        key: apiKey.substring(0, 5) + "...",
        response: data,
      }
    }

    // Vérifier si la réponse contient les données attendues
    if (data["Global Quote"] && Object.keys(data["Global Quote"]).length > 0) {
      return {
        valid: true,
        isPremium: true,
        message: "Clé API valide et fonctionnelle",
        key: apiKey.substring(0, 5) + "...",
      }
    }

    return {
      valid: false,
      message: "Réponse API inattendue",
      key: apiKey.substring(0, 5) + "...",
      response: data,
    }
  } catch (error) {
    return {
      valid: false,
      message: error instanceof Error ? error.message : "Erreur inconnue",
      key: apiKey.substring(0, 5) + "...",
    }
  }
}

// Function to force reset rate limit status
export async function resetRateLimitStatus(): Promise<boolean> {
  const wasLimited = isRateLimited
  isRateLimited = false
  rateLimitDetectedTime = 0
  return wasLimited
}

// Function to get current rate limit status
export async function getRateLimitStatus(): Promise<{ isLimited: boolean; detectedAt: number; remainingTime: number }> {
  if (!isRateLimited) {
    return { isLimited: false, detectedAt: 0, remainingTime: 0 }
  }

  const now = Date.now()
  const remainingTime = Math.max(0, RATE_LIMIT_DURATION - (now - rateLimitDetectedTime))

  return {
    isLimited: true,
    detectedAt: rateLimitDetectedTime,
    remainingTime,
  }
}
