"use client"

import { useState, useEffect } from "react"
import { getStockData, type StockData } from "@/lib/stock-service"

export function useStockData(symbol: string) {
  const [data, setData] = useState<StockData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const stockData = await getStockData(symbol)
        setData(stockData)
      } catch (err: any) {
        console.error("Error loading stock data:", err)
        setError(err.message || "Failed to load stock data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [symbol])

  return { data, isLoading, error }
}
