"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { StockChart } from "@/components/stock-chart"
import { Badge } from "@/components/ui/badge"
import type { WidgetConfig } from "@/lib/dashboard-service"
import { fetchStockData } from "@/lib/stock-service"

interface StockWidgetProps {
  config: WidgetConfig
}

export function StockWidget({ config }: StockWidgetProps) {
  const [stockData, setStockData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const symbol = config.settings?.symbol || "AAPL"

  useEffect(() => {
    async function loadStockData() {
      try {
        setIsLoading(true)
        const data = await fetchStockData(symbol)
        setStockData(data)
        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des données du stock:", err)
        setError(err instanceof Error ? err : new Error("Erreur inconnue"))
      } finally {
        setIsLoading(false)
      }
    }

    loadStockData()
  }, [symbol])

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-destructive">Erreur lors du chargement des données</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  if (!stockData) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    )
  }

  const priceChange = stockData.latestPrice - stockData.previousClose
  const percentChange = (priceChange / stockData.previousClose) * 100

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{symbol}</h3>
          <p className="text-sm text-muted-foreground">{stockData.companyName}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">${stockData.latestPrice.toFixed(2)}</p>
          <Badge variant={priceChange >= 0 ? "success" : "destructive"}>
            {priceChange >= 0 ? "+" : ""}
            {priceChange.toFixed(2)} ({percentChange.toFixed(2)}%)
          </Badge>
        </div>
      </div>

      <div className="h-40">
        <StockChart
          data={stockData.historicalData || []}
          showTooltip={true}
          showGrid={true}
          lineColor={priceChange >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"}
        />
      </div>
    </div>
  )
}
