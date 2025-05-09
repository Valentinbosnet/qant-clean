"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStockData, clearStockCache, forceRefreshStock } from "@/lib/stock-service"
import { getMockStockData } from "@/lib/mock-stock-service"

export function StockDebug() {
  const [symbol, setSymbol] = useState("AAPL")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStock = async () => {
    if (!symbol) return

    setLoading(true)
    setError(null)

    try {
      const data = await getStockData(symbol)
      setResult(data)
    } catch (err) {
      console.error("Error fetching stock:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch stock data")
    } finally {
      setLoading(false)
    }
  }

  const fetchMockStock = () => {
    if (!symbol) return

    setLoading(true)
    setError(null)

    try {
      const data = getMockStockData(symbol)
      setResult(data)
    } catch (err) {
      console.error("Error generating mock stock:", err)
      setError(err instanceof Error ? err.message : "Failed to generate mock stock data")
    } finally {
      setLoading(false)
    }
  }

  const handleClearCache = () => {
    clearStockCache()
    setResult(null)
    setError(null)
  }

  const handleRefreshStock = () => {
    if (!symbol) return
    forceRefreshStock(symbol)
    setResult(null)
    setError(null)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Stock Data Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Stock symbol (e.g. AAPL)"
            className="max-w-xs"
          />
          <Button onClick={fetchStock} disabled={loading}>
            {loading ? "Loading..." : "Fetch Stock"}
          </Button>
          <Button onClick={fetchMockStock} variant="outline" disabled={loading}>
            Get Mock Data
          </Button>
        </div>

        <div className="flex gap-2 mb-4">
          <Button onClick={handleRefreshStock} variant="outline">
            Refresh This Stock
          </Button>
          <Button onClick={handleClearCache} variant="outline">
            Clear All Cache
          </Button>
        </div>

        {error && (
          <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-md">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
