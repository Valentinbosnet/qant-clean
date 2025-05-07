"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { addToFavorites, removeFromFavorites, getUserFavorites } from "@/actions/favorites"
import { useToast } from "@/hooks/use-toast"

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  // Load favorites when user changes
  useEffect(() => {
    async function loadFavorites() {
      if (!user) {
        setFavorites([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const result = await getUserFavorites()
        if (result.success) {
          setFavorites(result.data)
        } else {
          console.error("Error loading favorites:", result.message)
          toast({
            title: "Error loading favorites",
            description: result.message,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error loading favorites:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [user])

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

    try {
      if (isFavorite) {
        // Optimistic update
        setFavorites(favorites.filter((s) => s !== symbol))
        const result = await removeFromFavorites(symbol)

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
        const result = await addToFavorites(symbol)

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
