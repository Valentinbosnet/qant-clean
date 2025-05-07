import { searchStocks as apiSearchStocks } from "../actions/stock-api"

// A more comprehensive list of stocks for search functionality
export interface StockInfo {
  symbol: string
  name: string
  sector?: string
  industry?: string
}

// Fallback stock database for when the API fails or for initial data
export const fallbackStockDatabase: StockInfo[] = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", industry: "Consumer Electronics" },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology", industry: "Software" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology", industry: "Internet Content & Information" },
  { symbol: "AMZN", name: "Amazon.com, Inc.", sector: "Consumer Cyclical", industry: "Internet Retail" },
  { symbol: "META", name: "Meta Platforms, Inc.", sector: "Technology", industry: "Internet Content & Information" },
  { symbol: "TSLA", name: "Tesla, Inc.", sector: "Consumer Cyclical", industry: "Auto Manufacturers" },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technology", industry: "Semiconductors" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Financial Services", industry: "Banks" },
  { symbol: "V", name: "Visa Inc.", sector: "Financial Services", industry: "Credit Services" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", industry: "Drug Manufacturers" },
  { symbol: "WMT", name: "Walmart Inc.", sector: "Consumer Defensive", industry: "Discount Stores" },
  {
    symbol: "PG",
    name: "Procter & Gamble Company",
    sector: "Consumer Defensive",
    industry: "Household & Personal Products",
  },
  { symbol: "MA", name: "Mastercard Incorporated", sector: "Financial Services", industry: "Credit Services" },
  { symbol: "UNH", name: "UnitedHealth Group Incorporated", sector: "Healthcare", industry: "Healthcare Plans" },
  { symbol: "HD", name: "The Home Depot, Inc.", sector: "Consumer Cyclical", industry: "Home Improvement Retail" },
  { symbol: "BAC", name: "Bank of America Corporation", sector: "Financial Services", industry: "Banks" },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare", industry: "Drug Manufacturers" },
  { symbol: "INTC", name: "Intel Corporation", sector: "Technology", industry: "Semiconductors" },
  { symbol: "VZ", name: "Verizon Communications Inc.", sector: "Communication Services", industry: "Telecom Services" },
  { symbol: "CSCO", name: "Cisco Systems, Inc.", sector: "Technology", industry: "Communication Equipment" },
  { symbol: "ADBE", name: "Adobe Inc.", sector: "Technology", industry: "Software" },
  { symbol: "NFLX", name: "Netflix, Inc.", sector: "Communication Services", industry: "Entertainment" },
  { symbol: "DIS", name: "The Walt Disney Company", sector: "Communication Services", industry: "Entertainment" },
  { symbol: "CRM", name: "Salesforce, Inc.", sector: "Technology", industry: "Software" },
  { symbol: "KO", name: "The Coca-Cola Company", sector: "Consumer Defensive", industry: "Beverages" },
  { symbol: "PEP", name: "PepsiCo, Inc.", sector: "Consumer Defensive", industry: "Beverages" },
  { symbol: "CMCSA", name: "Comcast Corporation", sector: "Communication Services", industry: "Entertainment" },
  { symbol: "COST", name: "Costco Wholesale Corporation", sector: "Consumer Defensive", industry: "Discount Stores" },
  { symbol: "ABT", name: "Abbott Laboratories", sector: "Healthcare", industry: "Medical Devices" },
  { symbol: "AVGO", name: "Broadcom Inc.", sector: "Technology", industry: "Semiconductors" },
  { symbol: "TMO", name: "Thermo Fisher Scientific Inc.", sector: "Healthcare", industry: "Diagnostics & Research" },
  { symbol: "ACN", name: "Accenture plc", sector: "Technology", industry: "Information Technology Services" },
  { symbol: "MRK", name: "Merck & Co., Inc.", sector: "Healthcare", industry: "Drug Manufacturers" },
  { symbol: "NKE", name: "NIKE, Inc.", sector: "Consumer Cyclical", industry: "Footwear & Accessories" },
  { symbol: "ORCL", name: "Oracle Corporation", sector: "Technology", industry: "Software" },
  { symbol: "AMD", name: "Advanced Micro Devices, Inc.", sector: "Technology", industry: "Semiconductors" },
  { symbol: "XOM", name: "Exxon Mobil Corporation", sector: "Energy", industry: "Oil & Gas" },
  { symbol: "CVX", name: "Chevron Corporation", sector: "Energy", industry: "Oil & Gas" },
  { symbol: "PYPL", name: "PayPal Holdings, Inc.", sector: "Financial Services", industry: "Credit Services" },
  { symbol: "SBUX", name: "Starbucks Corporation", sector: "Consumer Cyclical", industry: "Restaurants" },
  { symbol: "QCOM", name: "QUALCOMM Incorporated", sector: "Technology", industry: "Semiconductors" },
  { symbol: "TXN", name: "Texas Instruments Incorporated", sector: "Technology", industry: "Semiconductors" },
  {
    symbol: "IBM",
    name: "International Business Machines Corporation",
    sector: "Technology",
    industry: "Information Technology Services",
  },
  { symbol: "AMGN", name: "Amgen Inc.", sector: "Healthcare", industry: "Drug Manufacturers" },
  { symbol: "MDT", name: "Medtronic plc", sector: "Healthcare", industry: "Medical Devices" },
  { symbol: "LLY", name: "Eli Lilly and Company", sector: "Healthcare", industry: "Drug Manufacturers" },
  { symbol: "PM", name: "Philip Morris International Inc.", sector: "Consumer Defensive", industry: "Tobacco" },
  { symbol: "T", name: "AT&T Inc.", sector: "Communication Services", industry: "Telecom Services" },
  { symbol: "TMUS", name: "T-Mobile US, Inc.", sector: "Communication Services", industry: "Telecom Services" },
  { symbol: "MMM", name: "3M Company", sector: "Industrials", industry: "Conglomerates" },
]

// Search function to find stocks by symbol or name using the Alpha Vantage API via server action
export async function searchStocks(query: string): Promise<StockInfo[]> {
  if (!query || query.trim() === "") {
    return []
  }

  try {
    const response = await apiSearchStocks(query)

    if (!response.bestMatches || response.bestMatches.length === 0) {
      return []
    }

    // Transform API response to our StockInfo format
    return response.bestMatches
      .filter((match) => match["3. type"] === "Equity") // Only include stocks
      .map((match) => ({
        symbol: match["1. symbol"],
        name: match["2. name"],
        // API doesn't provide sector/industry, so we leave those undefined
      }))
  } catch (error) {
    console.error("Error searching stocks:", error)

    // Fall back to local search if API fails
    const normalizedQuery = query.toLowerCase().trim()

    return fallbackStockDatabase.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(normalizedQuery) || stock.name.toLowerCase().includes(normalizedQuery),
    )
  }
}
