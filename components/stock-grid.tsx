"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { StockCard } from "@/components/stock-card"
import { type StockData, getMultipleStocks, popularStocks } from "@/lib/stock-service"
import { useStockModal } from "@/hooks/use-stock-modal"

export function StockGrid() {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const { openModal } = useStockModal()

  useEffect(() => {
    loadStocks()
  }, [])

  async function loadStocks() {
    setLoading(true)
    try {
      // In a real app, we would fetch from an API
      // For now, we're using our mock service
      const stockData = getMultipleStocks(popularStocks)
      setStocks(stockData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading stocks:", error)
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
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
            <Button onClick={handleRefresh} className="w-full sm:w-auto">
              Refresh Data
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} onViewDetails={handleViewDetails} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
