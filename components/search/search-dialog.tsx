"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Star } from "lucide-react"
import { searchStocks } from "@/lib/stock-database"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddStock: (symbol: string) => void
}

export function SearchDialog({ isOpen, onClose, onAddStock }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { isFavorite, toggleFavorite } = useFavorites()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const searchResults = await searchStocks(query)
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

  const handleAddStock = (symbol: string) => {
    onAddStock(symbol)
    toast({
      title: "Stock added",
      description: `${symbol} has been added to your dashboard`,
    })
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Search Stocks</DialogTitle>
        </DialogHeader>

        <div className="flex items-center space-x-2 mt-4">
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

        <div className="mt-4">
          {isSearching ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : results.length === 0 && query.trim() !== "" ? (
            <p className="text-center py-8 text-muted-foreground">No stocks found matching your search.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {results.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50"
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
                    <Button variant="outline" size="sm" className="h-8" onClick={() => handleAddStock(stock.symbol)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
