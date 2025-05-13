"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function AlphaVantageDiagnostic() {
  const [apiKey, setApiKey] = useState("")
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [rateLimitStatus, setRateLimitStatus] = useState<any>(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  useEffect(() => {
    checkApiKey()
    checkRateLimitStatus()
  }, [])

  async function checkApiKey() {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/alpha-vantage-key")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Erreur lors de la vérification de la clé API:", error)
      setStatus({
        valid: false,
        message: error instanceof Error ? error.message : "Erreur inconnue",
      })
    } finally {
      setLoading(false)
    }
  }

  async function checkRateLimitStatus() {
    try {
      const response = await fetch("/api/debug/alpha-vantage-rate-limit")
      const data = await response.json()
      setRateLimitStatus(data)
    } catch (error) {
      console.error("Erreur lors de la vérification du statut de limite de taux:", error)
      setRateLimitStatus({
        isLimited: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      })
    }
  }

  async function resetRateLimit() {
    setResetLoading(true)
    try {
      const response = await fetch("/api/debug/alpha-vantage-reset-limit", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setResetSuccess(true)
        setTimeout(() => {
          setResetSuccess(false)
          checkRateLimitStatus()
        }, 2000)
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation de la limite de taux:", error)
    } finally {
      setResetLoading(false)
    }
  }

  async function updateApiKey() {
    if (!apiKey.trim()) return

    setUpdateLoading(true)
    try {
      const response = await fetch("/api/settings/update-api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alphaVantageKey: apiKey,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUpdateSuccess(true)
        setTimeout(() => {
          setUpdateSuccess(false)
          checkApiKey()
        }, 2000)
      } else {
        console.error("Erreur lors de la mise à jour de la clé API:", data.error)
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la clé API:", error)
    } finally {
      setUpdateLoading(false)
    }
  }

  function formatRemainingTime(ms: number): string {
    if (!ms) return "0 minutes"

    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes} minutes`
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Diagnostic Alpha Vantage</CardTitle>
        <CardDescription>Vérifiez et mettez à jour votre clé API Alpha Vantage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="status">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status">Statut de l'API</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4">
            {status && (
              <Alert variant={status.valid ? "default" : "destructive"}>
                {status.valid ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle className="flex items-center gap-2">
                  {status.valid ? "Clé API valide" : "Problème avec la clé API"}
                  {status.isPremium === true && <Badge className="bg-green-500">Premium</Badge>}
                  {status.isPremium === false && <Badge className="bg-yellow-500">Standard</Badge>}
                </AlertTitle>
                <AlertDescription>
                  {status.message}
                  {status.key && (
                    <div className="mt-2">
                      <strong>Clé actuelle:</strong> {status.key}
                    </div>
                  )}
                  {status.response && (
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(status.response, null, 2)}
                    </pre>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {rateLimitStatus && (
              <Alert variant={rateLimitStatus.isLimited ? "destructive" : "default"}>
                {rateLimitStatus.isLimited ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                <AlertTitle>
                  {rateLimitStatus.isLimited ? "Limite de taux détectée" : "Aucune limite de taux active"}
                </AlertTitle>
                <AlertDescription>
                  {rateLimitStatus.isLimited ? (
                    <div>
                      <p>L'application est actuellement en mode fallback en raison d'une limite de taux détectée.</p>
                      <p className="mt-1">
                        <strong>Temps restant:</strong> {formatRemainingTime(rateLimitStatus.remainingTime)}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={resetRateLimit}
                        disabled={resetLoading}
                      >
                        {resetLoading ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Réinitialisation...
                          </>
                        ) : resetSuccess ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Réinitialisé!
                          </>
                        ) : (
                          "Forcer la réinitialisation"
                        )}
                      </Button>
                    </div>
                  ) : (
                    "L'API est accessible normalement."
                  )}
                  {rateLimitStatus.error && <p className="text-red-500 mt-2">Erreur: {rateLimitStatus.error}</p>}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  checkApiKey()
                  checkRateLimitStatus()
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  "Actualiser le statut"
                )}
              </Button>

              <Button variant="default" onClick={() => (window.location.href = "/debug/alpha-vantage/test")}>
                Tester l'API
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Nouvelle clé API Alpha Vantage</Label>
              <Input
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Entrez votre clé API Alpha Vantage"
              />
              <p className="text-sm text-gray-500">
                Vous pouvez obtenir une clé API sur{" "}
                <a
                  href="https://www.alphavantage.co/support/#api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  alphavantage.co
                </a>
              </p>
            </div>

            <Button className="w-full" onClick={updateApiKey} disabled={!apiKey.trim() || updateLoading}>
              {updateLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : updateSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mise à jour réussie!
                </>
              ) : (
                "Mettre à jour la clé"
              )}
            </Button>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Problèmes avec votre clé API?</AlertTitle>
              <AlertDescription>
                <p>
                  Si vous avez souscrit à un plan payant mais que votre clé est toujours traitée comme une clé standard:
                </p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>Vérifiez que le paiement a bien été traité</li>
                  <li>Contactez le support Alpha Vantage</li>
                  <li>Demandez une nouvelle clé API</li>
                </ol>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
