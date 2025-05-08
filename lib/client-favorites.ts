"use client"

import { getBrowserClient } from "@/lib/client-supabase"

// Add a stock to favorites using client-side Supabase
export async function addFavoriteClient(symbol: string) {
  try {
    const supabase = getBrowserClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("User error:", userError)
      return { success: false, message: userError?.message || "Not authenticated" }
    }

    const userId = user.id

    // Now try to insert the favorite
    const { error } = await supabase.from("favorites").insert([{ user_id: userId, stock_symbol: symbol }])

    if (error) {
      if (error.code === "23505") {
        // Unique violation
        return { success: true, message: "Already in favorites" }
      }
      console.error("Error adding favorite:", error)
      return { success: false, message: error.message }
    }

    return { success: true, message: "Added to favorites" }
  } catch (error: any) {
    console.error("Exception in addFavoriteClient:", error)
    return { success: false, message: error.message }
  }
}

// Remove a stock from favorites using client-side Supabase
export async function removeFavoriteClient(symbol: string) {
  try {
    const supabase = getBrowserClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("User error:", userError)
      return { success: false, message: userError?.message || "Not authenticated" }
    }

    const userId = user.id

    const { error } = await supabase.from("favorites").delete().match({ user_id: userId, stock_symbol: symbol })

    if (error) {
      console.error("Error removing favorite:", error)
      return { success: false, message: error.message }
    }

    return { success: true, message: "Removed from favorites" }
  } catch (error: any) {
    console.error("Exception in removeFavoriteClient:", error)
    return { success: false, message: error.message }
  }
}

// Get all favorites for the current user using client-side Supabase
export async function getFavoritesClient() {
  try {
    const supabase = getBrowserClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("User error:", userError)
      return { success: false, data: [], message: userError?.message || "Not authenticated" }
    }

    const userId = user.id

    const { data, error } = await supabase.from("favorites").select("stock_symbol").eq("user_id", userId)

    if (error) {
      console.error("Error getting favorites:", error)
      return { success: false, data: [], message: error.message }
    }

    return {
      success: true,
      data: data.map((item) => item.stock_symbol),
      message: "Favorites retrieved",
    }
  } catch (error: any) {
    console.error("Exception in getFavoritesClient:", error)
    return { success: false, data: [], message: error.message }
  }
}
