"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { StockChart } from "@/components/stock-chart"
import { useStockModal } from "@/hooks/use-stock-modal"
import { formatPrice, formatChange } from "@/lib/utils"

export function StockDetailModal() {
  const { isOpen, stock, closeModal } = useStockModal()
  const [timeframe, setTimeframe] = useState<number>(30)

  // Reset timeframe when modal opens with a new stock
  useEffect(() => {
    if (isOpen) {
      setTimeframe(30)
    }
  }, [isOpen, stock?.symbol])

  if (!stock) return null

  const isPositive = stock.change >= 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>
              {stock.symbol} - {stock.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-between items-start mt-4 mb-6">
          <div>
            <p className="text-2xl font-bold">{formatPrice(stock.price)}</p>
            <p className={`${isPositive ? "text-green-600" : "text-red-600"}`}>
              {formatChange(stock.change, stock.percentChange)}
            </p>
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => setTimeframe(7)}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === 7 ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              1W
            </button>
            <button
              onClick={() => setTimeframe(30)}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === 30 ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              1M
            </button>
            <button
              onClick={() => setTimeframe(90)}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === 90 ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              3M
            </button>
            <button
              onClick={() => setTimeframe(180)}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === 180 ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              6M
            </button>
            <button
              onClick={() => setTimeframe(365)}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === 365 ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              1Y
            </button>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <StockChart data={stock.history} days={timeframe} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
