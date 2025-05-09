"use client"

import { useState, useEffect } from "react"
import { ApiKeyManager } from "@/components/api-key-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, AlertTriangle } from "lucide-react"
import { clientEnv } from "@/lib/env-config"

export default function ApiSettingsPage() {
  const [keysSaved, setKeysSaved] = useState(false)
  const [apiStatus, setApiStatus] = useState({
    hasOpenAiKey: false,
    hasAlphaVantageKey: false,
  })

  // Charger le statut des API au chargement de la page
  useEffect(() => {
    async function fetchApiStatus() {
      try {
        const response = await fetch(`${clientEnv.NEXT_PUBLIC_API_BASE_URL}/api/status/api-keys`)
        if (response.ok) {
          const data = await response.json()
          setApiStatus(data)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du statut des API:", error)
      }
    }

    fetchApiStatus()
  }, [])

  const handleKeySave = (key: string, type: string) => {
    setKeysSaved(true)
    console.log(`Clé ${type} sauvegardée`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Configuration des API</h1>

      <div className="grid grid-cols-1 gap-6">
        {!apiStatus.hasOpenAiKey && !apiStatus.hasAlphaVantageKey && (
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200 text-yellow-800 mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Clés API manquantes</AlertTitle>
            <AlertDescription>
              Certaines fonctionnalités de l'application nécessitent des clés API pour fonctionner correctement.
              Veuillez configurer vos clés API ci-dessous.
            </AlertDescription>
          </Alert>
        )}

        <ApiKeyManager onSave={handleKeySave} />

        <Card>
          <CardHeader>
            <CardTitle>À propos des API</CardTitle>
            <CardDescription>Informations sur les API utilisées par l'application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">OpenAI API</h3>
              <p className="text-sm text-muted-foreground mb-2">
                L'API OpenAI est utilisée pour générer des prédictions basées sur l'intelligence artificielle. Le modèle
                GPT-4o analyse les données historiques et fournit des prévisions de prix.
              </p>
              <div className="text-xs bg-muted p-2 rounded">
                <p className="font-medium">Utilisation :</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Prédictions de prix basées sur l'IA</li>
                  <li>Analyse de sentiment des nouvelles financières</li>
                  <li>Génération de rapports d'analyse</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Alpha Vantage API</h3>
              <p className="text-sm text-muted-foreground mb-2">
                L'API Alpha Vantage fournit des données boursières en temps réel et historiques pour les actions, les
                devises, les crypto-monnaies et les indicateurs économiques.
              </p>
              <div className="text-xs bg-muted p-2 rounded">
                <p className="font-medium">Utilisation :</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Données historiques des prix des actions</li>
                  <li>Indicateurs techniques (RSI, MACD, etc.)</li>
                  <li>Données fondamentales des entreprises</li>
                  <li>Indicateurs macroéconomiques</li>
                </ul>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Sécurité des clés API</AlertTitle>
              <AlertDescription>
                Les clés API sont stockées de manière sécurisée sur le serveur et ne sont jamais exposées au client.
                Elles sont utilisées uniquement pour les appels API côté serveur.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
