import { getBrowserClient } from "./supabase"

// Create favorites table if it doesn't exist
export async function ensureFavoritesTable() {
  const supabase = getBrowserClient()

  // Check if the table exists
  const { error: checkError } = await supabase.from("favorites").select("id").limit(1).single()

  // If we get an error that's not just "No rows found", we need to create the table
  if (checkError && !checkError.message.includes("No rows found")) {
    // We'll create the table through our application code
    const { error } = await supabase.rpc("create_favorites_table")
    if (error) {
      console.error("Error creating favorites table:", error)
    }
  }
}

// Add a stock to favorites
export async function addFavorite(userId: string, symbol: string) {
  const supabase = getBrowserClient()

  const { error } = await supabase.from("favorites").insert([{ user_id: userId, stock_symbol: symbol }])

  if (error) {
    console.error("Error adding favorite:", error)
    return false
  }

  return true
}

// Remove a stock from favorites
export async function removeFavorite(userId: string, symbol: string) {
  const supabase = getBrowserClient()

  const { error } = await supabase.from("favorites").delete().match({ user_id: userId, stock_symbol: symbol })

  if (error) {
    console.error("Error removing favorite:", error)
    return false
  }

  return true
}

// Get all favorites for a user
export async function getFavorites(userId: string) {
  const supabase = getBrowserClient()

  const { data, error } = await supabase.from("favorites").select("stock_symbol").eq("user_id", userId)

  if (error) {
    console.error("Error getting favorites:", error)
    return []
  }

  return data.map((item) => item.stock_symbol)
}

// Check if a stock is a favorite
export async function isFavorite(userId: string, symbol: string) {
  const supabase = getBrowserClient()

  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .match({ user_id: userId, stock_symbol: symbol })
    .single()

  if (error) {
    return false
  }

  return !!data
}
