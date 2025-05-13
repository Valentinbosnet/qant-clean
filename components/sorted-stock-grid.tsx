"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Star, TrendingUp, BarChart2 } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"
import { getSectorInfo } from "@/lib/sector-classification"
import type { StockData } from "@/lib/stock-service"
import { cn } from "@/lib/utils"
import type { SortOption } from "@/components/stock-filter-panel"

// Type pour les prédictions simulées
interface StockPrediction {
  trend: "up" | "down"
  percentChange: number
  volatility: number
}

// Type étendu pour inclure les prédictions
interface StockWithPrediction extends StockData {
  prediction: StockPrediction
}

interface SortedStockGridProps {
  stocks: StockWithPrediction[]
  sortBy: SortOption
  onSelectStock: (symbol: string) => void
}

export function SortedStockGrid({ stocks, sortBy, onSelectStock }: SortedStockGridProps) {
  const { favorites, toggleFavorite } = useFavorites()

  if (!stocks || stocks.length === 0) {
    return (
      <div className="text-center py-12 bg-muted rounded-lg">
        <p className="text-muted-foreground">Aucun résultat ne correspond à vos critères.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {stocks.length} résultat{stocks.length > 1 ? "s" : ""} trouvé{stocks.length > 1 ? "s" : ""}
        </div>
        <SortIndicator sortBy={sortBy} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.map((stock) => (
          <Card key={stock.symbol} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    {stock.symbol}
                    {favorites.includes(stock.symbol) && (
                      <Star className="h-4 w-4 ml-1 fill-yellow-400 text-yellow-400" />
                    )}
                  </CardTitle>
                  <CardDescription>{stock.name}</CardDescription>
                </div>
                <PredictionBadge prediction={stock.prediction} />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">${stock.price.toFixed(2)}</div>
                  <div
                    className={cn("text-sm flex items-center", stock.change >= 0 ? "text-green-500" : "text-red-500")}
                  >
                    {stock.change >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                    {stock.change.toFixed(2)} ({(stock.changePercent * 100).toFixed(2)}%)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Volatilité</div>
                  <div className="flex items-center">
                    <VolatilityIndicator volatility={stock.prediction.volatility} />
                    <span className="ml-1">{stock.prediction.volatility.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="mr-1">
                  {getSectorInfo(stock.symbol).sector}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => toggleFavorite(stock.symbol)}>
                {favorites.includes(stock.symbol) ? "Retirer des favoris" : "Ajouter aux favoris"}
              </Button>
              <Button size="sm" onClick={() => onSelectStock(stock.symbol)}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Voir prédiction
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PredictionBadge({ prediction }: { prediction: StockPrediction }) {
  const isPositive = prediction.percentChange >= 0
  return (
    <Badge variant={isPositive ? "default" : "destructive"} className="ml-2">
      {isPositive ? "+" : ""}
      {prediction.percentChange.toFixed(2)}%
    </Badge>
  )
}

function VolatilityIndicator({ volatility }: { volatility: number }) {
  // Déterminer le niveau de volatilité
  let bars = []
  if (volatility < 10) {
    // Faible volatilité
    bars = [true, false, false]
  } else if (volatility < 20) {
    // Volatilité moyenne
    bars = [true, true, false]
  } else {
    // Forte volatilité
    bars = [true, true, true]
  }

  return (
    <div className="flex items-center space-x-0.5">
      {bars.map((active, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-sm",
            active ? "bg-primary" : "bg-muted",
            i === 0 ? "h-2" : i === 1 ? "h-3" : "h-4",
          )}
        />
      ))}
    </div>
  )
}

function SortIndicator({ sortBy }: { sortBy: SortOption }) {
  const getSortIcon = () => {
    if (sortBy.includes("performance")) {
      return <TrendingUp className="h-4 w-4 mr-1" />
    } else if (sortBy.includes("volatility")) {
      return <BarChart2 className="h-4 w-4 mr-1" />
    } else if (sortBy.includes("alphabetical")) {
      return sortBy === "alphabetical_asc" ? <span className="mr-1">A→Z</span> : <span className="mr-1">Z→A</span>
    } else {
      return sortBy === "price_asc" ? <span className="mr-1">$↑</span> : <span className="mr-1">$↓</span>
    }
  }

  return (
    <div className="flex items-center text-sm">
      <span className="mr-1">Trié par:</span>
      <Badge variant="outline" className="flex items-center">
        {getSortIcon()}
        {sortBy.includes("_asc") ? "Croissant" : "Décroissant"}
      </Badge>
    </div>
  )
}
