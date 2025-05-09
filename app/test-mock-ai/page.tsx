"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, AlertTriangle, Check } from "lucide-react"

export default function TestMockAIPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testMockAI = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/predictions/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: "AAPL",
          days: 30,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la génération de prédictions IA")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error("Erreur lors du test de l'IA simulée:", err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testMockAI()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Test de l'IA simulée</h1>
      <p className="text-muted-foreground mb-6">
        Cette page teste la génération de prédictions IA simulées qui fonctionnent même sans clé API OpenAI.
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Test de prédiction IA simulée</span>
            {result && (
              <Badge variant="success" className="ml-2">
                Succès
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Génération d'une prédiction IA simulée pour AAPL</CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : error ? (
            <div className="flex items-center p-4 bg-red-50 text-red-800 rounded-md">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-green-50 text-green-800 rounded-md">
                <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>Prédiction IA simulée générée avec succès !</p>
              </div>

              <div>
                <h3 className="font-medium mb-1">Tendance</h3>
                <p className="text-sm">
                  {result.trend === "up" ? "Haussière" : result.trend === "down" ? "Baissière" : "Neutre"}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">Objectifs de prix</h3>
                <p className="text-sm">
                  Court terme: ${result.shortTermTarget?.toFixed(2)} | Long terme: ${result.longTermTarget?.toFixed(2)}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">Raisonnement de l'IA</h3>
                <p className="text-sm text-muted-foreground">{result.aiReasoning}</p>
              </div>
            </div>
          ) : null}
        </CardContent>

        <CardFooter>
          <Button onClick={testMockAI} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Tester à nouveau
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comment utiliser cette solution</CardTitle>
          <CardDescription>Instructions pour intégrer l'IA simulée dans votre application</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <p>
              Cette solution de contournement permet de générer des prédictions IA simulées qui fonctionnent même sans
              clé API OpenAI. Voici comment l'utiliser :
            </p>

            <div>
              <h3 className="font-medium">1. Utiliser la route API existante</h3>
              <p className="text-sm text-muted-foreground mt-1">
                La route API <code>/api/predictions/ai</code> utilise maintenant automatiquement l'IA simulée si la clé
                API OpenAI n'est pas disponible.
              </p>
            </div>

            <div>
              <h3 className="font-medium">2. Aucune modification nécessaire dans les composants</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Les composants existants comme <code>EnhancedStockPrediction</code> fonctionneront sans modification.
              </p>
            </div>

            <div>
              <h3 className="font-medium">3. Qualité des prédictions</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Les prédictions simulées sont basées sur l'analyse des tendances historiques, de la volatilité et des
                modèles de prix récents. Bien qu'elles ne soient pas aussi sophistiquées que les prédictions de l'IA
                d'OpenAI, elles fournissent une alternative raisonnable.
              </p>
            </div>

            <div className="p-3 rounded-md bg-blue-50 text-blue-800 text-sm">
              <p className="font-medium">Note</p>
              <p>
                Cette solution est conçue comme un contournement temporaire. Pour des prédictions plus précises, il est
                recommandé de configurer une clé API OpenAI valide dans les paramètres de l'application.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
