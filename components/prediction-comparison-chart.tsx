"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { getPredictionHistory, type PredictionHistoryEntry } from "@/lib/prediction-history-service"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

interface PredictionComparisonChartProps {
  symbol?: string
  algorithm?: string
  limit?: number
}

export function PredictionComparisonChart({ symbol, algorithm, limit = 10 }: PredictionComparisonChartProps) {
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null)
  const [chartData, setChartData] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"single" | "all">("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "accuracy">("newest")

  // Charger l'historique des prédictions
  useEffect(() => {
    async function loadPredictionHistory() {
      setIsLoading(true)
      try {
        const history = await getPredictionHistory(symbol, algorithm, limit)
        // Trier l'historique selon l'ordre sélectionné
        const sortedHistory = sortPredictionHistory(history, sortOrder)
        setPredictionHistory(sortedHistory)

        // Si aucune prédiction n'est sélectionnée, sélectionner la première
        if (sortedHistory.length > 0 && !selectedPrediction) {
          setSelectedPrediction(sortedHistory[0].id.toString())
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'historique des prédictions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPredictionHistory()
  }, [symbol, algorithm, limit, sortOrder])

  // Préparer les données du graphique
  useEffect(() => {
    if (predictionHistory.length === 0) {
      setChartData([])
      return
    }

    if (viewMode === "single" && selectedPrediction) {
      // Afficher une seule prédiction
      const prediction = predictionHistory.find((p) => p.id.toString() === selectedPrediction)
      if (prediction) {
        setChartData(prepareSinglePredictionData(prediction))
      }
    } else {
      // Afficher toutes les prédictions
      setChartData(prepareAllPredictionsData(predictionHistory))
    }
  }, [predictionHistory, selectedPrediction, viewMode])

  // Trier l'historique des prédictions
  function sortPredictionHistory(
    history: PredictionHistoryEntry[],
    order: "newest" | "oldest" | "accuracy",
  ): PredictionHistoryEntry[] {
    const sortedHistory = [...history]

    switch (order) {
      case "newest":
        return sortedHistory.sort(
          (a, b) => new Date(b.prediction_date).getTime() - new Date(a.prediction_date).getTime(),
        )
      case "oldest":
        return sortedHistory.sort(
          (a, b) => new Date(a.prediction_date).getTime() - new Date(b.prediction_date).getTime(),
        )
      case "accuracy":
        return sortedHistory.sort((a, b) => {
          // Placer les prédictions non complétées à la fin
          if (!a.is_completed && b.is_completed) return 1
          if (a.is_completed && !b.is_completed) return -1
          // Trier par précision (du plus précis au moins précis)
          return (b.accuracy || 0) - (a.accuracy || 0)
        })
      default:
        return sortedHistory
    }
  }

  // Préparer les données pour une seule prédiction
  function prepareSinglePredictionData(prediction: PredictionHistoryEntry): any[] {
    const data: any[] = []

    // Ajouter le point de départ (date de prédiction)
    data.push({
      date: formatDate(prediction.prediction_date),
      actual: prediction.prediction_data.points[0].price,
      predicted: prediction.prediction_data.points[0].price,
      label: "Départ",
    })

    // Ajouter le point cible
    data.push({
      date: formatDate(prediction.target_date),
      actual: prediction.actual_price || null,
      predicted: prediction.predicted_price,
      label: "Cible",
    })

    return data
  }

  // Préparer les données pour toutes les prédictions
  function prepareAllPredictionsData(predictions: PredictionHistoryEntry[]): any[] {
    // Créer un objet pour stocker les données par date cible
    const dataByDate: Record<string, any> = {}

    // Parcourir toutes les prédictions
    predictions.forEach((prediction) => {
      const targetDate = formatDate(prediction.target_date)

      if (!dataByDate[targetDate]) {
        dataByDate[targetDate] = {
          date: targetDate,
          label: targetDate,
        }
      }

      // Ajouter les données de prédiction
      dataByDate[targetDate][`predicted_${prediction.id}`] = prediction.predicted_price
      dataByDate[targetDate][`algorithm_${prediction.id}`] = prediction.algorithm

      // Ajouter le prix réel si disponible
      if (prediction.actual_price) {
        dataByDate[targetDate][`actual_${prediction.id}`] = prediction.actual_price
      }
    })

    // Convertir l'objet en tableau
    return Object.values(dataByDate)
  }

  // Formater une date pour l'affichage
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
  }

  // Calculer le pourcentage d'erreur
  function calculateErrorPercentage(predicted: number, actual: number): number {
    if (!actual) return 0
    return Math.abs((predicted - actual) / actual) * 100
  }

  // Déterminer la couleur en fonction de la précision
  function getAccuracyColor(accuracy: number | undefined): string {
    if (!accuracy) return "text-gray-500"
    if (accuracy >= 90) return "text-green-500"
    if (accuracy >= 75) return "text-yellow-500"
    return "text-red-500"
  }

  // Déterminer l'icône de tendance
  function getTrendIcon(prediction: PredictionHistoryEntry) {
    if (!prediction.is_completed || !prediction.actual_price) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }

    const predictedDirection = prediction.predicted_price > prediction.prediction_data.points[0].price
    const actualDirection = prediction.actual_price > prediction.prediction_data.points[0].price

    if (predictedDirection === actualDirection) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle>Comparaison des Prédictions</CardTitle>
            <CardDescription>Comparez les prédictions passées avec les performances réelles</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={sortOrder} onValueChange={(value: "newest" | "oldest" | "accuracy") => setSortOrder(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus récentes</SelectItem>
                <SelectItem value="oldest">Plus anciennes</SelectItem>
                <SelectItem value="accuracy">Précision</SelectItem>
              </SelectContent>
            </Select>

            <Select value={viewMode} onValueChange={(value: "single" | "all") => setViewMode(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Mode d'affichage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Prédiction unique</SelectItem>
                <SelectItem value="all">Toutes les prédictions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : predictionHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune prédiction trouvée</p>
          </div>
        ) : (
          <div className="space-y-6">
            {viewMode === "single" && (
              <div>
                <label className="text-sm font-medium mb-1 block">Sélectionner une prédiction</label>
                <Select value={selectedPrediction || ""} onValueChange={(value) => setSelectedPrediction(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une prédiction" />
                  </SelectTrigger>
                  <SelectContent>
                    {predictionHistory.map((prediction) => (
                      <SelectItem key={prediction.id} value={prediction.id.toString()}>
                        {prediction.symbol} - {formatDate(prediction.prediction_date)} ({prediction.algorithm})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedPrediction && (
                  <div className="mt-4">
                    {(() => {
                      const prediction = predictionHistory.find((p) => p.id.toString() === selectedPrediction)
                      if (!prediction) return null

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Détails de la prédiction</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Symbole:</span>
                                <span className="font-medium">{prediction.symbol}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Algorithme:</span>
                                <Badge variant="outline">{prediction.algorithm}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Date de prédiction:</span>
                                <span>{formatDate(prediction.prediction_date)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Date cible:</span>
                                <span>{formatDate(prediction.target_date)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Confiance:</span>
                                <span>{Math.round(prediction.confidence * 100)}%</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-1">Résultats</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Prix prédit:</span>
                                <span className="font-medium">{formatPrice(prediction.predicted_price)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Prix réel:</span>
                                <span className="font-medium">
                                  {prediction.actual_price ? formatPrice(prediction.actual_price) : "Non disponible"}
                                </span>
                              </div>
                              {prediction.is_completed && prediction.actual_price && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Erreur:</span>
                                    <span>
                                      {formatPrice(Math.abs(prediction.predicted_price - prediction.actual_price))}(
                                      {calculateErrorPercentage(
                                        prediction.predicted_price,
                                        prediction.actual_price,
                                      ).toFixed(2)}
                                      %)
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Précision:</span>
                                    <span className={getAccuracyColor(prediction.accuracy)}>
                                      {prediction.accuracy ? prediction.accuracy.toFixed(2) : 0}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Direction:</span>
                                    <span className="flex items-center">
                                      {getTrendIcon(prediction)}
                                      <span className="ml-1">
                                        {prediction.predicted_price > prediction.prediction_data.points[0].price
                                          ? "Hausse prédite"
                                          : "Baisse prédite"}
                                      </span>
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}

            <div className="h-80">
              <ChartContainer
                config={{
                  predicted: {
                    label: "Prix prédit",
                    color: "hsl(var(--chart-1))",
                  },
                  actual: {
                    label: "Prix réel",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => formatPrice(value)} />
                    <ChartTooltip
                      content={<ChartTooltipContent formatter={(value) => formatPrice(value as number)} />}
                    />
                    <Legend />

                    {viewMode === "single" ? (
                      <>
                        <Line
                          type="monotone"
                          dataKey="predicted"
                          stroke="var(--color-predicted)"
                          strokeWidth={2}
                          dot={{ r: 5 }}
                          name="Prix prédit"
                        />
                        <Line
                          type="monotone"
                          dataKey="actual"
                          stroke="var(--color-actual)"
                          strokeWidth={2}
                          dot={{ r: 5 }}
                          name="Prix réel"
                        />
                      </>
                    ) : (
                      // Afficher toutes les prédictions
                      predictionHistory.map((prediction, index) => (
                        <React.Fragment key={prediction.id}>
                          <Line
                            type="monotone"
                            dataKey={`predicted_${prediction.id}`}
                            stroke={`hsl(${(index * 30) % 360}, 70%, 50%)`}
                            strokeDasharray="5 5"
                            dot={{ r: 4 }}
                            name={`${prediction.symbol} (${prediction.algorithm})`}
                          />
                          {prediction.is_completed && prediction.actual_price && (
                            <Line
                              type="monotone"
                              dataKey={`actual_${prediction.id}`}
                              stroke={`hsl(${(index * 30) % 360}, 100%, 40%)`}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              name={`${prediction.symbol} (Réel)`}
                            />
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {viewMode === "all" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Symbole</th>
                      <th className="text-left py-2 px-2">Algorithme</th>
                      <th className="text-left py-2 px-2">Date prédiction</th>
                      <th className="text-left py-2 px-2">Date cible</th>
                      <th className="text-right py-2 px-2">Prix prédit</th>
                      <th className="text-right py-2 px-2">Prix réel</th>
                      <th className="text-right py-2 px-2">Précision</th>
                      <th className="text-center py-2 px-2">Direction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictionHistory.map((prediction) => (
                      <tr key={prediction.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2">{prediction.symbol}</td>
                        <td className="py-2 px-2">
                          <Badge variant="outline">{prediction.algorithm}</Badge>
                        </td>
                        <td className="py-2 px-2">{formatDate(prediction.prediction_date)}</td>
                        <td className="py-2 px-2">{formatDate(prediction.target_date)}</td>
                        <td className="py-2 px-2 text-right">{formatPrice(prediction.predicted_price)}</td>
                        <td className="py-2 px-2 text-right">
                          {prediction.actual_price ? formatPrice(prediction.actual_price) : "N/A"}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <span className={getAccuracyColor(prediction.accuracy)}>
                            {prediction.accuracy ? `${prediction.accuracy.toFixed(2)}%` : "N/A"}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">{getTrendIcon(prediction)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
