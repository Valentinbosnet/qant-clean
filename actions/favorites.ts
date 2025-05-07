"use server"

import { createServerClient } from "@/lib/supabase"

// Add a stock to favorites
export async function addToFavorites(symbol: string) {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { success: false, message: "Not authenticated" }
  }

  const userId = session.user.id

  // Check if the favorites table exists and create it if not
  try {
    // First check if the table exists by trying to query it
    const { error: checkError } = await supabase.from("favorites").select("id").limit(1)

    // If we get a specific error about the relation not existing, create the table
    if (checkError && checkError.message.includes('relation "favorites" does not exist')) {
      // Create the favorites table
      await supabase.rpc("create_favorites_table", {})
    }

    // Now try to insert the favorite
    const { error } = await supabase.from("favorites").insert([{ user_id: userId, stock_symbol: symbol }])

    if (error) {
      if (error.code === "23505") {
        // Unique violation
        return { success: true, message: "Already in favorites" }
      }
      return { success: false, message: error.message }
    }

    return { success: true, message: "Added to favorites" }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// Remove a stock from favorites
export async function removeFromFavorites(symbol: string) {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { success: false, message: "Not authenticated" }
  }

  const userId = session.user.id

  try {
    const { error } = await supabase.from("favorites").delete().match({ user_id: userId, stock_symbol: symbol })

    if (error) {
      return { success: false, message: error.message }
    }

    return { success: true, message: "Removed from favorites" }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// Get all favorites for the current user
export async function getUserFavorites() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { success: false, data: [], message: "Not authenticated" }
  }

  const userId = session.user.id

  try {
    const { data, error } = await supabase.from("favorites").select("stock_symbol").eq("user_id", userId)

    if (error) {
      return { success: false, data: [], message: error.message }
    }

    return {
      success: true,
      data: data.map((item) => item.stock_symbol),
      message: "Favorites retrieved",
    }
  } catch (error: any) {
    return { success: false, data: [], message: error.message }
  }
}
