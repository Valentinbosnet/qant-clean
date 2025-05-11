"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Settings, ArrowRight, Clock, Zap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type TestStatus = "idle" | "loading" | "success" | "error"

interface TestResult {
  success: boolean
  message: string
  response?: string
  error?: string
  details?: string
  responseTime?: number
}

export function OpenAIConnectivityTest() {
  const [status, setStatus] = useState<TestStatus>("idle")
  const [result, setResult] = useState<TestResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const runTest = async () => {
    setStatus("loading")
    setResult(null)

    const startTime = Date.now()

    try {
      const response = await fetch("/api/test/openai-simple")
      const data = await response.json()

      const responseTime = Date.now() - startTime

      setResult({
        ...data,
        responseTime,
      })
      setStatus(data.success ? "success" : "error")
    } catch (error) {
      console.error("Error testing OpenAI API:", error)
      setResult({
        success: false,
        message: "Erreur de connexion",
        error: error instanceof Error ? error.message : String(error),
        responseTime: Date.now() - startTime,
      })
      setStatus("error")
    }
  }

  useEffect(() => {
    runTest()
  }, [])

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Test de connectivité OpenAI</CardTitle>
          {status !== "loading" && (
            <Badge variant={status === "success" ? "success" : status === "error" ? "destructive" : "outline"}>
              {status === "success" ? "Connecté" : status === "error" ? "Erreur" : "En attente"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {status === "loading" ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </div>
        ) : status === "success" ? (
          <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-5 w-5" />
            <AlertTitle>Connexion réussie</AlertTitle>
            <AlertDescription>
              <p className="mb-2">{result?.message}</p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Temps de réponse: {result?.responseTime}ms</span>
                </div>

                {result?.response && (
                  <div className="flex items-center text-sm">
                    <Zap className="h-4 w-4 mr-2" />
                    <span>Réponse: {result.response}</span>
                  </div>
                )}
              </div>

              {showDetails && result?.details && (
                <pre className="mt-4 p-3 bg-green-100 rounded text-xs overflow-auto">{result.details}</pre>
              )}
            </AlertDescription>
          </Alert>
        ) : status === "error" ? (
          <Alert variant="destructive">
            <XCircle className="h-5 w-5" />
            <AlertTitle>Problème de connexion</AlertTitle>
            <AlertDescription>
              <p className="mb-2">{result?.message}</p>

              {result?.error && (
                <div className="mt-2 p-3 bg-red-100 text-red-800 rounded text-sm">
                  <p className="font-medium">Erreur:</p>
                  <p className="font-mono text-xs">{result.error}</p>
                </div>
              )}

              {result?.details && (
                <div className="mt-2 p-3 bg-red-100 text-red-800 rounded text-sm">
                  <p className="font-medium">Détails:</p>
                  <p>{result.details}</p>
                </div>
              )}

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Temps écoulé: {result?.responseTime}ms</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className="font-medium">Solutions possibles:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Vérifiez que la clé API est correctement configurée</li>
                  <li>Assurez-vous que votre compte OpenAI dispose de crédits suffisants</li>
                  <li>Vérifiez votre connexion internet</li>
                  <li>Essayez de régénérer une nouvelle clé API dans votre compte OpenAI</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Test non exécuté</AlertTitle>
            <AlertDescription>
              Cliquez sur le bouton ci-dessous pour lancer le test de connectivité OpenAI.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div>
          <Button variant="outline" onClick={runTest} disabled={status === "loading"} className="mr-2">
            <RefreshCw className={`h-4 w-4 mr-2 ${status === "loading" ? "animate-spin" : ""}`} />
            {status === "loading" ? "Test en cours..." : "Relancer le test"}
          </Button>

          {result && (
            <Button variant="ghost" onClick={() => setShowDetails(!showDetails)} size="sm">
              {showDetails ? "Masquer les détails" : "Afficher les détails"}
            </Button>
          )}
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => (window.location.href = "/settings/api")}>
            <Settings className="h-4 w-4 mr-2" />
            Configurer l'API
          </Button>

          <Button variant="default" onClick={() => (window.location.href = "/test-ia-plus")}>
            Tester IA+
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
