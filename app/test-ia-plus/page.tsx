"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EnhancedStockPrediction } from "@/components/enhanced-stock-prediction"
import { getStockData } from "@/lib/stock-service"
import { Loader2 } from "lucide-react"

export default function TestIAPlusPage() {
  const [symbol, setSymbol] = useState("AAPL")
  const [stockData, setStockData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStockData = async () => {
    if (!symbol) return

    setLoading(true)
    setError(null)
    setStockData(null)

    try {
      const data = await getStockData(symbol)
      setStockData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la récupération des données")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Test des Prédictions IA+</h1>
      <p className="text-muted-foreground mb-6">
        Cette page vous permet de tester les prédictions IA+ pour n'importe quel symbole boursier.
      </p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Entrez un symbole boursier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="symbol">Symbole</Label>
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="ex: AAPL"
              />
            </div>
            <Button onClick={fetchStockData} disabled={loading || !symbol}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Générer une prédiction
            </Button>
          </div>

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </CardContent>
      </Card>

      {stockData && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Prédiction pour {stockData.name} ({stockData.symbol})
          </h2>
          <EnhancedStockPrediction stock={stockData} />
        </div>
      )}
    </div>
  )
}
