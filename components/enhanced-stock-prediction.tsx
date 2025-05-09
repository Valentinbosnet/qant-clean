"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { StockChart } from "./stock-chart"
import { PredictionAnalysis } from "./prediction-analysis"
import { clientEnv } from "@/lib/env-config"

interface EnhancedStockPredictionProps {
  symbol: string
  stockData: any
}

export function EnhancedStockPrediction({ symbol, stockData }: EnhancedStockPredictionProps) {
  const [predictions, setPredictions] = useState<any>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<Record<string, string | null>>({})
  const [activeTab, setActiveTab] = useState("ensemble")

  const algorithms = [
    { id: "ensemble", name: "Ensemble" },
    { id: "regression", name: "Régression" },
    { id: "arima", name: "ARIMA" },
    { id: "ai", name: "IA" },
  ]

  const loadPrediction = async (algorithm: string) => {
    if (predictions[algorithm]) return

    setLoading((prev) => ({ ...prev, [algorithm]: true }))
    setError((prev) => ({ ...prev, [algorithm]: null }))

    try {
      let response

      // Utiliser une route API spécifique pour les prédictions IA
      if (algorithm === "ai") {
        console.log("Fetching AI prediction from direct API")

        // Utiliser la nouvelle route API directe
        response = await fetch("/api/predictions/ai-direct", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symbol,
            days: 30,
          }),
        })
      } else {
        // Pour les autres algorithmes, utiliser la route standard
        response = await fetch(`${clientEnv.NEXT_PUBLIC_API_BASE_URL || ""}/api/predictions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symbol,
            algorithm,
            days: 30,
          }),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erreur ${response.status}`)
      }

      const data = await response.json()
      setPredictions((prev: any) => ({ ...prev, [algorithm]: data }))
    } catch (err) {
      console.error(`Erreur lors du chargement des prédictions (${algorithm}):`, err)
      setError((prev) => ({
        ...prev,
        [algorithm]: err instanceof Error ? err.message : "Erreur inconnue",
      }))
    } finally {
      setLoading((prev) => ({ ...prev, [algorithm]: false }))
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (!predictions[value]) {
      loadPrediction(value)
    }
  }

  const handleRetry = (algorithm: string) => {
    loadPrediction(algorithm)
  }

  useEffect(() => {
    // Charger les prédictions pour l'onglet actif au chargement
    loadPrediction(activeTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol])

  const currentPrediction = predictions[activeTab]
  const isLoading = loading[activeTab]
  const currentError = error[activeTab]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Prédictions de marché</CardTitle>
        <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4">
            {algorithms.map((algo) => (
              <TabsTrigger key={algo.id} value={algo.id}>
                {algo.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {algorithms.map((algo) => (
            <TabsContent key={algo.id} value={algo.id} className="space-y-4">
              {isLoading && algo.id === activeTab ? (
                <div className="space-y-3">
                  <Skeleton className="h-[300px] w-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-3/5" />
                  </div>
                </div>
              ) : currentError && algo.id === activeTab ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>
                    <div className="mb-2">{currentError}</div>
                    <Button variant="outline" size="sm" onClick={() => handleRetry(algo.id)} className="mt-2">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Réessayer
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : currentPrediction && algo.id === activeTab ? (
                <>
                  <StockChart
                    data={currentPrediction.points}
                    title={`Prédiction ${algo.name} pour ${symbol}`}
                    height={300}
                  />
                  <PredictionAnalysis prediction={currentPrediction} />
                </>
              ) : null}
            </TabsContent>
          ))}
        </Tabs>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  )
}
