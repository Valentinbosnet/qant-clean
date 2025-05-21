"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, BarChart2, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import type { HomeWidgetConfig } from "@/lib/home-widgets-service"
import { useStockData } from "@/hooks/use-stock-data"

interface PredictionInsightsWidgetProps {
  config: HomeWidgetConfig
}

export function PredictionInsightsWidget({ config }: PredictionInsightsWidgetProps) {
  const { settings } = config
  const maxItems = settings?.maxItems || 4
  const predictionMode = settings?.predictionMode || "lightweight" // Options: lightweight, enhanced, sector

  const [predictions, setPredictions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { getStockData } = useStockData()

  // Symboles populaires pour les prédictions
  const popularSymbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "AMD"]

  useEffect(() => {
    async function loadPredictions() {
      try {
        setIsLoading(true)

        // Sélectionner quelques symboles aléatoires parmi les populaires
        const selectedSymbols = [...popularSymbols].sort(() => 0.5 - Math.random()).slice(0, maxItems)

        // Obtenir les données actuelles des actions
        const stockDataPromises = selectedSymbols.map((symbol) => getStockData(symbol))
        const stockData = await Promise.all(stockDataPromises)

        // Obtenir les prédictions pour chaque action
        const predictionsPromises = selectedSymbols.map(async (symbol, index) => {
          try {
            const response = await fetch(`/api/predictions/${predictionMode}?symbol=${symbol}`)

            if (!response.ok) {
              throw new Error(`Erreur lors de la récupération de la prédiction pour ${symbol}`)
            }

            const predictionData = await response.json()
            const stock = stockData[index]

            return {
              symbol,
              name: stock?.name || symbol,
              currentPrice: stock?.price || 0,
              predictedPrice: predictionData.predictedPrice || 0,
              changePercent: (predictionData.predictedPrice / stock?.price - 1) * 100 || 0,
              confidence: predictionData.confidence || "Moyenne",
              trend: predictionData.predictedPrice > stock?.price ? "up" : "down",
            }
          } catch (err) {
            console.error(`Erreur pour ${symbol}:`, err)
            // Retourner une prédiction simulée en cas d'erreur
            const stock = stockData[index]
            return {
              symbol,
              name: stock?.name || symbol,
              currentPrice: stock?.price || 0,
              predictedPrice: stock?.price * (1 + (Math.random() * 0.2 - 0.1)),
              changePercent: Math.random() * 20 - 10,
              confidence: Math.random() > 0.5 ? "Moyenne" : "Faible",
              trend: Math.random() > 0.5 ? "up" : "down",
              isSimulated: true,
            }
          }
        })

        const predictionsData = await Promise.all(predictionsPromises)
        setPredictions(predictionsData)
        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des prédictions:", err)
        setError("Impossible de charger les prédictions")
      } finally {
        setIsLoading(false)
      }
    }

    loadPredictions()
  }, [maxItems, predictionMode, getStockData])

  // Afficher un état de chargement
  if (isLoading) {
    return (
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Prédictions IA</h3>
        <div className="space-y-3">
          {Array(maxItems)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-2 sm:p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <Skeleton className="h-5 w-16 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    )
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Prédictions IA</h3>
        <Card className="overflow-hidden">
          <CardContent className="p-4 text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Prédictions IA</h3>
      <div className="space-y-3">
        {predictions.map((prediction) => (
          <Card key={prediction.symbol} className="overflow-hidden">
            <CardContent className="p-2 sm:p-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-sm sm:text-base mr-2">{prediction.symbol}</span>
                    {prediction.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    {prediction.isSimulated && (
                      <AlertTriangle className="h-3 w-3 text-amber-500 ml-1" title="Prédiction simulée" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{prediction.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm">
                    <span className="text-muted-foreground">Actuel:</span> ${prediction.currentPrice.toFixed(2)}
                  </div>
                  <div className="text-xs sm:text-sm">
                    <span className="text-muted-foreground">Prédit:</span> ${prediction.predictedPrice.toFixed(2)}
                  </div>
                  <div
                    className={`text-xs flex items-center justify-end ${
                      prediction.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {prediction.trend === "up" ? "+" : ""}
                    {prediction.changePercent.toFixed(2)}% • {prediction.confidence}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-3 text-center">
        <a href="/predictions" className="text-sm text-primary hover:underline inline-flex items-center">
          <BarChart2 className="h-4 w-4 mr-1" />
          Voir toutes les prédictions
        </a>
      </div>
    </div>
  )
}
