"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Info } from "lucide-react"

export default function TestOpenAIPage() {
  const [simpleStatus, setSimpleStatus] = useState<"checking" | "success" | "error" | "idle">("idle")
  const [simpleMessage, setSimpleMessage] = useState<string>("")
  const [simpleDetails, setSimpleDetails] = useState<string>("")

  const [predictionStatus, setPredictionStatus] = useState<"checking" | "success" | "error" | "idle">("idle")
  const [predictionMessage, setPredictionMessage] = useState<string>("")
  const [predictionDetails, setPredictionDetails] = useState<string>("")

  const [envStatus, setEnvStatus] = useState<"checking" | "success" | "error" | "idle">("idle")
  const [envMessage, setEnvMessage] = useState<string>("")
  const [envDetails, setEnvDetails] = useState<string>("")

  const checkSimpleAPI = async () => {
    setSimpleStatus("checking")
    setSimpleMessage("")
    setSimpleDetails("")

    try {
      const response = await fetch("/api/test/openai-simple")

      if (response.ok) {
        const data = await response.json()
        setSimpleStatus("success")
        setSimpleMessage(data.message || "L'API OpenAI est correctement configurée et fonctionnelle.")
        setSimpleDetails(JSON.stringify(data, null, 2))
      } else {
        let errorMessage = "L'API OpenAI n'est pas correctement configurée."
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
          setSimpleDetails(JSON.stringify(data, null, 2))
        } catch (e) {
          // Si la réponse n'est pas du JSON valide
          setSimpleDetails(`Réponse non-JSON: ${await response.text()}`)
        }
        setSimpleStatus("error")
        setSimpleMessage(errorMessage)
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'API:", error)
      setSimpleStatus("error")
      setSimpleMessage("Erreur de connexion. Vérifiez votre connexion internet et réessayez.")
      setSimpleDetails(error instanceof Error ? error.message : String(error))
    }
  }

  const checkPredictionAPI = async () => {
    setPredictionStatus("checking")
    setPredictionMessage("")
    setPredictionDetails("")

    try {
      const response = await fetch("/api/predictions/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol: "AAPL", days: 7 }),
      })

      if (response.ok) {
        const data = await response.json()
        setPredictionStatus("success")
        setPredictionMessage("L'API de prédiction IA fonctionne correctement.")
        setPredictionDetails(JSON.stringify(data, null, 2))
      } else {
        let errorMessage = "L'API de prédiction IA n'est pas correctement configurée."
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
          setPredictionDetails(JSON.stringify(data, null, 2))
        } catch (e) {
          // Si la réponse n'est pas du JSON valide
          setPredictionDetails(`Réponse non-JSON: ${await response.text()}`)
        }
        setPredictionStatus("error")
        setPredictionMessage(errorMessage)
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'API de prédiction:", error)
      setPredictionStatus("error")
      setPredictionMessage("Erreur de connexion. Vérifiez votre connexion internet et réessayez.")
      setPredictionDetails(error instanceof Error ? error.message : String(error))
    }
  }

  const checkEnvAPI = async () => {
    setEnvStatus("checking")
    setEnvMessage("")
    setEnvDetails("")

    try {
      const response = await fetch("/api/debug/openai-key")

      if (response.ok) {
        const data = await response.json()
        setEnvStatus(data.hasOpenAiKey ? "success" : "error")
        setEnvMessage(
          data.hasOpenAiKey
            ? `La clé API OpenAI est configurée (préfixe: ${data.keyPrefix})`
            : "La clé API OpenAI n'est pas configurée dans les variables d'environnement.",
        )
        setEnvDetails(JSON.stringify(data, null, 2))
      } else {
        let errorMessage = "Impossible de vérifier les variables d'environnement."
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
          setEnvDetails(JSON.stringify(data, null, 2))
        } catch (e) {
          // Si la réponse n'est pas du JSON valide
          setEnvDetails(`Réponse non-JSON: ${await response.text()}`)
        }
        setEnvStatus("error")
        setEnvMessage(errorMessage)
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des variables d'environnement:", error)
      setEnvStatus("error")
      setEnvMessage("Erreur de connexion. Vérifiez votre connexion internet et réessayez.")
      setEnvDetails(error instanceof Error ? error.message : String(error))
    }
  }

  useEffect(() => {
    checkSimpleAPI()
    checkPredictionAPI()
    checkEnvAPI()
  }, [])

  const renderStatusAlert = (
    status: "checking" | "success" | "error" | "idle",
    message: string,
    details: string,
    onRetry: () => void,
  ) => {
    if (status === "checking") {
      return (
        <div className="flex items-center text-sm text-muted-foreground">
          <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
          Vérification en cours...
        </div>
      )
    } else if (status === "success") {
      return (
        <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Succès</AlertTitle>
          <AlertDescription>
            {message}
            {details && <pre className="mt-2 p-2 bg-green-100 rounded text-xs overflow-auto">{details}</pre>}
          </AlertDescription>
        </Alert>
      )
    } else if (status === "error") {
      return (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {message}
            {details && <pre className="mt-2 p-2 bg-red-100 text-red-900 rounded text-xs overflow-auto">{details}</pre>}
            <div className="mt-2">
              <Button size="sm" variant="outline" onClick={onRetry}>
                Réessayer
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    } else {
      return (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Statut inconnu</AlertTitle>
          <AlertDescription>
            Cliquez sur le bouton ci-dessous pour vérifier le statut.
            <div className="mt-2">
              <Button size="sm" onClick={onRetry}>
                Vérifier
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Test de l'API OpenAI</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Cette page effectue différents tests pour vérifier si l'API OpenAI est correctement configurée et
          fonctionnelle.
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Ces tests vérifient différents aspects de l'intégration avec l'API OpenAI. Si l'un des tests échoue, consultez
          les détails pour comprendre le problème et suivez les instructions pour le résoudre.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="simple" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="simple">Test simple</TabsTrigger>
          <TabsTrigger value="prediction">Test de prédiction</TabsTrigger>
          <TabsTrigger value="env">Variables d'environnement</TabsTrigger>
        </TabsList>

        <TabsContent value="simple">
          <Card>
            <CardHeader>
              <CardTitle>Test simplifié de l'API OpenAI</CardTitle>
              <CardDescription>
                Ce test vérifie si votre clé API OpenAI est correctement configurée et fonctionnelle
              </CardDescription>
            </CardHeader>
            <CardContent>{renderStatusAlert(simpleStatus, simpleMessage, simpleDetails, checkSimpleAPI)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prediction">
          <Card>
            <CardHeader>
              <CardTitle>Test de l'API de prédiction IA</CardTitle>
              <CardDescription>
                Ce test vérifie si l'API de prédiction IA peut générer des prédictions pour AAPL
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStatusAlert(predictionStatus, predictionMessage, predictionDetails, checkPredictionAPI)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="env">
          <Card>
            <CardHeader>
              <CardTitle>Variables d'environnement</CardTitle>
              <CardDescription>
                Ce test vérifie si la variable d'environnement OPENAI_API_KEY est correctement configurée
              </CardDescription>
            </CardHeader>
            <CardContent>{renderStatusAlert(envStatus, envMessage, envDetails, checkEnvAPI)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Guide de résolution des problèmes</CardTitle>
          <CardDescription>
            Si vous rencontrez des problèmes avec l'API OpenAI, suivez ces étapes pour les résoudre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">1. Vérifiez la clé API OpenAI</h3>
              <p className="text-sm text-muted-foreground">
                Assurez-vous que votre clé API OpenAI est correctement configurée dans les variables d'environnement de
                Vercel.
              </p>
            </div>

            <div>
              <h3 className="font-medium">2. Redéployez l'application</h3>
              <p className="text-sm text-muted-foreground">
                Après avoir configuré la clé API, redéployez l'application pour que les changements prennent effet.
              </p>
            </div>

            <div>
              <h3 className="font-medium">3. Vérifiez les logs</h3>
              <p className="text-sm text-muted-foreground">
                Consultez les logs de déploiement et d'exécution dans le dashboard Vercel pour identifier d'éventuelles
                erreurs.
              </p>
            </div>

            <div>
              <h3 className="font-medium">4. Testez la clé API directement</h3>
              <p className="text-sm text-muted-foreground">
                Vérifiez que votre clé API fonctionne correctement en la testant directement sur le site d'OpenAI.
              </p>
            </div>

            <div className="pt-4">
              <Button onClick={() => (window.location.href = "/predictions")}>Retour aux prédictions</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
