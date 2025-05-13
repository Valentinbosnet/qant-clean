"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export default function AlphaVantageDiagnostic() {
  const [apiKey, setApiKey] = useState("")
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  useEffect(() => {
    checkApiKey()
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Diagnostic Alpha Vantage</CardTitle>
        <CardDescription>Vérifiez et mettez à jour votre clé API Alpha Vantage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status && (
          <Alert variant={status.valid ? "default" : "destructive"}>
            {status.valid ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{status.valid ? "Clé API valide" : "Problème avec la clé API"}</AlertTitle>
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
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={checkApiKey} disabled={loading}>
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Vérification...
            </>
          ) : (
            "Vérifier la clé actuelle"
          )}
        </Button>
        <Button onClick={updateApiKey} disabled={!apiKey.trim() || updateLoading}>
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
      </CardFooter>
    </Card>
  )
}
