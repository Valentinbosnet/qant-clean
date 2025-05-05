import { createClient } from "@supabase/supabase-js"
import { type Portfolio, type PortfolioStock, TABLES } from "./db/schema"

// Create a Supabase client
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function getUserPortfolios(userId: string): Promise<Portfolio[]> {
  const { data, error } = await supabase.from(TABLES.PORTFOLIOS).select("*").eq("user_id", userId)

  if (error) {
    console.error("Error fetching portfolios:", error)
    throw new Error("Failed to fetch portfolios")
  }

  return data as Portfolio[]
}

export async function getPortfolioById(id: string): Promise<Portfolio | null> {
  const { data, error } = await supabase.from(TABLES.PORTFOLIOS).select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching portfolio:", error)
    return null
  }

  return data as Portfolio
}

export async function getPortfolioStocks(portfolioId: string): Promise<PortfolioStock[]> {
  const { data, error } = await supabase.from(TABLES.PORTFOLIO_STOCKS).select("*").eq("portfolio_id", portfolioId)

  if (error) {
    console.error("Error fetching portfolio stocks:", error)
    throw new Error("Failed to fetch portfolio stocks")
  }

  return data as PortfolioStock[]
}

export async function calculatePortfolioRisk(portfolioId: string): Promise<{
  diversificationScore: number
  volatilityScore: number
  overallRiskScore: number
}> {
  // Get portfolio stocks
  const stocks = await getPortfolioStocks(portfolioId)

  if (!stocks || stocks.length === 0) {
    return {
      diversificationScore: 0,
      volatilityScore: 0,
      overallRiskScore: 0,
    }
  }

  // Calculate diversification (higher is better)
  const diversificationScore = Math.min(stocks.length * 10, 100)

  // For this example, we'll use a simplified volatility calculation
  // In a real system, you would fetch actual volatility data for these stocks
  const volatilityScore = 50 // Moderate volatility (0-100 scale)

  // Calculate overall risk (lower is better - less risky)
  const overallRiskScore = 100 - (diversificationScore * 0.6 + (100 - volatilityScore) * 0.4)

  return {
    diversificationScore,
    volatilityScore,
    overallRiskScore: Math.round(overallRiskScore),
  }
}

export async function createPortfolio(userId: string, name: string, description?: string): Promise<Portfolio> {
  const newPortfolio = {
    user_id: userId,
    name,
    description,
    is_public: false,
    total_value: 0,
    cash_balance: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from(TABLES.PORTFOLIOS).insert(newPortfolio).select("*").single()

  if (error) {
    console.error("Error creating portfolio:", error)
    throw new Error("Failed to create portfolio")
  }

  return data as Portfolio
}

export async function addStockToPortfolio(
  portfolioId: string,
  symbol: string,
  quantity: number,
  purchasePrice: number,
): Promise<PortfolioStock> {
  const newStock = {
    portfolio_id: portfolioId,
    symbol,
    quantity,
    average_purchase_price: purchasePrice,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from(TABLES.PORTFOLIO_STOCKS).insert(newStock).select("*").single()

  if (error) {
    console.error("Error adding stock to portfolio:", error)
    throw new Error("Failed to add stock to portfolio")
  }

  // Update portfolio total value
  await updatePortfolioValue(portfolioId)

  return data as PortfolioStock
}

async function updatePortfolioValue(portfolioId: string): Promise<void> {
  // In a real application, you would:
  // 1. Get all stocks in the portfolio
  // 2. Fetch current market prices
  // 3. Calculate total value
  // 4. Update the portfolio record

  const { data: portfolio } = await supabase.from(TABLES.PORTFOLIOS).select("*").eq("id", portfolioId).single()

  if (!portfolio) return

  const { data: stocks } = await supabase.from(TABLES.PORTFOLIO_STOCKS).select("*").eq("portfolio_id", portfolioId)

  if (!stocks) return

  let totalValue = portfolio.cash_balance || 0

  // In a real app, you would fetch current prices from an API
  // For now, we'll use the average purchase price as the current price
  for (const stock of stocks) {
    totalValue += stock.quantity * stock.average_purchase_price
  }

  await supabase
    .from(TABLES.PORTFOLIOS)
    .update({
      total_value: totalValue,
      updated_at: new Date().toISOString(),
    })
    .eq("id", portfolioId)
}
