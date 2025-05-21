"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useFavorites } from "@/hooks/use-favorites"
import { useStockData } from "@/hooks/use-stock-data"
import type { HomeWidgetConfig } from "@/lib/home-widgets-service"

interface FavoritesWidgetProps {
  config: HomeWidgetConfig
}

export function FavoritesWidget({ config }: FavoritesWidgetProps) {
  const { settings } = config
  const maxItems = settings?.maxItems || 5

  const { favorites, isLoading: isFavoritesLoading, error: favoritesError } = useFavorites()
  const [stockData, setStockData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { getStockData } = useStockData()

  useEffect(() => {
    async function loadStockData() {
      if (!favorites || favorites.length === 0) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const symbols = favorites.slice(0, maxItems).map((fav) => fav.symbol)
        const data = await Promise.all(symbols.map((symbol) => getStockData(symbol)))

        // Combiner les données des favoris avec les données des actions
        const combinedData = data
          .map((stockInfo, index) => {
            const favorite = favorites.find((fav) => fav.symbol === symbols[index])
            return {
              ...stockInfo,
              symbol: symbols[index],
              name: stockInfo?.name || favorite?.name || symbols[index],
            }
          })
          .filter(Boolean)

        setStockData(combinedData)
        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des données d'actions:", err)
        setError("Impossible de charger les données des actions")
      } finally {
        setIsLoading(false)
      }
    }

    loadStockData()
  }, [favorites, maxItems, getStockData])

  // Afficher un état de chargement
  if (isFavoritesLoading || isLoading) {
    return (
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Vos favoris</h3>
        <div className="space-y-2">
          {Array(3)
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
    )
  }

  // Afficher un message d'erreur
  if (favoritesError || error) {
    return (
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Vos favoris</h3>
        <Card className="overflow-hidden">
          <CardContent className="p-4 text-center">
            <p className="text-red-500 mb-2">{favoritesError || error || "Une erreur est survenue"}</p>
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
      <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Vos favoris</h3>
      <div className="space-y-2">
        {stockData && stockData.length > 0 ? (
          stockData.map((stock) => (
            <Card key={stock.symbol} className="overflow-hidden">
              <CardContent className="p-2 sm:p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm sm:text-base">{stock.symbol}</div>
                    <div className="text-xs text-muted-foreground">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm sm:text-base">${stock.price?.toFixed(2) || "N/A"}</div>
                    {stock.change !== undefined && (
                      <div
                        className={`text-xs flex items-center justify-end ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {stock.change >= 0 ? (
                          <ArrowUpIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3 mr-1" />
                        )}
                        {stock.change >= 0 ? "+" : ""}
                        {stock.change?.toFixed(2) || "0.00"} ({stock.changePercent?.toFixed(2) || "0.00"}%)
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>Vous n'avez pas encore de favoris</p>
            <a href="/search" className="text-sm text-primary hover:underline mt-2 inline-block">
              Rechercher des actions
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
