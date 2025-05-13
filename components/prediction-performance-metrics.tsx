"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import {
  calculatePredictionMetrics,
  getAlgorithmPerformance,
  type PredictionMetrics,
  type AlgorithmPerformance,
} from "@/lib/prediction-history-service"
import { Loader2, TrendingUp, TrendingDown, Minus, BarChart3, PieChart } from "lucide-react"

interface PredictionPerformanceMetricsProps {
  symbol?: string
  algorithm?: string
}

export function PredictionPerformanceMetrics({ symbol, algorithm }: PredictionPerformanceMetricsProps) {
  const [metrics, setMetrics] = useState<PredictionMetrics | null>(null)
  const [algorithmPerformance, setAlgorithmPerformance] = useState<AlgorithmPerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Charger les métriques
  useEffect(() => {
    async function loadMetrics() {
      setIsLoading(true)
      try {
        const metricsData = await calculatePredictionMetrics(symbol, algorithm)
        setMetrics(metricsData)

        const performanceData = await getAlgorithmPerformance()
        setAlgorithmPerformance(performanceData)
      } catch (error) {
        console.error("Erreur lors du chargement des métriques:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMetrics()
  }, [symbol, algorithm])

  // Préparer les données pour le graphique de comparaison des algorithmes
  const algorithmComparisonData = algorithmPerformance.map((perf) => ({
    name: perf.algorithm,
    accuracy: perf.metrics.averageAccuracy,
    successRate: perf.metrics.successRate,
    trend: perf.recentTrend,
  }))

  // Obtenir la couleur en fonction de la valeur
  function getColorByValue(value: number, type: "accuracy" | "error" = "accuracy"): string {
    if (type === "accuracy") {
      if (value >= 90) return "bg-green-500"
      if (value >= 75) return "bg-yellow-500"
      if (value >= 60) return "bg-orange-500"
      return "bg-red-500"
    } else {
      if (value <= 5) return "bg-green-500"
      if (value <= 10) return "bg-yellow-500"
      if (value <= 15) return "bg-orange-500"
      return "bg-red-500"
    }
  }

  // Obtenir l'icône de tendance
  function getTrendIcon(trend: "improving" | "declining" | "stable") {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case "stable":
        return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Performance des Prédictions</CardTitle>
        <CardDescription>Analysez la précision et la fiabilité des différents modèles de prédiction</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !metrics ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune donnée de performance disponible</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">
                <PieChart className="h-4 w-4 mr-2" />
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="comparison">
                <BarChart3 className="h-4 w-4 mr-2" />
                Comparaison
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-1">Prédictions totales</h3>
                    <div className="text-2xl font-bold">{metrics.totalPredictions}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {metrics.completedPredictions} complétées (
                      {Math.round((metrics.completedPredictions / metrics.totalPredictions) * 100)}%)
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-1">Précision moyenne</h3>
                    <div className="text-2xl font-bold">{metrics.averageAccuracy.toFixed(2)}%</div>
                    <Progress
                      value={metrics.averageAccuracy}
                      className="h-2 mt-2"
                      indicatorClassName={getColorByValue(metrics.averageAccuracy)}
                    />
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-1">Taux de succès</h3>
                    <div className="text-2xl font-bold">{metrics.successRate.toFixed(2)}%</div>
                    <div className="text-xs text-muted-foreground mt-1">Prédictions dans la bonne direction</div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-1">Erreur moyenne</h3>
                    <div className="text-2xl font-bold">{metrics.meanPercentageError.toFixed(2)}%</div>
                    <div className="text-xs text-muted-foreground mt-1">Écart moyen entre prédiction et réalité</div>
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-3">Performance par algorithme</h3>
                  <div className="space-y-4">
                    {algorithmPerformance.map((perf) => (
                      <div key={perf.algorithm} className="flex items-center">
                        <div className="w-24 flex-shrink-0">
                          <Badge variant="outline">{perf.algorithm}</Badge>
                        </div>
                        <div className="flex-grow mx-4">
                          <Progress
                            value={perf.metrics.averageAccuracy}
                            className="h-2"
                            indicatorClassName={getColorByValue(perf.metrics.averageAccuracy)}
                          />
                        </div>
                        <div className="w-16 text-right">{perf.metrics.averageAccuracy.toFixed(1)}%</div>
                        <div className="w-8 flex justify-center ml-2">{getTrendIcon(perf.recentTrend)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>
                    <strong>Note:</strong> Ces métriques sont calculées uniquement sur les prédictions complétées
                    (celles dont la date cible est passée et pour lesquelles nous avons les prix réels).
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comparison">
              <div className="space-y-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={algorithmComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar name="Précision (%)" dataKey="accuracy" fill="#8884d8">
                        {algorithmComparisonData.map((entry, index) => (
                          <Cell
                            key={`cell-accuracy-${index}`}
                            fill={entry.accuracy >= 80 ? "#4ade80" : entry.accuracy >= 70 ? "#facc15" : "#f87171"}
                          />
                        ))}
                      </Bar>
                      <Bar name="Taux de succès (%)" dataKey="successRate" fill="#82ca9d">
                        {algorithmComparisonData.map((entry, index) => (
                          <Cell
                            key={`cell-success-${index}`}
                            fill={entry.successRate >= 80 ? "#4ade80" : entry.successRate >= 70 ? "#facc15" : "#f87171"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Algorithme</th>
                        <th className="text-right py-2 px-2">Prédictions</th>
                        <th className="text-right py-2 px-2">Précision</th>
                        <th className="text-right py-2 px-2">Taux de succès</th>
                        <th className="text-right py-2 px-2">Erreur moyenne</th>
                        <th className="text-center py-2 px-2">Tendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {algorithmPerformance.map((perf) => (
                        <tr key={perf.algorithm} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-2">
                            <Badge variant="outline">{perf.algorithm}</Badge>
                          </td>
                          <td className="py-2 px-2 text-right">
                            {perf.metrics.completedPredictions}/{perf.metrics.totalPredictions}
                          </td>
                          <td className="py-2 px-2 text-right">
                            <span
                              className={`font-medium ${
                                perf.metrics.averageAccuracy >= 80
                                  ? "text-green-500"
                                  : perf.metrics.averageAccuracy >= 70
                                    ? "text-yellow-500"
                                    : "text-red-500"
                              }`}
                            >
                              {perf.metrics.averageAccuracy.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right">{perf.metrics.successRate.toFixed(2)}%</td>
                          <td className="py-2 px-2 text-right">{perf.metrics.meanPercentageError.toFixed(2)}%</td>
                          <td className="py-2 px-2 text-center">{getTrendIcon(perf.recentTrend)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg text-sm">
                  <h3 className="font-medium mb-2">Interprétation des métriques</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>
                      <strong>Précision</strong>: Mesure à quel point les prédictions sont proches des valeurs réelles.
                    </li>
                    <li>
                      <strong>Taux de succès</strong>: Pourcentage de prédictions qui ont correctement anticipé la
                      direction du mouvement (hausse ou baisse).
                    </li>
                    <li>
                      <strong>Erreur moyenne</strong>: Écart moyen en pourcentage entre les prix prédits et les prix
                      réels.
                    </li>
                    <li>
                      <strong>Tendance</strong>: Indique si la performance de l'algorithme s'améliore, se dégrade ou
                      reste stable sur les prédictions récentes.
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
