"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUp, ArrowDown, Minus, RefreshCw, TrendingUp, Brain } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { getStockData, type StockData } from "@/lib/stock-service"
import { generatePrediction, type PredictionResult } from "@/lib/prediction-service"
import { popularStocks } from "@/lib/stock-service"

export function PredictionWidget() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL")
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useAI, setUseAI] = useState(false)

  // Charger les données de l'action et générer une prédiction
  useEffect(() => {
    loadStockAndPrediction()
  }, [selectedSymbol, useAI])

  const loadStockAndPrediction = async () => {
    setLoading(true)
    setError(null)

    try {
      // Charger les données de l'action
      const data = await getStockData(selectedSymbol)
      setStockData(data)

      // Générer une prédiction
      if (data.history && data.history.length >= 30) {
        const result = await generatePrediction(
          selectedSymbol,
          data.history,
          {
            algorithm: useAI ? "ai" : "ensemble",
            days: 30,
          },
          data, // Passer les données complètes pour l'IA
        )
        setPrediction(result)
      } else {
        throw new Error("Données historiques insuffisantes")
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement des données:", err)
      setError(err.message || "Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  // Déterminer l'icône de tendance
  const TrendIcon = prediction?.trend === "up" ? ArrowUp : prediction?.trend === "down" ? ArrowDown : Minus

  // Déterminer la couleur de tendance
  const trendColor =
    prediction?.trend === "up" ? "text-green-500" : prediction?.trend === "down" ? "text-red-500" : "text-yellow-500"

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Prédictions de marché</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUseAI(!useAI)}
              className={useAI ? "bg-primary/10" : ""}
            >
              <Brain className="h-4 w-4 mr-1" />
              IA
            </Button>
            <Button variant="ghost" size="icon" onClick={loadStockAndPrediction} disabled={loading}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir une action" />
            </SelectTrigger>
            <SelectContent>
              {popularStocks.map((symbol) => (
                <SelectItem key={symbol} value={symbol}>
                  {symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={loadStockAndPrediction}>
              Réessayer
            </Button>
          </div>
        ) : stockData && prediction ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{stockData.name}</h3>
                <p className="text-sm text-muted-foreground">{stockData.symbol}</p>
              </div>
              <div className="text-right">
                <div className="font-bold">{formatPrice(stockData.price)}</div>
                <div className={`text-sm ${stockData.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {stockData.change >= 0 ? "+" : ""}
                  {stockData.change.toFixed(2)} ({stockData.percentChange.toFixed(2)}%)
                </div>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium flex items-center">
                  {useAI && <Brain className="h-3 w-3 mr-1" />}
                  Prévision à 30 jours
                </h4>
                <Badge
                  variant={
                    prediction.trend === "up" ? "success" : prediction.trend === "down" ? "destructive" : "outline"
                  }
                >
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {prediction.trend === "up" ? "Haussier" : prediction.trend === "down" ? "Baissier" : "Neutre"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Objectif 7 jours</p>
                  <div className="flex items-baseline">
                    <span className="font-semibold">{formatPrice(prediction.shortTermTarget || 0)}</span>
                    {prediction.shortTermTarget && (
                      <span
                        className={`ml-1 text-xs ${
                          prediction.shortTermTarget > stockData.price ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {((prediction.shortTermTarget / stockData.price - 1) * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Objectif 30 jours</p>
                  <div className="flex items-baseline">
                    <span className="font-semibold">{formatPrice(prediction.longTermTarget || 0)}</span>
                    {prediction.longTermTarget && (
                      <span
                        className={`ml-1 text-xs ${
                          prediction.longTermTarget > stockData.price ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {((prediction.longTermTarget / stockData.price - 1) * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Afficher le raisonnement de l'IA si disponible */}
              {useAI && prediction.aiReasoning && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <p className="line-clamp-2">{prediction.aiReasoning}</p>
                </div>
              )}
            </div>

            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>
                Confiance: {(prediction.metrics.confidence || 0).toFixed(2) * 100}% | Basé sur{" "}
                {stockData.history.length} jours d'historique
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Aucune donnée disponible</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
