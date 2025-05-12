"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PredictionModeSelector } from "@/components/prediction-mode-selector"
import { getStockData } from "@/lib/stock-service"
import type { StockData } from "@/lib/stock-service"
import { Scale } from "lucide-react"

export default function ComparePredictionsPage() {
  const [symbol, setSymbol] = useState("")
  const [stock, setStock] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!symbol) return

    setLoading(true)
    setError(null)

    try {
      const stockData = await getStockData(symbol.toUpperCase())
      setStock(stockData)
    } catch (err) {
      setError("Impossible de récupérer les données pour ce symbole")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Comparaison des Modes de Prédiction</h1>
          <p className="text-muted-foreground">
            Comparez les différents modes de prédiction IA pour trouver celui qui fonctionne le mieux pour vous.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="h-5 w-5 mr-2" />
              Entrez un symbole boursier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Symbole"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={loading || !symbol}>
                {loading ? "Chargement..." : "Comparer les prédictions"}
              </Button>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </CardContent>
        </Card>

        {stock && (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Prédictions pour {stock.name} ({stock.symbol})
            </h2>
            <PredictionModeSelector stock={stock} days={30} />
          </div>
        )}
      </div>
    </div>
  )
}
