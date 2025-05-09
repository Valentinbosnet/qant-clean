"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Code, RefreshCw, CheckCircle2, XCircle, AlertTriangle, ArrowLeft } from "lucide-react"
import { clientEnv } from "@/lib/env-config"

export default function ApiDebugPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const fetchDebugInfo = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${clientEnv.NEXT_PUBLIC_API_BASE_URL}/api/debug/openai-key`)

      if (response.ok) {
        const data = await response.json()
        setDebugInfo(data)
      } else {
        setError("Erreur lors de la récupération des informations de débogage")
      }
    } catch (err) {
      console.error("Erreur lors du débogage:", err)
      setError("Erreur de connexion. Vérifiez votre connexion internet et réessayez.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDebugInfo()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <h1 className="text-3xl font-bold">Diagnostic des clés API</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="h-5 w-5 mr-2" />
            Informations de débogage OpenAI
          </CardTitle>
          <CardDescription>Vérifiez si la clé API OpenAI est correctement configurée sur le serveur</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <span className="font-medium">Clé API OpenAI</span>
                <div className="flex items-center">
                  {debugInfo.hasOpenAiKey ? (
                    <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Configurée
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Non configurée
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">Préfixe de la clé</p>
                  <p className="text-sm font-mono">{debugInfo.keyPrefix}</p>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">Environnement</p>
                  <p className="text-sm font-mono">{debugInfo.environment}</p>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Informations importantes</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    Si la clé API est marquée comme "non configurée", vérifiez les points suivants :
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      La variable d'environnement OPENAI_API_KEY est correctement définie dans votre projet Vercel
                    </li>
                    <li>La clé API est valide et active sur votre compte OpenAI</li>
                    <li>Le déploiement a été effectué après l'ajout de la variable d'environnement</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={fetchDebugInfo} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Étapes de résolution</CardTitle>
          <CardDescription>Suivez ces étapes pour résoudre les problèmes liés aux clés API</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 list-decimal list-inside">
            <li className="p-3 bg-muted rounded-md">
              <span className="font-medium">Vérifiez les variables d'environnement dans Vercel</span>
              <p className="mt-1 text-sm ml-6">
                Assurez-vous que la variable OPENAI_API_KEY est correctement définie dans les paramètres de votre projet
                Vercel. N'utilisez pas le préfixe NEXT_PUBLIC_ pour les clés API sensibles.
              </p>
            </li>
            <li className="p-3 bg-muted rounded-md">
              <span className="font-medium">Redéployez votre application</span>
              <p className="mt-1 text-sm ml-6">
                Après avoir ajouté ou modifié des variables d'environnement, redéployez votre application pour que les
                changements prennent effet.
              </p>
            </li>
            <li className="p-3 bg-muted rounded-md">
              <span className="font-medium">Vérifiez la validité de votre clé API</span>
              <p className="mt-1 text-sm ml-6">
                Assurez-vous que votre clé API OpenAI est valide et active. Vous pouvez la vérifier sur le tableau de
                bord OpenAI.
              </p>
            </li>
            <li className="p-3 bg-muted rounded-md">
              <span className="font-medium">Utilisez le mode de secours</span>
              <p className="mt-1 text-sm ml-6">
                Si vous ne pouvez pas configurer la clé API immédiatement, l'application utilisera automatiquement
                l'algorithme d'ensemble comme solution de secours pour les prédictions.
              </p>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
