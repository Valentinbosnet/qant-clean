"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SectorAlertsPanel } from "@/components/sector-alerts-panel"
import { SectorAlertsIndicator } from "@/components/sector-alerts-indicator"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Info, Zap } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { EnhancedStockPrediction } from "@/components/enhanced-stock-prediction"
import { PredictionAlerts } from "@/components/prediction-alerts"
import { SectorsDashboard } from "@/components/sectors-dashboard"
import { getStockData } from "@/lib/stock-service"
import type { StockData } from "@/lib/stock-service"
import { formatPrice } from "@/lib/utils"
import type { PredictionAlgorithm } from "@/lib/prediction-service"
import type { EnhancedPredictionResult } from "@/lib/enhanced-prediction-service"
import { Badge } from "@/components/ui/badge"

export default function PredictionsPageClient() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL")
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [predictionResult, setPredictionResult] = useState<EnhancedPredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [predictionDays, setPredictionDays] = useState(30)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<PredictionAlgorithm | "ai-enhanced">("ai-enhanced")

  // Charger les données de l'action sélectionnée
  useEffect(() => {
    loadStockAndPrediction()
  }, [selectedSymbol, predictionDays, selectedAlgorithm])

  const loadStockAndPrediction = async () => {
    setLoading(true)
    setError(null)

    try {
      // Charger les données de l'action
      const data = await getStockData(selectedSymbol)
      setStockData(data)

      // Vérifier que nous avons suffisamment de données historiques
      if (!data.history || data.history.length < 30) {
        throw new Error("Données historiques insuffisantes pour générer une prédiction")
      }

      // Appeler directement l'API de prédiction enrichie
      try {
        const response = await fetch(`/api/predictions/ai-enhanced`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symbol: selectedSymbol,
            days: predictionDays,
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
      console.error("Erreur lors du chargement des données:", err)
      setError(err.message || "Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Prédictions</h1>
        <div className="flex items-center gap-3">
          <SectorAlertsIndicator variant="button" />
          {/* Autres boutons existants... */}
        </div>
      </div>

      {loading && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                La page de prédictions est en cours de chargement. Veuillez patienter quelques instants.
              </p>
            </div>
          </div>
        </div>
      )}

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Information importante</AlertTitle>
        <AlertDescription>
          Les prédictions sont générées à partir de modèles statistiques et d'intelligence artificielle, mais ne
          constituent pas des conseils d'investissement. Les performances passées ne préjugent pas des performances
          futures.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Paramètres de prédiction</h2>
            <p className="text-gray-500">
              Sélectionnez une action et configurez les paramètres de prédiction pour obtenir des analyses détaillées.
            </p>
            <div className="mt-4 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : loading ? (
            <Card>
              <CardContent className="py-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-[400px] w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : stockData ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{stockData.name}</CardTitle>
                      <CardDescription>{stockData.symbol}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{formatPrice(stockData.price)}</div>
                      <div className={`${stockData.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {stockData.change >= 0 ? "+" : ""}
                        {stockData.change.toFixed(2)} ({stockData.percentChange.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <div className="mb-4">
                <div className="flex items-center">
                  <Badge variant="outline" className="flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    IA+ (Prédiction avancée)
                  </Badge>
                </div>
              </div>

              <EnhancedStockPrediction stock={stockData} days={predictionDays} defaultAlgorithm="ai-enhanced" />
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Sélectionnez une action pour voir les prédictions</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <SectorAlertsPanel limit={3} />

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Alertes Sectorielles</h2>
            <p className="text-gray-500 mb-4">
              Restez informé des changements importants dans les indicateurs macroéconomiques sectoriels.
            </p>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {stockData && predictionResult && <PredictionAlerts stock={stockData} prediction={predictionResult} />}

          <SectorsDashboard />

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Analyses sectorielles</h2>
            <p className="text-gray-500 mb-4">
              Explorez les prédictions par secteur d'activité pour des insights plus précis.
            </p>
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
