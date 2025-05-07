"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Star } from "lucide-react"
import { searchStocks } from "@/lib/stock-database"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { isFavorite, toggleFavorite } = useFavorites()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSearch = () => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      // In a real app, this would be an API call
      const searchResults = searchStocks(query)
      setResults(searchResults)
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search failed",
        description: "An error occurred while searching for stocks",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleToggleFavorite = (symbol: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      })
      return
    }
    toggleFavorite(symbol)
  }

  const handleAddToDashboard = (symbol: string) => {
    // Get existing custom stocks
    const savedStocks = localStorage.getItem("customStocks")
    let customStocks: string[] = []

    if (savedStocks) {
      try {
        customStocks = JSON.parse(savedStocks)
      } catch (e) {
        console.error("Error parsing saved stocks:", e)
      }
    }

    // Check if already added
    if (customStocks.includes(symbol)) {
      toast({
        title: "Already added",
        description: `${symbol} is already on your dashboard`,
      })
      return
    }

    // Add to custom stocks
    customStocks.push(symbol)
    localStorage.setItem("customStocks", JSON.stringify(customStocks))

    toast({
      title: "Stock added",
      description: `${symbol} has been added to your dashboard`,
    })
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Search Stocks</h1>

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center space-x-2 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by symbol or company name..."
              className="pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        {isSearching ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Searching...</p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              {query.trim() === "" ? (
                <>
                  <h2 className="text-xl font-semibold mb-2">Search for Stocks</h2>
                  <p className="text-muted-foreground mb-4">
                    Enter a company name or stock symbol to search for stocks
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
                  <p className="text-muted-foreground mb-4">
                    No stocks found matching "{query}". Try a different search term.
                  </p>
                </>
              )}
              <Button asChild>
                <Link href="/">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-2">
              Found {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-4 rounded-md border hover:bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{stock.symbol}</span>
                    {stock.sector && (
                      <Badge variant="outline" className="text-xs">
                        {stock.sector}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{stock.name}</p>
                  {stock.industry && <p className="text-xs text-muted-foreground mt-1">{stock.industry}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleToggleFavorite(stock.symbol)}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        isFavorite(stock.symbol) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                      }`}
                    />
                    <span className="sr-only">
                      {isFavorite(stock.symbol) ? "Remove from favorites" : "Add to favorites"}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => handleAddToDashboard(stock.symbol)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
