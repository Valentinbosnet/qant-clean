"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { StockData } from "@/lib/stock-service"
import { StockChart } from "@/components/stock-chart"
import { formatPrice, formatChange } from "@/lib/utils"

interface StockCardProps {
  stock: StockData
  onViewDetails: (symbol: string) => void
}

export function StockCard({ stock, onViewDetails }: StockCardProps) {
  const [timeframe, setTimeframe] = useState<number>(30)
  const isPositive = stock.change >= 0

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold">{stock.symbol}</h3>
            <p className="text-sm text-muted-foreground">{stock.name}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{formatPrice(stock.price)}</p>
            <p className={`text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {formatChange(stock.change, stock.percentChange)}
            </p>
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

          <button
            onClick={() => onViewDetails(stock.symbol)}
            className="text-xs px-3 py-1 bg-secondary hover:bg-secondary/80 rounded"
          >
            Details
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
