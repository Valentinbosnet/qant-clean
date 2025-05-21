"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import type { HomeWidgetConfig } from "@/lib/home-widgets-service"

interface StockHighlightsWidgetProps {
  config: HomeWidgetConfig
}

export function StockHighlightsWidget({ config }: StockHighlightsWidgetProps) {
  const { settings } = config
  const maxItems = settings?.maxItems || 3

  const [highlights, setHighlights] = useState<{
    topGainers: any[]
    topLosers: any[]
    mostActive: any[]
  }>({
    topGainers: [],
    topLosers: [],
    mostActive: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMarketHighlights() {
      try {
        setIsLoading(true)

        // Récupérer les faits saillants du marché depuis l'API
        const response = await fetch(`/api/market/highlights?limit=${maxItems}`)

        if (!response.ok) {
          throw new Error("Impossible de récupérer les faits saillants du marché")
        }

        const data = await response.json()
        setHighlights(data)
        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des faits saillants du marché:", err)
        setError("Impossible de charger les données")

        // Utiliser des données de secours
        setHighlights({
          topGainers: [
            { symbol: "NVDA", name: "NVIDIA Corp.", price: 437.53, changePercent: 5.12 },
            { symbol: "AMD", name: "Advanced Micro Devices", price: 108.24, changePercent: 3.87 },
            { symbol: "TSLA", name: "Tesla Inc.", price: 243.84, changePercent: 3.21 },
          ],
          topLosers: [
            { symbol: "INTC", name: "Intel Corp.", price: 31.75, changePercent: -4.23 },
            { symbol: "PYPL", name: "PayPal Holdings", price: 58.92, changePercent: -3.45 },
            { symbol: "NFLX", name: "Netflix Inc.", price: 398.75, changePercent: -2.18 },
          ],
          mostActive: [
            { symbol: "AAPL", name: "Apple Inc.", price: 182.63, volume: "85.4M" },
            { symbol: "MSFT", name: "Microsoft Corp.", price: 337.22, volume: "62.1M" },
            { symbol: "AMZN", name: "Amazon.com Inc.", price: 127.74, volume: "58.7M" },
          ],
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadMarketHighlights()
  }, [maxItems])

  // Afficher un état de chargement
  if (isLoading) {
    return (
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Faits saillants du marché</h3>
        <div className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, sectionIndex) => (
              <div key={sectionIndex}>
                <Skeleton className="h-5 w-32 mb-2" />
                <div className="space-y-2">
                  {Array(maxItems)
                    .fill(0)
                    .map((_, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-2 sm:p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <Skeleton className="h-5 w-16 mb-1" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                            <div className="text-right">
                              <Skeleton className="h-5 w-16 mb-1" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    )
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Faits saillants du marché</h3>
        <Card className="overflow-hidden">
          <CardContent className="p-4 text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Faits saillants du marché</h3>

      <div className="space-y-4">
        <div>
          <div className="flex items-center mb-1 sm:mb-2">
            <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
            <h4 className="text-sm sm:text-base font-medium">Top gagnants</h4>
          </div>
          <div className="space-y-2">
            {highlights.topGainers.map((stock) => (
              <Card key={stock.symbol} className="overflow-hidden">
                <CardContent className="p-2 sm:p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm sm:text-base">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm sm:text-base">${stock.price.toFixed(2)}</div>
                      <div className="text-xs text-green-500 flex items-center justify-end">
                        <ArrowUpIcon className="h-3 w-3 mr-1" />+{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center mb-1 sm:mb-2">
            <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
            <h4 className="text-sm sm:text-base font-medium">Top perdants</h4>
          </div>
          <div className="space-y-2">
            {highlights.topLosers.map((stock) => (
              <Card key={stock.symbol} className="overflow-hidden">
                <CardContent className="p-2 sm:p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm sm:text-base">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm sm:text-base">${stock.price.toFixed(2)}</div>
                      <div className="text-xs text-red-500 flex items-center justify-end">
                        <ArrowDownIcon className="h-3 w-3 mr-1" />
                        {Math.abs(stock.changePercent).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center mb-1 sm:mb-2">
            <Activity className="h-4 w-4 text-blue-500 mr-2" />
            <h4 className="text-sm sm:text-base font-medium">Plus actifs</h4>
          </div>
          <div className="space-y-2">
            {highlights.mostActive.map((stock) => (
              <Card key={stock.symbol} className="overflow-hidden">
                <CardContent className="p-2 sm:p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm sm:text-base">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm sm:text-base">${stock.price.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Vol: {stock.volume}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
