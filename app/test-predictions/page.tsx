"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertCircle, Info } from "lucide-react"
import { EnhancedStockPrediction } from "@/components/enhanced-stock-prediction"
import { getStockData } from "@/lib/stock-service"

export default function TestPredictionsPage() {
  const [symbol, setSymbol] = useState("AAPL")
  const [loading, setLoading] = useState(false)
  const [stockData, setStockData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<{ hasOpenAiKey: boolean }>({ hasOpenAiKey: false })
  const [testResults, setTestResults] = useState<
    Array<{ step: string; status: "success" | "error" | "pending"; message?: string }>
  >([])
  const [directApiTest, setDirectApiTest] = useState<{
    status: "idle" | "loading" | "success" | "error"
    data?: any
    error?: string
  }>({ status: "idle" })

  // Vérifier le statut de l'API OpenAI
  useEffect(() => {
    async function checkApiStatus() {
      try {
        const response = await fetch("/api/status/api-keys")
        if (response.ok) {
          const data = await response.json()
          setApiStatus(data)
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du statut de l'API:", error)
      }
    }

    checkApiStatus()
  }, [])

  // Fonction pour récupérer les données d'une action
  const fetchStockData = async () => {
    if (!symbol) return

    setLoading(true)
    setError(null)
    setStockData(null)
    setTestResults([{ step: "Récupération des données de l'action", status: "pending" }])

    try {
      const data = await getStockData(symbol)
      setStockData(data)
      setTestResults((prev) => [
        {
          step: "Récupération des données de l'action",
          status: "success",
          message: `Données récupérées pour ${data.name} (${data.symbol})`,
        },
        {
          step: "Vérification des données historiques",
          status: data.history && data.history.length > 30 ? "success" : "error",
          message:
            data.history && data.history.length > 30
              ? `${data.history.length} jours d'historique disponibles`
              : "Données historiques insuffisantes",
        },
        { step: "Préparation pour la prédiction IA+", status: "pending" },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la récupération des données")
      setTestResults((prev) => [
        {
          step: "Récupération des données de l'action",
          status: "error",
          message: err instanceof Error ? err.message : "Erreur lors de la récupération des données",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour tester directement l'API de prédiction
  const testPredictionApi = async () => {
    if (!stockData) return

    setDirectApiTest({ status: "loading" })

    try {
      const response = await fetch("/api/predictions/ai-enhanced", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: stockData.symbol,
          days: 30,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de l'appel à l'API de prédiction")
      }

      const data = await response.json()
      setDirectApiTest({
        status: "success",
        data: {
          trend: data.trend,
          shortTermTarget: data.shortTermTarget,
          longTermTarget: data.longTermTarget,
          confidence: data.metrics?.confidence,
          pointsCount: data.points?.length,
          algorithm: data.algorithm,
        },
      })

      setTestResults((prev) => {
        const newResults = [...prev]
        const index = newResults.findIndex((r) => r.step === "Préparation pour la prédiction IA+")
        if (index >= 0) {
          newResults[index] = {
            step: "Préparation pour la prédiction IA+",
            status: "success",
            message: "API de prédiction IA+ testée avec succès",
          }
        }
        return newResults
      })
    } catch (error) {
      setDirectApiTest({
        status: "error",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      })

      setTestResults((prev) => {
        const newResults = [...prev]
        const index = newResults.findIndex((r) => r.step === "Préparation pour la prédiction IA+")
        if (index >= 0) {
          newResults[index] = {
            step: "Préparation pour la prédiction IA+",
            status: "error",
            message: error instanceof Error ? error.message : "Erreur lors du test de l'API",
          }
        }
        return newResults
      })
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Test des Prédictions IA+</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Statut de l'API</CardTitle>
            <CardDescription>Vérification de la configuration de l'API</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Clé API OpenAI:</span>
                <Badge variant={apiStatus.hasOpenAiKey ? "success" : "secondary"}>
                  {apiStatus.hasOpenAiKey ? "Configurée" : "Non configurée"}
                </Badge>
              </div>

              <Alert variant={apiStatus.hasOpenAiKey ? "default" : "secondary"}>
                <Info className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  {apiStatus.hasOpenAiKey
                    ? "Une clé API OpenAI est configurée. Les prédictions IA+ utiliseront l'API OpenAI pour des résultats plus précis."
                    : "Aucune clé API OpenAI n'est configurée. Les prédictions IA+ utiliseront l'algorithme alternatif basé sur des règles."}
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tester une action</CardTitle>
            <CardDescription>Entrez un symbole boursier pour tester les prédictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="symbol">Symbole</Label>
                <Input
                  id="symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="ex: AAPL"
                />
              </div>
              <Button onClick={fetchStockData} disabled={loading || !symbol}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Tester
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Résultats du test</h3>
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-start">
                      {result.status === "pending" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500 mt-1" />
                      ) : result.status === "success" ? (
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-1" />
                      ) : (
                        <AlertCircle className="mr-2 h-4 w-4 text-red-500 mt-1" />
                      )}
                      <div>
                        <div className="font-medium">{result.step}</div>
                        {result.message && <div className="text-sm text-muted-foreground">{result.message}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stockData && (
              <div className="mt-6">
                <Button onClick={testPredictionApi} disabled={directApiTest.status === "loading"}>
                  {directApiTest.status === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Tester l'API de prédiction directement
                </Button>

                {directApiTest.status === "success" && (
                  <div className="mt-4 p-4 border rounded-md bg-muted">
                    <h4 className="font-medium mb-2">Résultat de l'API:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Tendance:</div>
                      <div className="font-medium">{directApiTest.data.trend}</div>

                      <div>Objectif court terme:</div>
                      <div className="font-medium">${directApiTest.data.shortTermTarget?.toFixed(2)}</div>

                      <div>Objectif long terme:</div>
                      <div className="font-medium">${directApiTest.data.longTermTarget?.toFixed(2)}</div>

                      <div>Confiance:</div>
                      <div className="font-medium">{(directApiTest.data.confidence * 100).toFixed(0)}%</div>

                      <div>Points de données:</div>
                      <div className="font-medium">{directApiTest.data.pointsCount}</div>

                      <div>Algorithme:</div>
                      <div className="font-medium">{directApiTest.data.algorithm}</div>
                    </div>
                  </div>
                )}

                {directApiTest.status === "error" && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{directApiTest.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {stockData && (
        <>
          <Separator className="my-8" />

          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Aperçu de la prédiction</h2>
            <p className="text-muted-foreground">
              Voici comment la prédiction IA+ sera affichée pour {stockData.name} ({stockData.symbol})
            </p>
          </div>

          <EnhancedStockPrediction stock={stockData} defaultAlgorithm="ai-enhanced" />
        </>
      )}
    </div>
  )
}
