"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  AlertCircle,
  Building2,
  Lightbulb,
  AlertTriangle,
  BarChart4,
} from "lucide-react"
import { getSectorName, type SectorType } from "@/lib/sector-classification"

interface SectorAwarePredictionProps {
  defaultSymbol?: string
}

interface PredictionResult {
  symbol: string
  algorithm: string
  points: Array<{
    date: string
    price: number
    isEstimate: boolean
  }>
  metrics: {
    confidence: number
    accuracy: number
  }
  trend: "up" | "down" | "neutral"
  shortTermTarget: number
  longTermTarget: number
  aiReasoning: string
  sectorInsights?: string
  catalysts?: string[]
  risks?: string[]
  sector?: SectorType
}

export function SectorAwarePrediction({ defaultSymbol = "" }: SectorAwarePredictionProps) {
  const [symbol, setSymbol] = useState(defaultSymbol)
  const [inputSymbol, setInputSymbol] = useState(defaultSymbol)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("prediction")

  // Générer une prédiction
  const generatePrediction = async () => {
    if (!inputSymbol) return

    setSymbol(inputSymbol.toUpperCase())
    setLoading(true)
    setError(null)
    setPrediction(null)

    try {
      const response = await fetch("/api/predictions/sector-aware", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol: inputSymbol.toUpperCase() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const data = await response.json()
      setPrediction(data)
    } catch (err) {
      console.error("Error generating prediction:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  // Générer une prédiction au chargement si un symbole par défaut est fourni
  useEffect(() => {
    if (defaultSymbol) {
      generatePrediction()
    }
  }, [defaultSymbol])

  // Formater le pourcentage de changement
  const formatPercentChange = (current: number, target: number) => {
    const percentChange = ((target - current) / current) * 100
    return (
      <span className={percentChange > 0 ? "text-green-600" : percentChange < 0 ? "text-red-600" : "text-yellow-600"}>
        {percentChange > 0 ? "+" : ""}
        {percentChange.toFixed(2)}%
      </span>
    )
  }

  // Obtenir l'icône de tendance
  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case "down":
        return <TrendingDown className="h-5 w-5 text-red-500" />
      default:
        return <Minus className="h-5 w-5 text-yellow-500" />
    }
  }

  // Obtenir la couleur de tendance
  const getTrendColor = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return "bg-green-100 text-green-800 border-green-200"
      case "down":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="mr-2 h-5 w-5" />
          Prédiction IA spécifique au secteur
        </CardTitle>
        <CardDescription>
          Prédictions boursières optimisées par secteur d'activité pour une meilleure précision
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="symbol">Symbole boursier</Label>
            <div className="flex space-x-2">
              <Input
                id="symbol"
                placeholder="ex: AAPL, MSFT, GOOGL"
                value={inputSymbol}
                onChange={(e) => setInputSymbol(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button onClick={generatePrediction} disabled={loading || !inputSymbol}>
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Générer"}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-[200px] w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-[100px]" />
                <Skeleton className="h-8 w-[100px]" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : prediction ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="prediction">Prédiction</TabsTrigger>
                <TabsTrigger value="sector">Analyse sectorielle</TabsTrigger>
                <TabsTrigger value="catalysts">Catalyseurs & Risques</TabsTrigger>
              </TabsList>

              <TabsContent value="prediction" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Prédiction pour {symbol}</h3>
                  <Badge variant="outline" className={`flex items-center ${getTrendColor(prediction.trend)}`}>
                    {getTrendIcon(prediction.trend)}
                    <span className="ml-1">
                      {prediction.trend === "up" ? "Haussier" : prediction.trend === "down" ? "Baissier" : "Neutre"}
                    </span>
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Objectif 7 jours</h4>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold">${prediction.shortTermTarget.toFixed(2)}</span>
                      <span className="ml-2">
                        {formatPercentChange(
                          prediction.points.find((p) => !p.isEstimate)?.price || 0,
                          prediction.shortTermTarget,
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Objectif 30 jours</h4>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold">${prediction.longTermTarget.toFixed(2)}</span>
                      <span className="ml-2">
                        {formatPercentChange(
                          prediction.points.find((p) => !p.isEstimate)?.price || 0,
                          prediction.longTermTarget,
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Analyse</h4>
                  <p className="text-sm">{prediction.aiReasoning}</p>
                </div>

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Confiance: {(prediction.metrics.confidence * 100).toFixed(0)}%</span>
                  <span>Algorithme: {prediction.algorithm}</span>
                </div>
              </TabsContent>

              <TabsContent value="sector" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Analyse sectorielle</h3>
                  <Badge variant="outline" className="flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    {prediction.sector ? getSectorName(prediction.sector) : "Secteur inconnu"}
                  </Badge>
                </div>

                {prediction.sectorInsights ? (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <BarChart4 className="h-4 w-4 mr-1" />
                      Insights spécifiques au secteur
                    </h4>
                    <p className="text-sm whitespace-pre-line">{prediction.sectorInsights}</p>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>
                      Aucune analyse sectorielle détaillée n'est disponible pour cette prédiction.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Contexte sectoriel</h4>
                  <p className="text-sm">
                    {prediction.sector
                      ? `${symbol} opère dans le secteur ${getSectorName(prediction.sector).toLowerCase()}, qui a ses propres dynamiques et facteurs spécifiques pris en compte dans cette prédiction.`
                      : `Aucune information sectorielle spécifique n'est disponible pour ${symbol}.`}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="catalysts" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Catalyseurs & Risques</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center text-green-800">
                      <Lightbulb className="h-4 w-4 mr-1 text-green-600" />
                      Catalyseurs potentiels
                    </h4>
                    {prediction.catalysts && prediction.catalysts.length > 0 ? (
                      <ul className="space-y-1 text-sm text-green-700">
                        {prediction.catalysts.map((catalyst, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{catalyst}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-green-700">Aucun catalyseur spécifique identifié.</p>
                    )}
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center text-red-800">
                      <AlertTriangle className="h-4 w-4 mr-1 text-red-600" />
                      Risques identifiés
                    </h4>
                    {prediction.risks && prediction.risks.length > 0 ? (
                      <ul className="space-y-1 text-sm text-red-700">
                        {prediction.risks.map((risk, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-red-700">Aucun risque spécifique identifié.</p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Note importante</h4>
                  <p className="text-sm">
                    Les catalyseurs et risques identifiés sont basés sur l'analyse actuelle du marché et peuvent évoluer
                    en fonction des événements futurs. Cette liste n'est pas exhaustive.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <span>Prédictions optimisées par secteur d'activité</span>
        <span>Powered by IA+ Sectorielle</span>
      </CardFooter>
    </Card>
  )
}
