"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowUp,
  ArrowDown,
  Minus,
  TrendingUp,
  BarChart4,
  RefreshCw,
  AlertTriangle,
  Brain,
  Activity,
  Eye,
  Globe,
  MessageCircle,
  Key,
  Info,
  Zap,
} from "lucide-react"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Area,
  AreaChart,
  Legend,
} from "recharts"
import { formatPrice } from "@/lib/utils"
import type { StockData } from "@/lib/stock-service"
import type { PredictionAlgorithm } from "@/lib/prediction-service"
import type { EnhancedPredictionResult } from "@/lib/enhanced-prediction-service"
import { PredictionAnalysis } from "./prediction-analysis"

interface EnhancedStockPredictionProps {
  stock: StockData
  days?: number
  defaultAlgorithm?: PredictionAlgorithm
  showConfidenceInterval?: boolean
  showTechnicalAnalysis?: boolean
  showMacroeconomicAnalysis?: boolean
  showSentimentAnalysis?: boolean
}

export function EnhancedStockPrediction({
  stock,
  days = 30,
  defaultAlgorithm = "ai-enhanced",
  showConfidenceInterval = true,
  showTechnicalAnalysis = true,
  showMacroeconomicAnalysis = true,
  showSentimentAnalysis = true,
}: EnhancedStockPredictionProps) {
  const [predictionResult, setPredictionResult] = useState<EnhancedPredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [algorithm, setAlgorithm] = useState<PredictionAlgorithm | "ai-enhanced">(defaultAlgorithm)
  const [showConfidence, setShowConfidence] = useState(showConfidenceInterval)
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false)
  const [apiStatus, setApiStatus] = useState<{ hasOpenAiKey: boolean }>({ hasOpenAiKey: false })
  const [fallbackMode, setFallbackMode] = useState(false)

  // Charger le statut de l'API OpenAI
  useEffect(() => {
    async function fetchApiStatus() {
      try {
        const response = await fetch(`/api/status/api-keys`)
        if (response.ok) {
          const data = await response.json()
          setApiStatus(data)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du statut des API:", error)
      }
    }

    fetchApiStatus()
  }, [])

  // Générer une prédiction lorsque le stock ou l'algorithme change
  useEffect(() => {
    generatePredictionData()
  }, [stock.symbol, algorithm])

  // Fonction pour générer les données de prédiction
  const generatePredictionData = async () => {
    setLoading(true)
    setError(null)
    setFallbackMode(false)
    setAlgorithm("ai-enhanced")

    try {
      // Vérifier que nous avons suffisamment de données historiques
      if (!stock.history || stock.history.length < 30) {
        throw new Error("Données historiques insuffisantes pour générer une prédiction")
      }

      // Appeler la route API enrichie
      try {
        // Appeler la route API enrichie
        const response = await fetch(`/api/predictions/ai-enhanced`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symbol: stock.symbol,
            days,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erreur lors de la génération de prédictions IA enrichies")
        }

        const enhancedPrediction = await response.json()
        setPredictionResult(enhancedPrediction)
      } catch (enhancedError) {
        console.error("Erreur lors de l'appel à l'API de prédiction IA enrichie:", enhancedError)
        throw enhancedError
      }
    } catch (err: any) {
      console.error("Erreur lors de la génération de la prédiction:", err)
      setError(err.message || "Erreur lors de la génération de la prédiction")
    } finally {
      setLoading(false)
    }
  }

  // Formater les données pour le graphique
  const chartData = predictionResult
    ? predictionResult.points.map((point) => {
        const dataPoint: any = {
          date: point.date,
          price: point.price,
          type: point.isEstimate ? "estimate" : "actual",
        }

        // Ajouter les intervalles de confiance s'ils existent
        if (showConfidence && predictionResult.confidenceInterval && point.isEstimate) {
          const upperIndex = predictionResult.points.findIndex((p) => p.date === point.date && p.isEstimate)
          const lowerIndex = upperIndex

          if (upperIndex >= 0 && upperIndex < predictionResult.confidenceInterval.upper.length) {
            dataPoint.upperBound = predictionResult.confidenceInterval.upper[upperIndex].price
            dataPoint.lowerBound = predictionResult.confidenceInterval.lower[lowerIndex].price
          }
        }

        // Ajouter les intervalles de confiance spécifiques au point si disponibles
        if (showConfidence && point.confidenceHigh && point.confidenceLow && point.isEstimate) {
          dataPoint.upperBound = point.confidenceHigh
          dataPoint.lowerBound = point.confidenceLow
        }

        return dataPoint
      })
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

  // Vérifier si nous avons des données d'analyse avancée
  const hasAdvancedAnalysis =
    predictionResult &&
    (predictionResult.technicalAnalysis || predictionResult.macroeconomicAnalysis || predictionResult.sentimentAnalysis)

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
        <CardDescription>Prévision sur {days} jours basée sur l'analyse multi-factorielle</CardDescription>
      </CardHeader>

      <CardContent>
        {algorithm === "ai" && !apiStatus.hasOpenAiKey && (
          <div className="mb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-yellow-800 text-sm flex items-start">
              <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Clé API OpenAI non configurée</p>
                <p className="mt-1">
                  Les prédictions IA utiliseront l'algorithme d'ensemble comme solution de secours. Pour utiliser les
                  prédictions basées sur l'IA, veuillez{" "}
                  <a href="/settings/api" className="underline font-medium">
                    configurer votre clé API
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        {fallbackMode && algorithm === "ai" && (
          <div className="mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-800 text-sm flex items-start">
              <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Mode de secours activé</p>
                <p className="mt-1">
                  L'algorithme d'ensemble est utilisé comme solution de secours car la clé API OpenAI n'est pas
                  disponible. Les résultats peuvent différer des prédictions IA complètes.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="mb-4 flex items-center">
            <Badge variant="outline" className="flex items-center">
              <Zap className="h-3 w-3 mr-1" />
              IA+ (Prédiction avancée)
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfidence(!showConfidence)}
              className={showConfidence ? "bg-primary/10" : ""}
            >
              <Eye className="h-3 w-3 mr-1" />
              Intervalle
            </Button>

            {hasAdvancedAnalysis && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
                className={showAnalysisPanel ? "bg-primary/10" : ""}
              >
                <Activity className="h-3 w-3 mr-1" />
                Analyses
              </Button>
            )}
          </div>
        </div>

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
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={generatePredictionData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>

              {error.includes("Clé API") && (
                <Button variant="default" size="sm" onClick={() => (window.location.href = "/settings/api")}>
                  <Key className="h-4 w-4 mr-2" />
                  Configurer les API
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {showConfidence && (predictionResult?.confidenceInterval || chartData.some((d) => d.upperBound)) ? (
                  <AreaChart data={chartData}>
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
                    <Legend />
                    {predictionStartIndex > 0 && (
                      <ReferenceLine
                        x={chartData[predictionStartIndex].date}
                        stroke="#888"
                        strokeDasharray="3 3"
                        label={{ value: "Aujourd'hui", position: "insideTopRight" }}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="upperBound"
                      stroke="transparent"
                      fill="var(--color-price)"
                      fillOpacity={0.1}
                      name="Intervalle de confiance"
                    />
                    <Area
                      type="monotone"
                      dataKey="lowerBound"
                      stroke="transparent"
                      fill="var(--color-price)"
                      fillOpacity={0.1}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="var(--color-price)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                      name="Prix prédit"
                      strokeDasharray={(d) => (d.type === "estimate" ? "5 5" : "0")}
                    />
                  </AreaChart>
                ) : (
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
                )}
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

            {/* Afficher les catalyseurs et risques pour l'IA enrichie */}
            {algorithm === "ai-enhanced" && predictionResult && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {predictionResult.catalysts && predictionResult.catalysts.length > 0 && (
                  <div className="rounded-lg bg-muted p-3">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Catalyseurs potentiels</div>
                    <ul className="text-sm space-y-1">
                      {predictionResult.catalysts.map((catalyst, index) => (
                        <li key={index} className="flex items-start">
                          <ArrowUp className="h-3 w-3 text-green-500 mr-2 mt-1" />
                          <span>{catalyst}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {predictionResult.risks && predictionResult.risks.length > 0 && (
                  <div className="rounded-lg bg-muted p-3">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Risques identifiés</div>
                    <ul className="text-sm space-y-1">
                      {predictionResult.risks.map((risk, index) => (
                        <li key={index} className="flex items-start">
                          <ArrowDown className="h-3 w-3 text-red-500 mr-2 mt-1" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Afficher le panneau d'analyse si demandé */}
            {showAnalysisPanel && predictionResult && (
              <div className="mt-4">
                <PredictionAnalysis prediction={predictionResult} />
              </div>
            )}

            {/* Afficher le résumé des analyses si non affiché en détail */}
            {!showAnalysisPanel && predictionResult && (
              <div className="mt-4 flex flex-wrap gap-2">
                {predictionResult.technicalAnalysis && (
                  <Badge
                    variant={
                      predictionResult.technicalAnalysis.trend === "up"
                        ? "success"
                        : predictionResult.technicalAnalysis.trend === "down"
                          ? "destructive"
                          : "outline"
                    }
                    className="flex items-center"
                  >
                    <BarChart4 className="h-3 w-3 mr-1" />
                    Technique:{" "}
                    {predictionResult.technicalAnalysis.trend === "up"
                      ? "Positif"
                      : predictionResult.technicalAnalysis.trend === "down"
                        ? "Négatif"
                        : "Neutre"}
                  </Badge>
                )}
                {predictionResult.macroeconomicAnalysis && (
                  <Badge
                    variant={
                      predictionResult.macroeconomicAnalysis.impact === "positive"
                        ? "success"
                        : predictionResult.macroeconomicAnalysis.impact === "negative"
                          ? "destructive"
                          : "outline"
                    }
                    className="flex items-center"
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    Macro:{" "}
                    {predictionResult.macroeconomicAnalysis.impact === "positive"
                      ? "Positif"
                      : predictionResult.macroeconomicAnalysis.impact === "negative"
                        ? "Négatif"
                        : "Neutre"}
                  </Badge>
                )}
                {predictionResult.sentimentAnalysis && (
                  <Badge
                    variant={
                      predictionResult.sentimentAnalysis.impact === "positive"
                        ? "success"
                        : predictionResult.sentimentAnalysis.impact === "negative"
                          ? "destructive"
                          : "outline"
                    }
                    className="flex items-center"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Sentiment:{" "}
                    {predictionResult.sentimentAnalysis.impact === "positive"
                      ? "Positif"
                      : predictionResult.sentimentAnalysis.impact === "negative"
                        ? "Négatif"
                        : "Neutre"}
                  </Badge>
                )}
              </div>
            )}

            {/* Afficher le raisonnement de l'IA si disponible */}
            {(algorithm === "ai" || algorithm === "ai-enhanced") && predictionResult?.aiReasoning && (
              <div className="mt-4 p-3 rounded-lg bg-muted">
                <div className="text-sm font-medium mb-1 flex items-center">
                  <Brain className="h-4 w-4 mr-1" />
                  Analyse de l'IA
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
            <BarChart4 className="h-3 w-3 mr-1" />
            <span>
              Basé sur {stock.history.length} jours d'historique avec{" "}
              <span className="font-medium">l'IA enrichie (Alpha Vantage + Analyse avancée)</span>
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
