"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { addFavoriteClient, removeFavoriteClient, getFavoritesClient } from "@/lib/client-favorites"

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  // Load favorites when user changes
  useEffect(() => {
    async function loadFavorites() {
      if (authLoading) {
        return // Wait for auth to complete
      }

      if (!user) {
        console.log("No user, clearing favorites")
        setFavorites([])
        setIsLoading(false)
        return
      }

      console.log("Loading favorites for user:", user.id)
      setIsLoading(true)

      try {
        const result = await getFavoritesClient()

        if (result.success) {
          console.log("Favorites loaded successfully:", result.data)
          setFavorites(result.data)
        } else {
          console.error("Error loading favorites:", result.message)
          toast({
            title: "Error loading favorites",
            description: result.message,
            variant: "destructive",
          })
          // Set empty array as fallback
          setFavorites([])
        }
      } catch (error: any) {
        console.error("Exception loading favorites:", error)
        toast({
          title: "Error",
          description: error.message || "An error occurred",
          variant: "destructive",
        })
        // Set empty array as fallback
        setFavorites([])
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [user, authLoading, toast])

  const toggleFavorite = async (symbol: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      })
      return
    }

    const isFavorite = favorites.includes(symbol)
    console.log(`Toggling favorite for ${symbol}, current status:`, isFavorite ? "is favorite" : "not favorite")

    try {
      if (isFavorite) {
        // Optimistic update
        setFavorites(favorites.filter((s) => s !== symbol))
        const result = await removeFavoriteClient(symbol)

        if (!result.success) {
          // Revert on failure
          setFavorites([...favorites])
          toast({
            title: "Error removing favorite",
            description: result.message,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Removed from favorites",
            description: `${symbol} has been removed from your favorites`,
          })
        }
      } else {
        // Optimistic update
        setFavorites([...favorites, symbol])
        const result = await addFavoriteClient(symbol)

        if (!result.success) {
          // Revert on failure
          setFavorites(favorites.filter((s) => s !== symbol))
          toast({
            title: "Error adding favorite",
            description: result.message,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Added to favorites",
            description: `${symbol} has been added to your favorites`,
          })
        }
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    }
  }

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite: (symbol: string) => favorites.includes(symbol),
  }
}
