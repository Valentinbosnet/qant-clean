"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { StockData } from "@/lib/stock-service"
import { StockChart } from "@/components/stock-chart"
import { formatPrice, formatChange } from "@/lib/utils"
import { Star, X, Database } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StockCardProps {
  stock: StockData
  onViewDetails: (symbol: string) => void
  isRemovable?: boolean
  onRemove?: (symbol: string) => void
}

export function StockCard({ stock, onViewDetails, isRemovable = false, onRemove }: StockCardProps) {
  const [timeframe, setTimeframe] = useState<number>(30)
  const isPositive = stock.change >= 0
  const { isFavorite, toggleFavorite } = useFavorites()
  const { user } = useAuth()

  const isFav = isFavorite(stock.symbol)

  const handleRemove = () => {
    if (onRemove) {
      onRemove(stock.symbol)
    }
  }

  // Calculate how old the data is
  const dataAge = stock.cachedAt ? Math.floor((Date.now() - stock.cachedAt) / 60000) : null // in minutes

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold">{stock.symbol}</h3>
            <p className="text-sm text-muted-foreground">{stock.name}</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="text-right">
              <p className="text-lg font-semibold">{formatPrice(stock.price)}</p>
              <p className={`text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {formatChange(stock.change, stock.percentChange)}
              </p>
            </div>
            <div className="flex">
              {user && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleFavorite(stock.symbol)}>
                  <Star className={`h-5 w-5 ${isFav ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                  <span className="sr-only">{isFav ? "Remove from favorites" : "Add to favorites"}</span>
                </Button>
              )}
              {isRemovable && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-5 w-5" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleRemove} className="text-red-600">
                      <X className="h-4 w-4 mr-2" />
                      Remove from dashboard
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        <div className="h-[150px] w-full mb-3">
          <StockChart data={stock.history} days={timeframe} showAxes={false} />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <button
              onClick={() => setTimeframe(7)}
              className={`px-2 py-1 text-xs rounded ${
                timeframe === 7 ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              1W
            </button>
            <button
              onClick={() => setTimeframe(30)}
              className={`px-2 py-1 text-xs rounded ${
                timeframe === 30 ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              1M
            </button>
            <button
              onClick={() => setTimeframe(90)}
              className={`px-2 py-1 text-xs rounded ${
                timeframe === 90 ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              3M
            </button>
          </div>

          <div className="flex items-center gap-2">
            {dataAge !== null && dataAge > 5 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-muted-foreground">
                      <Database className="h-3 w-3" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Cached data ({dataAge} min old)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <button
              onClick={() => onViewDetails(stock.symbol)}
              className="text-xs px-3 py-1 bg-secondary hover:bg-secondary/80 rounded"
            >
              Details
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
