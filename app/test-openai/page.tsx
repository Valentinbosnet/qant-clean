"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react"
import { clientEnv } from "@/lib/env-config"

export default function TestOpenAIPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    status: "success" | "error" | null
    message: string
    details?: any
  }>({
    status: null,
    message: "",
  })

  const testOpenAI = async () => {
    setLoading(true)
    setResult({
      status: null,
      message: "",
    })

    try {
      const response = await fetch(`${clientEnv.NEXT_PUBLIC_API_BASE_URL}/api/test/openai-simple`)
      const data = await response.json()

      if (response.ok) {
        setResult({
          status: "success",
          message: data.message,
          details: data,
        })
      } else {
        setResult({
          status: "error",
          message: data.error || "Erreur lors du test de l'API OpenAI",
          details: data,
        })
      }
    } catch (error) {
      console.error("Erreur lors du test:", error)
      setResult({
        status: "error",
        message: "Erreur de connexion. Vérifiez votre connexion internet et réessayez.",
        details: { error: String(error) },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Test simplifié de l'API OpenAI</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test direct de l'API OpenAI</CardTitle>
          <CardDescription>
            Ce test vérifie si votre clé API OpenAI est correctement configurée et fonctionnelle
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result.status === "success" && (
            <Alert className="bg-green-50 border-green-200 text-green-800 mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Succès</AlertTitle>
              <AlertDescription>
                {result.message}
                {result.details?.response && (
                  <p className="mt-2 font-mono text-sm">Réponse: {result.details.response}</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {result.status === "error" && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>
                {result.message}
                {result.details && (
                  <pre className="mt-2 p-2 bg-gray-800 text-white rounded text-xs overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm mb-2">Ce test va :</p>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>Vérifier si la variable d'environnement OPENAI_API_KEY est définie</li>
              <li>Effectuer un appel simple à l'API OpenAI</li>
              <li>Afficher le résultat ou l'erreur détaillée</li>
            </ol>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={testOpenAI} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Test en cours...
              </>
            ) : (
              "Tester l'API OpenAI"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Que faire ensuite ?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium">Si le test réussit :</p>
              <ul className="list-disc list-inside text-sm mt-1">
                <li>Retournez à la page de prédictions pour générer des prédictions IA</li>
                <li>Le problème était probablement lié à la route API de diagnostic, mais l'API fonctionne</li>
              </ul>
            </div>

            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium">Si le test échoue :</p>
              <ul className="list-disc list-inside text-sm mt-1">
                <li>Vérifiez que la variable d'environnement OPENAI_API_KEY est correctement définie</li>
                <li>Assurez-vous que la clé API est valide et active sur votre compte OpenAI</li>
                <li>Redéployez l'application après avoir vérifié les variables d'environnement</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
