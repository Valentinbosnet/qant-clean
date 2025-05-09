"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, Key, X, Activity } from "lucide-react"
import { clientEnv } from "@/lib/env-config"

interface ApiKeyManagerProps {
  onSave?: (key: string, type: string) => void
}

export function ApiKeyManager({ onSave }: ApiKeyManagerProps) {
  const [openaiKey, setOpenaiKey] = useState("")
  const [alphaVantageKey, setAlphaVantageKey] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState({
    hasOpenAiKey: false,
    hasAlphaVantageKey: false,
  })

  // Charger le statut des API au chargement du composant
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

  const handleSaveKeys = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Envoyer les clés au serveur via une route API sécurisée
      const response = await fetch(`${clientEnv.NEXT_PUBLIC_API_BASE_URL}/api/settings/update-api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          openaiKey: openaiKey || undefined,
          alphaVantageKey: alphaVantageKey || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Clés API sauvegardées avec succès. Les modifications prendront effet au prochain déploiement.")

        // Mettre à jour le statut des API
        setApiStatus({
          hasOpenAiKey: openaiKey ? true : apiStatus.hasOpenAiKey,
          hasAlphaVantageKey: alphaVantageKey ? true : apiStatus.hasAlphaVantageKey,
        })

        // Réinitialiser les champs
        setOpenaiKey("")
        setAlphaVantageKey("")

        if (onSave) {
          if (openaiKey) onSave(openaiKey, "openai")
          if (alphaVantageKey) onSave(alphaVantageKey, "alphavantage")
        }
      } else {
        setError(data.error || "Erreur lors de la sauvegarde des clés API.")
      }
    } catch (err) {
      setError("Erreur lors de la sauvegarde des clés API. Vérifiez votre connexion internet.")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des clés API</CardTitle>
        <CardDescription>
          Configurez vos clés API pour activer toutes les fonctionnalités de l'application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
            <Check className="h-4 w-4" />
            <AlertTitle>Succès</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="openai-key">Clé API OpenAI</Label>
            <div className="flex items-center text-xs">
              {apiStatus.hasOpenAiKey ? (
                <span className="text-green-500 flex items-center">
                  <Check className="h-3 w-3 mr-1" /> Configurée
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <X className="h-3 w-3 mr-1" /> Non configurée
                </span>
              )}
            </div>
          </div>
          <Input
            id="openai-key"
            type="password"
            placeholder="sk-..."
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Nécessaire pour les prédictions basées sur l'IA. Obtenez votre clé sur{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              platform.openai.com
            </a>
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="alphavantage-key">Clé API Alpha Vantage</Label>
            <div className="flex items-center text-xs">
              {apiStatus.hasAlphaVantageKey ? (
                <span className="text-green-500 flex items-center">
                  <Check className="h-3 w-3 mr-1" /> Configurée
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <X className="h-3 w-3 mr-1" /> Non configurée
                </span>
              )}
            </div>
          </div>
          <Input
            id="alphavantage-key"
            type="password"
            placeholder="Votre clé Alpha Vantage"
            value={alphaVantageKey}
            onChange={(e) => setAlphaVantageKey(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Nécessaire pour les données boursières en temps réel. Obtenez votre clé sur{" "}
            <a
              href="https://www.alphavantage.co/support/#api-key"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              alphavantage.co
            </a>
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={handleSaveKeys} disabled={saving || (!openaiKey && !alphaVantageKey)}>
          <Key className="h-4 w-4 mr-2" />
          {saving ? "Sauvegarde en cours..." : "Sauvegarder les clés"}
        </Button>

        <Button variant="outline" onClick={() => (window.location.href = "/settings/api/test")}>
          <Activity className="h-4 w-4 mr-2" />
          Tester les API
        </Button>
      </CardFooter>
    </Card>
  )
}
