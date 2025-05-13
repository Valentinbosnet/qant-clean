"use client"

import { useState, useEffect } from "react"
import { getStockData, type StockData } from "@/lib/stock-service"

export function useStockData(symbol: string) {
  const [data, setData] = useState<StockData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!symbol) return

      setIsLoading(true)
      setError(null)

      try {
        const stockData = await getStockData(symbol)
        setData(stockData)
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err)
        setError(err instanceof Error ? err : new Error("Erreur inconnue"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [symbol])

  return { data, isLoading, error }
}
