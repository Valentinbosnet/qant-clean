"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/database.types"

// Fonction améliorée pour créer un client Supabase côté serveur avec les cookies
async function getServerSupabaseClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Variables d'environnement Supabase manquantes")
  }

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name, options) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}

// Add a stock to favorites
export async function addToFavorites(symbol: string) {
  try {
    const supabase = await getServerSupabaseClient()

    // Get the current user with detailed logging
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return { success: false, message: `Session error: ${sessionError.message}` }
    }

    if (!sessionData.session) {
      console.error("No session found in addToFavorites")
      return { success: false, message: "Not authenticated" }
    }

    const userId = sessionData.session.user.id
    console.log("User authenticated in addToFavorites:", userId)

    // Check if the favorites table exists and create it if not
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
      console.error("Error adding favorite:", error)
      return { success: false, message: error.message }
    }

    return { success: true, message: "Added to favorites" }
  } catch (error: any) {
    console.error("Exception in addToFavorites:", error)
    return { success: false, message: error.message }
  }
}

// Remove a stock from favorites
export async function removeFromFavorites(symbol: string) {
  try {
    const supabase = await getServerSupabaseClient()

    // Get the current user
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return { success: false, message: `Session error: ${sessionError.message}` }
    }

    if (!sessionData.session) {
      console.error("No session found in removeFromFavorites")
      return { success: false, message: "Not authenticated" }
    }

    const userId = sessionData.session.user.id

    const { error } = await supabase.from("favorites").delete().match({ user_id: userId, stock_symbol: symbol })

    if (error) {
      console.error("Error removing favorite:", error)
      return { success: false, message: error.message }
    }

    return { success: true, message: "Removed from favorites" }
  } catch (error: any) {
    console.error("Exception in removeFromFavorites:", error)
    return { success: false, message: error.message }
  }
}

// Get all favorites for the current user
export async function getUserFavorites() {
  try {
    const supabase = await getServerSupabaseClient()

    // Get the current user with detailed logging
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return { success: false, data: [], message: `Session error: ${sessionError.message}` }
    }

    if (!sessionData.session) {
      console.error("No session found in getUserFavorites")

      // Vérifier si nous sommes en mode développement
      if (process.env.NODE_ENV === "development") {
        console.log("Returning mock data in development mode")
        return {
          success: true,
          data: [],
          message: "Development mode - no session required",
        }
      }

      return { success: false, data: [], message: "Not authenticated" }
    }

    const userId = sessionData.session.user.id
    console.log("User authenticated in getUserFavorites:", userId)

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
    console.error("Exception in getUserFavorites:", error)
    return { success: false, data: [], message: error.message }
  }
}
