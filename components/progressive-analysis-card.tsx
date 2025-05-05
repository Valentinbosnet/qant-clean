"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, AlertTriangle, TrendingUp, TrendingDown, Loader2, BarChart4 } from "lucide-react"
import type { ProgressiveAnalysis } from "@/lib/progressive-prediction-service"

interface ProgressiveAnalysisCardProps {
  symbol: string
  defaultAnalysis?: ProgressiveAnalysis
}

export default function ProgressiveAnalysisCard({ symbol, defaultAnalysis }: ProgressiveAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<ProgressiveAnalysis | null>(defaultAnalysis || null)
  const [loading, setLoading] = useState<boolean>(!defaultAnalysis)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(defaultAnalysis ? new Date() : null)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)

  const fetchAnalysis = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const response = await fetch(`/api/progressive-analysis?symbol=${symbol}`)

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`)
      }

      const data = await response.json()
      setAnalysis(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError("Impossible de charger l'analyse progressive. Veuillez réessayer.")
      console.error("Erreur lors du chargement de l'analyse progressive:", err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (!defaultAnalysis && symbol) {
      fetchAnalysis()
    }
  }, [symbol, defaultAnalysis])

  // Fonction pour formater les prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(price)
  }

  // Fonction pour formater les pourcentages
  const formatPercentage = (percentage: number) => {
    return `${percentage > 0 ? "+" : ""}${percentage.toFixed(2)}%`
  }

  // Fonction pour obtenir la classe de couleur en fonction de la valeur
  const getColorClass = (value: number) => {
    if (value > 0) return "text-green-500"
    if (value < 0) return "text-red-500"
    return "text-gray-500"
  }

  // Fonction pour obtenir la classe de couleur pour le niveau de confiance
  const getConfidenceLevelClass = (level: string) => {
    switch (level) {
      case "Très élevée":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "Élevée":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "Modérée":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "Faible":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  // Fonction pour formater le temps écoulé
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffSeconds < 10) return "à l'instant"
    if (diffSeconds < 60) return `il y a ${diffSeconds} secondes`

    const diffMinutes = Math.floor(diffSeconds / 60)
    if (diffMinutes < 60) return `il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`

    return date.toLocaleTimeString()
  }

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart4 className="h-5 w-5 mr-2 text-blue-400 animate-pulse" />
            Analyse progressive
          </CardTitle>
          <CardDescription>Chargement de l'analyse pour {symbol}...</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-400">Génération de l'analyse progressive...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart4 className="h-5 w-5 mr-2 text-blue-400" />
            Analyse progressive
          </CardTitle>
          <CardDescription>Une erreur est survenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <AlertTriangle className="h-10 w-10 text-yellow-500 mb-2" />
            <p className="text-gray-300 mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchAnalysis(true)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return null
  }

  return (
    <Card className="bg-gray-800 border-gray-700 mb-6 relative overflow-hidden">
      {/* Indicateur de niveau de confiance */}
      <div className="absolute top-0 right-0 px-2 py-1 rounded-bl-md flex items-center">
        <Badge className={getConfidenceLevelClass(analysis.confidenceLevel)}>
          Confiance: {analysis.confidenceLevel}
        </Badge>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white flex items-center">
              <BarChart4 className="h-5 w-5 mr-2 text-blue-400" />
              Analyse progressive
            </CardTitle>
            <CardDescription>
              {lastUpdated && (
                <span className="text-xs text-gray-400">Dernière mise à jour: {formatTimeAgo(lastUpdated)}</span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-400 mr-2">Précision globale:</span>
            <Progress value={analysis.overallAccuracy * 100} className="h-2 w-24" />
            <span className="text-sm text-gray-300 ml-2">{(analysis.overallAccuracy * 100).toFixed(0)}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="predictions" className="mt-2">
          <TabsList className="bg-gray-700 border-gray-600 mb-4">
            <TabsTrigger value="predictions" className="data-[state=active]:bg-blue-600">
              Prédictions
            </TabsTrigger>
            <TabsTrigger value="historical" className="data-[state=active]:bg-blue-600">
              Historique
            </TabsTrigger>
            <TabsTrigger value="technical" className="data-[state=active]:bg-blue-600">
              Technique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predictions">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Prix actuel</div>
                  <div className="font-bold text-white">{formatPrice(analysis.currentPrice)}</div>
                </div>

                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-400">Précision globale</div>
                    <Badge className={getConfidenceLevelClass(analysis.confidenceLevel)}>
                      {analysis.confidenceLevel}
                    </Badge>
                  </div>
                  <Progress value={analysis.overallAccuracy * 100} className="h-2 mt-2" />
                  <div className="text-right text-sm text-gray-300 mt-1">
                    {(analysis.overallAccuracy * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Prévisions de prix</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <div className="text-xs text-gray-400 mb-1">1 jour</div>
                      <div className="text-xs text-gray-400">
                        Confiance: {(analysis.confidenceScores.oneDay * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-white">{formatPrice(analysis.predictedPrices.oneDay)}</span>
                      {analysis.predictedPrices.oneDay > analysis.currentPrice ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div
                      className={`text-xs ${getColorClass(analysis.predictedPrices.oneDay - analysis.currentPrice)}`}
                    >
                      {formatPercentage(
                        ((analysis.predictedPrices.oneDay - analysis.currentPrice) / analysis.currentPrice) * 100,
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <div className="text-xs text-gray-400 mb-1">1 semaine</div>
                      <div className="text-xs text-gray-400">
                        Confiance: {(analysis.confidenceScores.oneWeek * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-white">{formatPrice(analysis.predictedPrices.oneWeek)}</span>
                      {analysis.predictedPrices.oneWeek > analysis.currentPrice ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div
                      className={`text-xs ${getColorClass(analysis.predictedPrices.oneWeek - analysis.currentPrice)}`}
                    >
                      {formatPercentage(
                        ((analysis.predictedPrices.oneWeek - analysis.currentPrice) / analysis.currentPrice) * 100,
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <div className="text-xs text-gray-400 mb-1">1 mois</div>
                      <div className="text-xs text-gray-400">
                        Confiance: {(analysis.confidenceScores.oneMonth * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-white">{formatPrice(analysis.predictedPrices.oneMonth)}</span>
                      {analysis.predictedPrices.oneMonth > analysis.currentPrice ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div
                      className={`text-xs ${getColorClass(analysis.predictedPrices.oneMonth - analysis.currentPrice)}`}
                    >
                      {formatPercentage(
                        ((analysis.predictedPrices.oneMonth - analysis.currentPrice) / analysis.currentPrice) * 100,
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Comment interpréter cette analyse</h4>
                <p className="text-sm text-gray-300">
                  Cette analyse est basée sur un modèle prédictif progressif qui s'améliore en comparant ses prédictions
                  passées avec les résultats réels. Le niveau de confiance indique la fiabilité estimée des prédictions,
                  avec un minimum de 65%.
                </p>
                <p className="text-sm text-gray-300 mt-2">
                  Les prédictions sont ajustées en fonction des performances historiques du modèle, des indicateurs
                  techniques et des tendances du marché.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="historical">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white mb-2">Historique des prédictions</h4>
              <div className="bg-gray-700 p-3 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-600">
                      <th className="text-left pb-2">Date</th>
                      <th className="text-right pb-2">Précision</th>
                      <th className="text-right pb-2">Facteur d'ajustement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.previousPredictions.map((prediction, index) => (
                      <tr key={index} className="border-b border-gray-600/50">
                        <td className="py-2 text-gray-300">{new Date(prediction.timestamp).toLocaleDateString()}</td>
                        <td className="py-2 text-right text-gray-300">{(prediction.accuracy * 100).toFixed(1)}%</td>
                        <td className="py-2 text-right text-gray-300">{prediction.adjustmentFactor.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Évolution de la précision</h4>
                <div className="h-40 flex items-end">
                  {analysis.previousPredictions.map((prediction, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-4/5 bg-blue-500 rounded-t"
                        style={{ height: `${prediction.accuracy * 100}%` }}
                      ></div>
                      <div className="text-xs text-gray-400 mt-1">N-{analysis.previousPredictions.length - index}</div>
                    </div>
                  ))}
                  <div className="flex-1 flex flex-col items-center">
                    <div
                      className="w-4/5 bg-green-500 rounded-t"
                      style={{ height: `${analysis.overallAccuracy * 100}%` }}
                    ></div>
                    <div className="text-xs text-gray-400 mt-1">Actuel</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="technical">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-2">RSI</h4>
                  <div className="flex items-center">
                    <Progress value={analysis.technicalIndicators.rsi} className="h-2 flex-1" />
                    <span className="text-white ml-2">{analysis.technicalIndicators.rsi.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Survendu</span>
                    <span>Neutre</span>
                    <span>Suracheté</span>
                  </div>
                </div>

                <div className="bg-gray-700 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-white mb-2">MACD</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-400">Valeur</div>
                      <div className="text-white">{analysis.technicalIndicators.macd.value.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Signal</div>
                      <div className="text-white">{analysis.technicalIndicators.macd.signal.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Histogramme</div>
                      <div
                        className={`${analysis.technicalIndicators.macd.histogram > 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {analysis.technicalIndicators.macd.histogram.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Moyennes Mobiles</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-xs text-gray-400">MA20</div>
                    <div className="text-white">{formatPrice(analysis.technicalIndicators.movingAverages.ma20)}</div>
                    <div
                      className={`text-xs ${getColorClass(analysis.technicalIndicators.movingAverages.ma20 - analysis.currentPrice)}`}
                    >
                      {formatPercentage(
                        ((analysis.technicalIndicators.movingAverages.ma20 - analysis.currentPrice) /
                          analysis.currentPrice) *
                          100,
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">MA50</div>
                    <div className="text-white">{formatPrice(analysis.technicalIndicators.movingAverages.ma50)}</div>
                    <div
                      className={`text-xs ${getColorClass(analysis.technicalIndicators.movingAverages.ma50 - analysis.currentPrice)}`}
                    >
                      {formatPercentage(
                        ((analysis.technicalIndicators.movingAverages.ma50 - analysis.currentPrice) /
                          analysis.currentPrice) *
                          100,
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">MA200</div>
                    <div className="text-white">{formatPrice(analysis.technicalIndicators.movingAverages.ma200)}</div>
                    <div
                      className={`text-xs ${getColorClass(analysis.technicalIndicators.movingAverages.ma200 - analysis.currentPrice)}`}
                    >
                      {formatPercentage(
                        ((analysis.technicalIndicators.movingAverages.ma200 - analysis.currentPrice) /
                          analysis.currentPrice) *
                          100,
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => fetchAnalysis(true)}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Rafraîchissement...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Rafraîchir l'analyse
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
