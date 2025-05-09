"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUp, ArrowDown, Minus, TrendingUp, BarChart4, RefreshCw, AlertTriangle } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts"
import { formatPrice } from "@/lib/utils"
import type { StockData } from "@/lib/stock-service"
import { generatePrediction, type PredictionAlgorithm, type PredictionResult } from "@/lib/prediction-service"

interface StockPredictionProps {
  stock: StockData
  days?: number
}

export function StockPrediction({ stock, days = 30 }: StockPredictionProps) {
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [algorithm, setAlgorithm] = useState<PredictionAlgorithm>("ensemble")

  // Générer une prédiction lorsque le stock ou l'algorithme change
  useEffect(() => {
    generatePredictionData()
  }, [stock.symbol, algorithm])

  // Fonction pour générer les données de prédiction
  const generatePredictionData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Vérifier que nous avons suffisamment de données historiques
      if (!stock.history || stock.history.length < 30) {
        throw new Error("Données historiques insuffisantes pour générer une prédiction")
      }

      // Générer la prédiction
      const result = await generatePrediction(stock.symbol, stock.history, {
        algorithm,
        days,
      })

      setPredictionResult(result)
    } catch (err: any) {
      console.error("Erreur lors de la génération de la prédiction:", err)
      setError(err.message || "Erreur lors de la génération de la prédiction")
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

  // Déterminer la couleur en fonction de la tendance
  const trendColor =
    predictionResult?.trend === "up"
      ? "text-green-500"
      : predictionResult?.trend === "down"
        ? "text-red-500"
        : "text-yellow-500"

  // Déterminer l'icône en fonction de la tendance
  const TrendIcon = predictionResult?.trend === "up" ? ArrowUp : predictionResult?.trend === "down" ? ArrowDown : Minus

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Prédiction de prix</span>
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
        <CardDescription>Prévision sur {days} jours basée sur l'analyse des données historiques</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue={algorithm} onValueChange={(value) => setAlgorithm(value as PredictionAlgorithm)}>
          <TabsList className="mb-4">
            <TabsTrigger value="sma">SMA</TabsTrigger>
            <TabsTrigger value="ema">EMA</TabsTrigger>
            <TabsTrigger value="linear">Linéaire</TabsTrigger>
            <TabsTrigger value="polynomial">Polynomial</TabsTrigger>
            <TabsTrigger value="ensemble">Ensemble</TabsTrigger>
          </TabsList>

          <TabsContent value={algorithm}>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-[250px] w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="h-10 w-10 text-yellow-500 mb-2" />
                <p className="text-muted-foreground">{error}</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={generatePredictionData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            ) : (
              <>
                <div className="h-[250px] w-full">
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
                        <span className="text-2xl font-semibold">
                          {formatPrice(predictionResult.shortTermTarget || 0)}
                        </span>
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
                        <span className="text-2xl font-semibold">
                          {formatPrice(predictionResult.longTermTarget || 0)}
                        </span>
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
              </>
            )}
          </TabsContent>
        </Tabs>
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
            <BarChart4 className="h-3 w-3 mr-1" />
            <span>
              Basé sur {stock.history.length} jours d'historique avec l'algorithme{" "}
              {algorithm === "sma"
                ? "SMA"
                : algorithm === "ema"
                  ? "EMA"
                  : algorithm === "linear"
                    ? "Régression linéaire"
                    : algorithm === "polynomial"
                      ? "Régression polynomiale"
                      : "Ensemble"}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
