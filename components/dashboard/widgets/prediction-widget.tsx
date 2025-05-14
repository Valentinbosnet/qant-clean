"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { ArrowUpIcon, ArrowDownIcon, RefreshCwIcon, AlertCircleIcon } from "lucide-react"
import { useStockModal } from "@/hooks/use-stock-modal"
import { fetchStockData } from "@/lib/stock-service"
import { generatePrediction, type PredictionResult } from "@/lib/prediction-service"
import type { WidgetConfig } from "@/lib/dashboard-service"

interface PredictionWidgetProps {
  config: WidgetConfig
}

export function PredictionWidget({ config }: PredictionWidgetProps) {
  const [stockData, setStockData] = useState<any | null>(null)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<string>("30d")
  const { openModal } = useStockModal()

  const symbol = config.settings?.symbol || "AAPL"
  const days = config.settings?.days || 30
  const algorithm = config.settings?.algorithm || "ensemble"

  useEffect(() => {
    loadData()
  }, [symbol, days, algorithm, period])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Charger les données de l'action
      const data = await fetchStockData(symbol, period)
      setStockData(data)

      // Générer une prédiction
      if (data.history && data.history.length >= 30) {
        const result = await generatePrediction(
          symbol,
          data.history,
          {
            algorithm: algorithm,
            days: days,
          },
          data,
        )
        setPrediction(result)
      } else {
        setError("Données historiques insuffisantes")
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement des données:", err)
      setError(err.message || "Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  // Préparer les données pour le graphique
  const getChartData = () => {
    if (!prediction || !stockData) return []

    // Combiner les données historiques et les prédictions
    const chartData = []

    // Ajouter quelques points historiques d'abord
    const historicalPoints = stockData.history.slice(-30).reverse()
    for (let i = 0; i < historicalPoints.length; i++) {
      chartData.push({
        date: historicalPoints[i].date,
        price: historicalPoints[i].price,
        type: "historical",
      })
    }

    // Ajouter les prédictions
    const predictionPoints = prediction.points.filter((p) => p.isEstimate)
    for (let i = 0; i < predictionPoints.length; i++) {
      chartData.push({
        date: predictionPoints[i].date,
        price: predictionPoints[i].price,
        type: "prediction",
      })
    }

    return chartData
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    return `${d.getDate()}/${d.getMonth() + 1}`
  }

  const getPredictionSummary = () => {
    if (!prediction) return null

    const lastHistorical = prediction.points.find((p) => !p.isEstimate)
    const lastPrediction = prediction.points[prediction.points.length - 1]

    if (!lastHistorical || !lastPrediction) return null

    const change = lastPrediction.price - lastHistorical.price
    const percentChange = (change / lastHistorical.price) * 100

    return {
      direction: change >= 0 ? "up" : "down",
      change: Math.abs(change).toFixed(2),
      percentChange: Math.abs(percentChange).toFixed(2),
    }
  }

  const summary = getPredictionSummary()

  if (loading) {
    return (
      <Card className="w-full h-full">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-[200px] w-full mb-4" />
          <div className="flex justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full h-full">
        <CardContent className="p-4 flex flex-col items-center justify-center h-full">
          <AlertCircleIcon className="text-red-500 mb-2 h-10 w-10" />
          <p className="text-center text-red-500">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={loadData}>
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full h-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">{symbol}</h3>
            <p className="text-sm text-muted-foreground">Prédiction {algorithm}</p>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="mr-2" onClick={loadData}>
              <RefreshCwIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => openModal(symbol)}>
              Détails
            </Button>
          </div>
        </div>

        <Tabs defaultValue="chart">
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Graphique</TabsTrigger>
            <TabsTrigger value="summary">Résumé</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any) => [`$${value}`, "Prix"]}
                  labelFormatter={(label) => formatDate(label)}
                />
                <ReferenceLine
                  x={prediction?.points.find((p) => p.isEstimate)?.date}
                  stroke="#888"
                  strokeDasharray="3 3"
                  label={{ value: "Prédiction", position: "insideTopRight", fontSize: 10 }}
                />
                <Line type="monotone" dataKey="price" stroke="#8884d8" dot={{ r: 1 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="summary">
            {summary && (
              <div className="p-4 border rounded-md">
                <div className="flex items-center mb-4">
                  {summary.direction === "up" ? (
                    <ArrowUpIcon className="text-green-500 mr-2 h-6 w-6" />
                  ) : (
                    <ArrowDownIcon className="text-red-500 mr-2 h-6 w-6" />
                  )}
                  <div>
                    <p className="font-semibold">Prévision sur {days} jours:</p>
                    <p className={summary.direction === "up" ? "text-green-500" : "text-red-500"}>
                      {summary.direction === "up" ? "+" : "-"}${summary.change} ({summary.percentChange}%)
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Confiance: {prediction?.confidence || "N/A"}%</p>
                <p className="text-sm text-muted-foreground">Basé sur: {algorithm}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
          <span>Dernière mise à jour: {new Date().toLocaleTimeString()}</span>
          <span>Source: IA+ Prediction</span>
        </div>
      </CardContent>
    </Card>
  )
}
