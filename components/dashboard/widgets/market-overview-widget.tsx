"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp } from "lucide-react"
import type { WidgetConfig } from "@/lib/dashboard-service"

interface MarketOverviewWidgetProps {
  config: WidgetConfig
}

interface MarketIndex {
  name: string
  symbol: string
  value: number
  change: number
  changePercent: number
}

export function MarketOverviewWidget({ config }: MarketOverviewWidgetProps) {
  const [indices, setIndices] = useState<MarketIndex[]>([])
  const [loading, setLoading] = useState(true)

  // Nombre d'indices à afficher (paramètre configurable)
  const displayCount = config.settings?.displayCount || 5

  useEffect(() => {
    // Simuler le chargement des données du marché
    const fetchMarketData = async () => {
      setLoading(true)

      // Dans une application réelle, vous feriez un appel API ici
      // Données simulées pour la démonstration
      const mockIndices: MarketIndex[] = [
        {
          name: "S&P 500",
          symbol: "SPX",
          value: 4783.83,
          change: 32.64,
          changePercent: 0.69,
        },
        {
          name: "Dow Jones",
          symbol: "DJI",
          value: 38239.98,
          change: 253.91,
          changePercent: 0.67,
        },
        {
          name: "Nasdaq",
          symbol: "IXIC",
          value: 15927.9,
          change: 169.3,
          changePercent: 1.07,
        },
        {
          name: "Russell 2000",
          symbol: "RUT",
          value: 2063.79,
          change: -5.93,
          changePercent: -0.29,
        },
        {
          name: "CAC 40",
          symbol: "PX1",
          value: 8184.75,
          change: 42.33,
          changePercent: 0.52,
        },
        {
          name: "DAX",
          symbol: "GDAXI",
          value: 18384.35,
          change: 123.87,
          changePercent: 0.68,
        },
        {
          name: "Nikkei 225",
          symbol: "N225",
          value: 38239.48,
          change: -267.11,
          changePercent: -0.69,
        },
      ]

      // Attendre un peu pour simuler le chargement
      setTimeout(() => {
        setIndices(mockIndices)
        setLoading(false)
      }, 1000)
    }

    fetchMarketData()
  }, [config.settings?.displayCount])

  if (loading) {
    return (
      <div className="space-y-3">
        {Array(displayCount)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {indices.slice(0, displayCount).map((index) => (
        <Card key={index.symbol} className="bg-card">
          <CardContent className="p-3">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="font-medium">{index.name}</span>
                <span className="text-xs text-muted-foreground">{index.symbol}</span>
              </div>

              <div className="text-right font-mono">
                {index.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              <div className={`flex items-center gap-1 ${index.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {index.change >= 0 ? (
                  <>
                    <ArrowUp className="h-3 w-3" />
                    <span className="text-sm">
                      {index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-3 w-3" />
                    <span className="text-sm">
                      {Math.abs(index.change).toFixed(2)} ({Math.abs(index.changePercent).toFixed(2)}%)
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center text-green-600 text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>Hausse: {indices.filter((i) => i.change > 0).length}</span>
          </div>
          <div className="flex items-center text-red-600 text-xs">
            <TrendingDown className="h-3 w-3 mr-1" />
            <span>Baisse: {indices.filter((i) => i.change < 0).length}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">Dernière mise à jour: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  )
}
