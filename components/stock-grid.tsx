"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { StockCard } from "@/components/stock-card"
import { type StockData, getMultipleStocks, popularStocks } from "@/lib/stock-service"
import { useStockModal } from "@/hooks/use-stock-modal"
import { SearchButton } from "@/components/search/search-button"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw } from "lucide-react"

export function StockGrid() {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [customStocks, setCustomStocks] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const { openModal } = useStockModal()
  const { toast } = useToast()

  // Load custom stocks from localStorage on initial render
  useEffect(() => {
    const savedStocks = localStorage.getItem("customStocks")
    if (savedStocks) {
      try {
        setCustomStocks(JSON.parse(savedStocks))
      } catch (e) {
        console.error("Error parsing saved stocks:", e)
      }
    }
  }, [])

  // Load stocks whenever customStocks changes
  useEffect(() => {
    loadStocks()
    // Save custom stocks to localStorage whenever they change
    localStorage.setItem("customStocks", JSON.stringify(customStocks))
  }, [customStocks])

  async function loadStocks() {
    setLoading(true)
    try {
      // Combine popular stocks with custom stocks, removing duplicates
      const allStockSymbols = Array.from(new Set([...popularStocks, ...customStocks]))
      const stockData = getMultipleStocks(allStockSymbols)
      setStocks(stockData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading stocks:", error)
      toast({
        title: "Error loading stocks",
        description: "There was a problem loading stock data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadStocks()
  }

  const handleViewDetails = (symbol: string) => {
    const stock = stocks.find((s) => s.symbol === symbol)
    if (stock) {
      openModal(stock)
    }
  }

  const handleAddStock = (symbol: string) => {
    // Check if stock already exists
    if ([...popularStocks, ...customStocks].includes(symbol)) {
      toast({
        title: "Stock already added",
        description: `${symbol} is already on your dashboard`,
      })
      return
    }

    // Add the stock to custom stocks
    setCustomStocks((prev) => [...prev, symbol])
  }

  const handleRemoveStock = (symbol: string) => {
    // Only allow removing custom stocks, not popular ones
    if (popularStocks.includes(symbol)) {
      toast({
        title: "Cannot remove default stock",
        description: "Default stocks cannot be removed from the dashboard",
      })
      return
    }

    setCustomStocks((prev) => prev.filter((s) => s !== symbol))
    toast({
      title: "Stock removed",
      description: `${symbol} has been removed from your dashboard`,
    })
  }

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading stock data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Last updated: {lastUpdated.toLocaleTimeString()}</p>
              <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-8 w-8">
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <SearchButton onAddStock={handleAddStock} />
              <Button onClick={handleRefresh} className="w-full sm:w-auto">
                Refresh All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                stock={stock}
                onViewDetails={handleViewDetails}
                isRemovable={!popularStocks.includes(stock.symbol)}
                onRemove={handleRemoveStock}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
