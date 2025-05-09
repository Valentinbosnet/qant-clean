import {
  getStockQuote as getQuoteFromApi,
  getStockTimeSeries,
  getCompanyOverview,
  getIntradayData,
  getBatchQuotes,
} from "../actions/stock-api"
import { getFromCache, saveToCache } from "./cache-utils"
import {
  generateMockStockData,
  generateMockHistory,
  getMockMultipleStocks,
  getMockStockData,
} from "./mock-stock-service"

// Define the types for our stock data
export interface StockQuote {
  symbol: string
  price: number
  change: number
  percentChange: number
}

export interface StockHistoryPoint {
  date: string
  price: number
}

export interface IntradayPoint {
  timestamp: string
  price: number
}

export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  percentChange: number
  history: StockHistoryPoint[]
  intraday?: IntradayPoint[] // Optional intraday data
  cachedAt?: number // Timestamp when the data was cached
}

// Define our popular stocks
export const popularStocks = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "JPM"]

// Company names mapping (fallback if API doesn't return a name)
const companyNames: Record<string, string> = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corporation",
  GOOGL: "Alphabet Inc.",
  AMZN: "Amazon.com, Inc.",
  META: "Meta Platforms, Inc.",
  TSLA: "Tesla, Inc.",
  NVDA: "NVIDIA Corporation",
  JPM: "JPMorgan Chase & Co.",
}

// Cache durations
const QUOTE_CACHE_DURATION = 15 * 60 * 1000 // 15 minutes for quotes
const HISTORY_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours for historical data
const INTRADAY_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes for intraday data
const COMPANY_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days for company info

// Generate fallback stock data
function generateFallbackStockData(symbol: string): StockQuote {
  return {
    symbol,
    ...generateMockStockData(symbol),
  }
}

// Generate fallback historical data
function generateFallbackHistory(symbol: string, days = 365): StockHistoryPoint[] {
  return generateMockHistory(symbol, days)
}

// Get real stock quote from Alpha Vantage via server action
export async function getStockQuote(symbol: string, forceRefresh = false): Promise<StockQuote> {
  // Check cache first if not forcing refresh
  if (!forceRefresh) {
    const cachedQuote = getFromCache<StockQuote>(`quote_${symbol}`)
    if (cachedQuote) {
      return cachedQuote
    }
  }

  try {
    const response = await getQuoteFromApi(symbol)

    // Check if response has the expected structure
    if (!response || !response["Global Quote"]) {
      console.warn(`Missing Global Quote for ${symbol}, using fallback data`)
      return generateFallbackStockData(symbol)
    }

    const quote = response["Global Quote"]

    // Check for rate limit error
    if (quote.hasOwnProperty("error") && quote.error === "rate_limit") {
      // Dispatch a custom event to notify the UI about the rate limit
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("api-rate-limit", {
            detail: { symbol },
          }),
        )
      }
      console.warn(`API rate limit reached for ${symbol}, using fallback data`)

      // Try to get from cache even if expired
      const expiredCache = getFromCache<StockQuote>(`quote_${symbol}_expired`)
      if (expiredCache) {
        return expiredCache
      }

      return generateFallbackStockData(symbol)
    }

    // Check if all required fields are present
    if (!quote["05. price"] || !quote["09. change"] || !quote["10. change percent"]) {
      console.warn(`Incomplete quote data for ${symbol}, using fallback data`)
      return generateFallbackStockData(symbol)
    }

    const price = Number.parseFloat(quote["05. price"])
    const change = Number.parseFloat(quote["09. change"])
    const percentChangeStr = quote["10. change percent"]?.replace("%", "") || "0"
    const percentChange = Number.parseFloat(percentChangeStr)

    // Validate that we have numeric values
    if (isNaN(price) || isNaN(change) || isNaN(percentChange)) {
      console.warn(`Invalid numeric data for ${symbol}, using fallback data`)
      return generateFallbackStockData(symbol)
    }

    const stockQuote = {
      symbol,
      price,
      change,
      percentChange,
    }

    // Save to cache
    saveToCache<StockQuote>(`quote_${symbol}`, stockQuote, QUOTE_CACHE_DURATION)
    // Also save to a longer-term expired cache for fallback
    saveToCache<StockQuote>(`quote_${symbol}_expired`, stockQuote, 7 * 24 * 60 * 60 * 1000)

    return stockQuote
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error)

    // Try to get from cache even if expired
    const expiredCache = getFromCache<StockQuote>(`quote_${symbol}_expired`)
    if (expiredCache) {
      return expiredCache
    }

    return generateFallbackStockData(symbol)
  }
}

// Get historical stock data from Alpha Vantage via server action
export async function getStockHistory(symbol: string, days = 365, forceRefresh = false): Promise<StockHistoryPoint[]> {
  // Check cache first if not forcing refresh
  if (!forceRefresh) {
    const cachedHistory = getFromCache<StockHistoryPoint[]>(`history_${symbol}`)
    if (cachedHistory) {
      return cachedHistory.slice(0, days)
    }
  }

  try {
    // With premium subscription, we can always request full data
    const outputSize = "full"
    const response = await getStockTimeSeries(symbol, outputSize)

    // Check if response has the expected structure
    if (!response || !response["Time Series (Daily)"]) {
      console.warn(`Missing time series data for ${symbol}, using fallback data`)
      return generateFallbackHistory(symbol, days)
    }

    const timeSeries = response["Time Series (Daily)"]

    // Check if timeSeries is an object before using Object.keys
    if (typeof timeSeries !== "object" || timeSeries === null) {
      console.warn(`Time series data for ${symbol} is not an object, using fallback data`)
      return generateFallbackHistory(symbol, days)
    }

    const history: StockHistoryPoint[] = []

    // Convert the time series object to an array and sort by date
    const dates = Object.keys(timeSeries).sort()

    // Check if we have any dates
    if (dates.length === 0) {
      console.warn(`No historical data available for ${symbol}, using fallback data`)
      return generateFallbackHistory(symbol, days)
    }

    // Process all dates for caching
    for (const date of dates) {
      const dataPoint = timeSeries[date]
      if (dataPoint && dataPoint["4. close"]) {
        const price = Number.parseFloat(dataPoint["4. close"])
        if (!isNaN(price)) {
          history.push({
            date,
            price,
          })
        }
      }
    }

    // If we couldn't extract any valid data points, use fallback
    if (history.length === 0) {
      console.warn(`Could not extract valid price data for ${symbol}, using fallback data`)
      return generateFallbackHistory(symbol, days)
    }

    // Save to cache
    saveToCache<StockHistoryPoint[]>(`history_${symbol}`, history, HISTORY_CACHE_DURATION)

    // Return only the requested number of days
    return history.slice(0, days)
  } catch (error) {
    console.error(`Error fetching history for ${symbol}:`, error)

    // Try to get from cache even if expired
    const expiredCache = getFromCache<StockHistoryPoint[]>(`history_${symbol}_expired`)
    if (expiredCache) {
      return expiredCache.slice(0, days)
    }

    return generateFallbackHistory(symbol, days)
  }
}

// Get intraday data via server action
export async function getIntraday(symbol: string, forceRefresh = false): Promise<IntradayPoint[]> {
  // Check cache first if not forcing refresh
  if (!forceRefresh) {
    const cachedIntraday = getFromCache<IntradayPoint[]>(`intraday_${symbol}`)
    if (cachedIntraday) {
      return cachedIntraday
    }
  }

  try {
    const response = await getIntradayData(symbol, "5min", "compact")

    // Check if response has the expected structure
    if (!response || !response["Time Series (5min)"]) {
      console.warn(`Missing intraday data for ${symbol}`)
      return []
    }

    const timeSeries = response["Time Series (5min)"]

    // Check if timeSeries is an object before using Object.keys
    if (typeof timeSeries !== "object" || timeSeries === null) {
      console.warn(`Intraday time series data for ${symbol} is not an object`)
      return []
    }

    const intraday: IntradayPoint[] = []

    // Convert the time series object to an array and sort by timestamp
    const timestamps = Object.keys(timeSeries).sort()

    for (const timestamp of timestamps) {
      const dataPoint = timeSeries[timestamp]
      if (dataPoint && dataPoint["4. close"]) {
        const price = Number.parseFloat(dataPoint["4. close"])
        if (!isNaN(price)) {
          intraday.push({
            timestamp,
            price,
          })
        }
      }
    }

    // Save to cache with shorter duration
    if (intraday.length > 0) {
      saveToCache<IntradayPoint[]>(`intraday_${symbol}`, intraday, INTRADAY_CACHE_DURATION)
    }

    return intraday
  } catch (error) {
    console.error(`Error fetching intraday data for ${symbol}:`, error)

    // Try to get from cache even if expired
    const expiredCache = getFromCache<IntradayPoint[]>(`intraday_${symbol}_expired`)
    if (expiredCache) {
      return expiredCache
    }

    return [] // Return empty array if API fails
  }
}

// Get data for multiple stocks using batch API via server action
export async function getMultipleStocks(symbols: string[], forceRefresh = false): Promise<StockData[]> {
  if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
    console.warn("getMultipleStocks called with invalid symbols:", symbols)
    return []
  }

  console.log("getMultipleStocks called with symbols:", symbols)

  // Check if we have all stocks in cache
  if (!forceRefresh) {
    const cachedStocks = getFromCache<StockData[]>(`multiple_stocks_${symbols.join("_")}`)
    if (cachedStocks) {
      return cachedStocks
    }
  }

  try {
    // For premium subscription, we can use batch requests
    // but we'll still need to fetch history and company info separately

    // Get quotes for all symbols in one batch request
    const batchQuotes = await getBatchQuotes(symbols)

    // Fetch additional data for each symbol in parallel
    const stockDataPromises = symbols.map(async (symbol) => {
      try {
        // Check if we have this stock in cache
        if (!forceRefresh) {
          const cachedStock = getFromCache<StockData>(`stock_${symbol}`)
          if (cachedStock) {
            return cachedStock
          }
        }

        // Check if we have valid batch data for this symbol
        const hasBatchData =
          batchQuotes[symbol] && batchQuotes[symbol]["05. price"] && !isNaN(Number(batchQuotes[symbol]["05. price"]))

        // Get quote from batch results or fallback to individual quote
        const quoteData = hasBatchData
          ? {
              symbol,
              price: Number.parseFloat(batchQuotes[symbol]["05. price"]),
              change: Number.parseFloat(batchQuotes[symbol]["09. change"]),
              percentChange: Number.parseFloat(batchQuotes[symbol]["10. change percent"].replace("%", "")),
            }
          : await getStockQuote(symbol, forceRefresh)

        // Check cache for history and company info to reduce API calls
        let historyData: StockHistoryPoint[] = []
        let intradayData: IntradayPoint[] = []
        let companyData: any = null

        if (!forceRefresh) {
          historyData = getFromCache<StockHistoryPoint[]>(`history_${symbol}`) || []
          intradayData = getFromCache<IntradayPoint[]>(`intraday_${symbol}`) || []
          companyData = getFromCache<any>(`company_${symbol}`)
        }

        // Only fetch what we don't have in cache
        const fetchPromises: Promise<any>[] = []

        if (historyData.length === 0) {
          fetchPromises.push(getStockHistory(symbol, 365, forceRefresh))
        } else {
          fetchPromises.push(Promise.resolve(historyData))
        }

        if (intradayData.length === 0) {
          fetchPromises.push(getIntraday(symbol, forceRefresh).catch(() => []))
        } else {
          fetchPromises.push(Promise.resolve(intradayData))
        }

        if (!companyData) {
          fetchPromises.push(
            getCompanyOverview(symbol)
              .then((data) => {
                if (data && data.Symbol) {
                  saveToCache(`company_${symbol}`, data, COMPANY_CACHE_DURATION)
                }
                return data
              })
              .catch(() => null),
          )
        } else {
          fetchPromises.push(Promise.resolve(companyData))
        }

        // Fetch any missing data in parallel
        const [fetchedHistoryData, fetchedIntradayData, fetchedCompanyData] = await Promise.all(fetchPromises)

        // Use company name from API if available, otherwise use our fallback
        const name = fetchedCompanyData?.Name || companyNames[symbol] || `Company ${symbol}`

        const stockData: StockData = {
          symbol,
          name,
          price: quoteData.price,
          change: quoteData.change,
          percentChange: quoteData.percentChange,
          history: fetchedHistoryData,
          intraday: fetchedIntradayData.length > 0 ? fetchedIntradayData : undefined,
          cachedAt: Date.now(),
        }

        // Cache individual stock data
        saveToCache<StockData>(`stock_${symbol}`, stockData, QUOTE_CACHE_DURATION)

        return stockData
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error)

        // Try to get from cache even if expired
        const expiredCache = getFromCache<StockData>(`stock_${symbol}_expired`)
        if (expiredCache) {
          return expiredCache
        }

        // Return fallback data if API fails for this symbol
        return getMockStockData(symbol)
      }
    })

    const stockData = await Promise.all(stockDataPromises)

    // Cache the complete result
    saveToCache<StockData[]>(`multiple_stocks_${symbols.join("_")}`, stockData, QUOTE_CACHE_DURATION)

    return stockData
  } catch (error) {
    console.error("Error in batch stock data fetch:", error)

    // Try to get from cache even if expired
    const expiredCache = getFromCache<StockData[]>(`multiple_stocks_${symbols.join("_")}_expired`)
    if (expiredCache) {
      return expiredCache
    }

    // Fall back to mock data if batch fails
    return getMockMultipleStocks(symbols)
  }
}

// Get complete stock data
export async function getStockData(symbol: string, forceRefresh = false): Promise<StockData> {
  if (!symbol) {
    console.warn("getStockData called with invalid symbol:", symbol)
    return getMockStockData("AAPL") // Return a default mock stock
  }

  console.log("getStockData called with symbol:", symbol)

  // Check cache first if not forcing refresh
  if (!forceRefresh) {
    const cachedStock = getFromCache<StockData>(`stock_${symbol}`)
    if (cachedStock) {
      return cachedStock
    }
  }

  try {
    // Check what we have in cache to minimize API calls
    let quoteData: StockQuote | null = null
    let historyData: StockHistoryPoint[] = []
    let intradayData: IntradayPoint[] = []
    let companyData: any = null

    if (!forceRefresh) {
      quoteData = getFromCache<StockQuote>(`quote_${symbol}`)
      historyData = getFromCache<StockHistoryPoint[]>(`history_${symbol}`) || []
      intradayData = getFromCache<IntradayPoint[]>(`intraday_${symbol}`) || []
      companyData = getFromCache<any>(`company_${symbol}`)
    }

    // Prepare fetch promises for missing data
    const fetchPromises: Promise<any>[] = []

    if (!quoteData) {
      fetchPromises.push(getStockQuote(symbol, forceRefresh))
    } else {
      fetchPromises.push(Promise.resolve(quoteData))
    }

    if (historyData.length === 0) {
      fetchPromises.push(getStockHistory(symbol, 365, forceRefresh))
    } else {
      fetchPromises.push(Promise.resolve(historyData))
    }

    if (intradayData.length === 0) {
      fetchPromises.push(getIntraday(symbol, forceRefresh).catch(() => []))
    } else {
      fetchPromises.push(Promise.resolve(intradayData))
    }

    if (!companyData) {
      fetchPromises.push(
        getCompanyOverview(symbol)
          .then((data) => {
            if (data && data.Symbol) {
              saveToCache(`company_${symbol}`, data, COMPANY_CACHE_DURATION)
            }
            return data
          })
          .catch(() => null),
      )
    } else {
      fetchPromises.push(Promise.resolve(companyData))
    }

    // Fetch any missing data in parallel
    const [fetchedQuoteData, fetchedHistoryData, fetchedIntradayData, fetchedCompanyData] =
      await Promise.all(fetchPromises)

    // Use company name from API if available, otherwise use our fallback
    const name = fetchedCompanyData?.Name || companyNames[symbol] || `Company ${symbol}`

    const stockData: StockData = {
      symbol,
      name,
      price: fetchedQuoteData.price,
      change: fetchedQuoteData.change,
      percentChange: fetchedQuoteData.percentChange,
      history: fetchedHistoryData,
      intraday: fetchedIntradayData.length > 0 ? fetchedIntradayData : undefined,
      cachedAt: Date.now(),
    }

    // Cache the complete result
    saveToCache<StockData>(`stock_${symbol}`, stockData, QUOTE_CACHE_DURATION)
    // Also save to a longer-term expired cache for fallback
    saveToCache<StockData>(`stock_${symbol}_expired`, stockData, 7 * 24 * 60 * 60 * 1000)

    return stockData
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error)

    // Try to get from cache even if expired
    const expiredCache = getFromCache<StockData>(`stock_${symbol}_expired`)
    if (expiredCache) {
      return expiredCache
    }

    // Return fallback data if API fails completely
    return getMockStockData(symbol)
  }
}

// Clear all stock caches
export function clearStockCache(): void {
  if (typeof window !== "undefined") {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("stock_cache_")) {
        localStorage.removeItem(key)
      }
    })
    console.log("Stock cache cleared")
  }
}

// Force refresh a specific stock
export function forceRefreshStock(symbol: string): void {
  if (typeof window !== "undefined") {
    Object.keys(localStorage).forEach((key) => {
      if (key.includes(`_${symbol}`) && key.startsWith("stock_cache_")) {
        localStorage.removeItem(key)
      }
    })
    console.log(`Cache cleared for ${symbol}`)
  }
}

import { getCacheStats as getCacheStatistics } from "./cache-utils"

export const getCacheStats = getCacheStatistics

/**
 * Interface pour les données fondamentales d'une entreprise
 */
export interface CompanyFundamentals {
  symbol: string
  name: string
  sector: string
  industry: string
  marketCap: number
  peRatio: number
  eps: number
  dividendYield: number
  beta: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  profitMargin: number
  revenueGrowth: number
  debtToEquity: number
  returnOnEquity: number
  priceToBook: number
  priceToSales: number
  analystRating?: string
  analystTargetPrice?: number
}

/**
 * Récupère les données fondamentales d'une entreprise
 * @param symbol Symbole de l'action
 */
export async function getCompanyFundamentals(symbol: string): Promise<CompanyFundamentals | null> {
  try {
    // Vérifier le cache d'abord
    const cacheKey = `fundamentals_${symbol}`
    const cachedData = getFromCache<CompanyFundamentals>(cacheKey)
    if (cachedData) {
      return cachedData
    }

    // Récupérer les données de l'entreprise via l'API Alpha Vantage
    const companyData = await getCompanyOverview(symbol)

    if (!companyData || !companyData.Symbol) {
      console.warn(`Données fondamentales non disponibles pour ${symbol}`)
      return null
    }

    // Convertir les données en format standardisé
    const fundamentals: CompanyFundamentals = {
      symbol: companyData.Symbol,
      name: companyData.Name || companyNames[symbol] || `Company ${symbol}`,
      sector: companyData.Sector || "Unknown",
      industry: companyData.Industry || "Unknown",
      marketCap: Number.parseFloat(companyData.MarketCapitalization) || 0,
      peRatio: Number.parseFloat(companyData.PERatio) || 0,
      eps: Number.parseFloat(companyData.EPS) || 0,
      dividendYield: Number.parseFloat(companyData.DividendYield) || 0,
      beta: Number.parseFloat(companyData.Beta) || 1,
      fiftyTwoWeekHigh: Number.parseFloat(companyData["52WeekHigh"]) || 0,
      fiftyTwoWeekLow: Number.parseFloat(companyData["52WeekLow"]) || 0,
      profitMargin: Number.parseFloat(companyData.ProfitMargin) || 0,
      revenueGrowth: Number.parseFloat(companyData.QuarterlyRevenueGrowthYOY) || 0,
      debtToEquity: Number.parseFloat(companyData.DebtToEquity) || 0,
      returnOnEquity: Number.parseFloat(companyData.ReturnOnEquityTTM) || 0,
      priceToBook: Number.parseFloat(companyData.PriceToBookRatio) || 0,
      priceToSales: Number.parseFloat(companyData.PriceToSalesRatioTTM) || 0,
      analystRating: companyData.AnalystRating,
      analystTargetPrice: Number.parseFloat(companyData.AnalystTargetPrice) || undefined,
    }

    // Sauvegarder dans le cache
    saveToCache<CompanyFundamentals>(cacheKey, fundamentals, COMPANY_CACHE_DURATION)

    return fundamentals
  } catch (error) {
    console.error(`Erreur lors de la récupération des données fondamentales pour ${symbol}:`, error)
    return null
  }
}
