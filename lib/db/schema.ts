// Replace Drizzle ORM schema with direct Supabase types

export type User = {
  id: string
  email: string
  name?: string
  password_hash?: string
  created_at: string
  updated_at: string
  email_verified: boolean
  is_admin: boolean
  subscription_tier: "free" | "premium" | "pro"
  subscription_status: "active" | "inactive" | "trial"
  subscription_end_date?: string
  onboarding_completed: boolean
  api_quota: number
  api_usage: number
}

export type Portfolio = {
  id: string
  user_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  is_public: boolean
  total_value: number
  cash_balance: number
}

export type PortfolioStock = {
  id: string
  portfolio_id: string
  symbol: string
  quantity: number
  average_purchase_price: number
  created_at: string
  updated_at: string
}

export type Transaction = {
  id: string
  portfolio_id: string
  symbol: string
  transaction_type: "buy" | "sell"
  quantity: number
  price: number
  transaction_date: string
  created_at: string
  updated_at: string
}

export type Prediction = {
  id: string
  user_id: string
  symbol: string
  prediction_type: "ai" | "technical" | "fundamental"
  prediction_value: number
  prediction_direction: "up" | "down" | "neutral"
  confidence: number
  created_at: string
  expires_at: string
  status: "pending" | "active" | "expired" | "fulfilled"
  actual_value?: number
  accuracy?: number
}

// Table names mapping for Supabase queries
export const TABLES = {
  USERS: "users",
  PORTFOLIOS: "portfolios",
  PORTFOLIO_STOCKS: "portfolio_stocks",
  TRANSACTIONS: "transactions",
  PREDICTIONS: "predictions",
}
