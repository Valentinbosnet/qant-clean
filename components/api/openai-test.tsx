"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw } from "lucide-react"
import { clientEnv } from "@/lib/env-config"

interface OpenAITestProps {
  onStatusChange?: (status: "success" | "error" | "loading" | "idle") => void
}

export function OpenAITest({ onStatusChange }: OpenAITestProps) {
  const [status, setStatus] = useState<"success" | "error" | "loading" | "idle">("idle")
  const [message, setMessage] = useState<string>("")
  const [modelInfo, setModelInfo] = useState<string | null>(null)
  const [hasOpenAiKey, setHasOpenAiKey] = useState<boolean>(false)

  // Charger le statut de l'API OpenAI
  useEffect(() => {
    async function fetchApiStatus() {
      try {
        const response = await fetch(`${clientEnv.NEXT_PUBLIC_API_BASE_URL}/api/status/api-keys`)
        if (response.ok) {
          const data = await response.json()
          setHasOpenAiKey(data.hasOpenAiKey)

          // Si la clé est disponible, lancer le test automatiquement
          if (data.hasOpenAiKey) {
            testOpenAI()
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du statut des API:", error)
      }
    }

    fetchApiStatus()
  }, [])

  const testOpenAI = async () => {
    setStatus("loading")
    setMessage("")
    setModelInfo(null)

    if (onStatusChange) onStatusChange("loading")

    try {
      // Appel à une route API qui testera la connexion à OpenAI
      const response = await fetch(`${clientEnv.NEXT_PUBLIC_API_BASE_URL}/api/test/openai`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Connexion à l'API OpenAI établie avec succès.")
        setModelInfo(data.model || "gpt-4o")
        if (onStatusChange) onStatusChange("success")
      } else {
        setStatus("error")
        setMessage(data.error || "Erreur lors de la connexion à l'API OpenAI.")
        if (onStatusChange) onStatusChange("error")
      }
    } catch (error) {
      console.error("Erreur lors du test OpenAI:", error)
      setStatus("error")
      setMessage("Erreur de connexion. Vérifiez votre connexion internet et réessayez.")
      if (onStatusChange) onStatusChange("error")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Test de l'API OpenAI</span>
          {status !== "idle" && status !== "loading" && (
            <Badge variant={status === "success" ? "success" : "destructive"} className="ml-2">
              {status === "success" ? "Connecté" : "Erreur"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Vérifiez la connectivité avec l'API OpenAI pour les prédictions basées sur l'IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        ) : status === "success" ? (
          <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Connexion réussie</AlertTitle>
            <AlertDescription>
              {message}
              {modelInfo && (
                <p className="mt-2 text-xs">
                  Modèle disponible: <span className="font-semibold">{modelInfo}</span>
                </p>
              )}
            </AlertDescription>
          </Alert>
        ) : status === "error" ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Erreur de connexion</AlertTitle>
            <AlertDescription>
              {message}
              <p className="mt-2 text-xs">
                Vérifiez que votre clé API est correcte et que vous avez accès à l'API OpenAI.
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Test non effectué</AlertTitle>
            <AlertDescription>
              Cliquez sur le bouton ci-dessous pour tester la connexion à l'API OpenAI.
              {!hasOpenAiKey && (
                <p className="mt-2 text-xs">
                  Aucune clé API OpenAI n'a été détectée. Veuillez configurer votre clé API dans les paramètres.
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={testOpenAI}
          disabled={status === "loading"}
          variant={status === "error" ? "destructive" : "default"}
        >
          {status === "loading" ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Test en cours...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              {status === "success" ? "Tester à nouveau" : "Tester la connexion"}
            </>
          )}
        </Button>
        {status === "error" && (
          <Button variant="outline" onClick={() => (window.location.href = "/settings/api")}>
            Configurer l'API
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
