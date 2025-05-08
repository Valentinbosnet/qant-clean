"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useFavorites } from "@/hooks/use-favorites"
import { getMultipleStocks } from "@/lib/stock-service"
import { StockCard } from "@/components/stock-card"
import { useStockModal } from "@/hooks/use-stock-modal"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FavoritesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { favorites, isLoading: favoritesLoading } = useFavorites()
  const [stocks, setStocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { openModal } = useStockModal()

  useEffect(() => {
    if (!favoritesLoading && favorites.length > 0) {
      setLoading(true)
      try {
        const stockData = getMultipleStocks(favorites)
        setStocks(Array.isArray(stockData) ? stockData : [])
      } catch (error) {
        console.error("Error fetching stocks:", error)
        setStocks([])
      } finally {
        setLoading(false)
      }
    } else if (!favoritesLoading) {
      setLoading(false)
    }
  }, [favorites, favoritesLoading])

  const handleViewDetails = (symbol: string) => {
    const stock = stocks.find((s) => s.symbol === symbol)
    if (stock) {
      openModal(stock)
    }
  }

  if (authLoading || favoritesLoading) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
        <div className="bg-muted p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
          <p className="mb-6">Please sign in to view your favorite stocks.</p>
          <Button asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">My Favorites</h1>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading favorite stocks...</p>
          </div>
        </div>
      ) : favorites.length === 0 ? (
        <div className="bg-muted p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-4">No Favorites Yet</h2>
          <p className="mb-6">You haven't added any stocks to your favorites yet.</p>
          <Button asChild>
            <Link href="/">Browse Stocks</Link>
          </Button>
        </div>
      ) : !stocks || stocks.length === 0 ? (
        <div className="bg-muted p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-4">Error Loading Stocks</h2>
          <p className="mb-6">There was a problem loading your favorite stocks. Please try again later.</p>
          <Button asChild>
            <Link href="/">Browse Stocks</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stocks.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} onViewDetails={handleViewDetails} />
          ))}
        </div>
      )}
    </div>
  )
}
