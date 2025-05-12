"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUp, ArrowDown, Minus, TrendingUp, RefreshCw, AlertTriangle, Brain, Zap, Sparkles } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts"
import { formatPrice } from "@/lib/utils"
import type { StockData } from "@/lib/stock-service"
import type { PredictionResult } from "@/lib/prediction-service"

interface LightweightStockPredictionProps {
  stock: StockData
  days?: number
}

export function LightweightStockPrediction({ stock, days = 30 }: LightweightStockPredictionProps) {
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Générer une prédiction au chargement
  useEffect(() => {
    generatePredictionData()
  }, [stock.symbol, retryCount])

  // Fonction pour générer les données de prédiction
  const generatePredictionData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Vérifier que nous avons suffisamment de données historiques
      if (!stock.history || stock.history.length < 10) {
        setError("Données historiques insuffisantes pour générer une prédiction")
        setLoading(false)
        return
      }

      // Appeler la route API légère
      console.log(`Calling lightweight prediction API for ${stock.symbol} (${days} days)`)

      const startTime = Date.now()
      const response = await fetch(`/api/predictions/lightweight`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: stock.symbol,
          days,
        }),
        cache: "no-store",
      })

      const requestTime = Date.now() - startTime
      console.log(`API request completed in ${requestTime}ms`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("API response error:", errorData)
        throw new Error(errorData.error || `Erreur serveur: ${response.status}`)
      }

      const prediction = await response.json()
      console.log("Received prediction data - Algorithm:", prediction.algorithm)
      setPredictionResult(prediction)
    } catch (err: any) {
      console.error("Error generating prediction:", err)
      setError(err instanceof Error ? err.message : "Une erreur inattendue s'est produite")
    } finally {
      setLoading(false)
    }
  }

  // Formater les données pour le graphique
  const chartData = predictionResult
    ? predictionResult.points.map((point) => ({
        date: point.date,
        price: point.price,
        type: point.isEstimate ? "estimate" : "actual",
      }))
    : []

  // Trouver l'index où les prédictions commencent
  const predictionStartIndex = chartData.findIndex((point) => point.type === "estimate")

  // Obtenir le dernier prix réel et le dernier prix prédit
  const lastActualPrice = stock.price
  const lastPredictedPrice = predictionResult ? predictionResult.points[predictionResult.points.length - 1].price : 0

  // Calculer le changement en pourcentage
  const predictedChange = lastPredictedPrice / lastActualPrice - 1
  const predictedChangePercent = (predictedChange * 100).toFixed(2)

  // Déterminer l'icône en fonction de la tendance
  const TrendIcon = predictionResult?.trend === "up" ? ArrowUp : predictionResult?.trend === "down" ? ArrowDown : Minus

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Prédiction Rapide</span>
          {predictionResult && (
            <Badge
              variant={
                predictionResult.trend === "up"
                  ? "success"
                  : predictionResult.trend === "down"
                    ? "destructive"
                    : "outline"
              }
              className="ml-2"
            >
              <TrendIcon className="h-3 w-3 mr-1" />
              {predictionResult.trend === "up" ? "Haussier" : predictionResult.trend === "down" ? "Baissier" : "Neutre"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="flex items-center">
          <Sparkles className="h-3 w-3 mr-1" />
          Prévision optimisée sur {days} jours
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-[200px] w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-10 w-10 text-yellow-500 mb-2" />
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setRetryCount(retryCount + 1)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getDate()}/${date.getMonth() + 1}`
                    }}
                    minTickGap={30}
                  />
                  <YAxis domain={["auto", "auto"]} tickFormatter={(value) => formatPrice(value)} width={60} />
                  <Tooltip
                    formatter={(value: number) => [formatPrice(value), "Prix"]}
                    labelFormatter={(label) => {
                      const date = new Date(label)
                      return date.toLocaleDateString()
                    }}
                  />
                  {predictionStartIndex > 0 && (
                    <ReferenceLine
                      x={chartData[predictionStartIndex].date}
                      stroke="#888"
                      strokeDasharray="3 3"
                      label={{ value: "Aujourd'hui", position: "insideTopRight" }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="var(--color-price)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    strokeDasharray={(d) => (d.type === "estimate" ? "5 5" : "0")}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {predictionResult && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-sm font-medium text-muted-foreground">Objectif 7 jours</div>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-semibold">{formatPrice(predictionResult.shortTermTarget || 0)}</span>
                    {predictionResult.shortTermTarget && (
                      <span
                        className={`ml-2 text-sm ${
                          predictionResult.shortTermTarget > lastActualPrice ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {((predictionResult.shortTermTarget / lastActualPrice - 1) * 100).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-3">
                  <div className="text-sm font-medium text-muted-foreground">Objectif {days} jours</div>
                  <div className="mt-1 flex items-baseline">
                    <span className="text-2xl font-semibold">{formatPrice(predictionResult.longTermTarget || 0)}</span>
                    {predictionResult.longTermTarget && (
                      <span
                        className={`ml-2 text-sm ${
                          predictionResult.longTermTarget > lastActualPrice ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {((predictionResult.longTermTarget / lastActualPrice - 1) * 100).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Afficher le raisonnement de l'IA si disponible */}
            {predictionResult?.aiReasoning && (
              <div className="mt-4 p-3 rounded-lg bg-muted">
                <div className="text-sm font-medium mb-1 flex items-center">
                  <Brain className="h-4 w-4 mr-1" />
                  Analyse
                </div>
                <p className="text-sm text-muted-foreground">{predictionResult.aiReasoning}</p>
              </div>
            )}
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-col items-start">
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center mb-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>
              Confiance: {predictionResult ? `${(predictionResult.metrics.confidence || 0).toFixed(2) * 100}%` : "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <Zap className="h-3 w-3 mr-1" />
            <span>Prédiction ultra-légère optimisée pour la performance</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
