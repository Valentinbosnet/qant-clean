"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AlphaVantageTestPage() {
  const [symbol, setSymbol] = useState("AAPL")
  const [endpoint, setEndpoint] = useState("GLOBAL_QUOTE")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function testApi() {
    if (!symbol.trim()) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch(`/api/debug/alpha-vantage-test?symbol=${symbol}&endpoint=${endpoint}`)

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResult(data.result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Test de l'API Alpha Vantage</h1>

      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Tester un endpoint Alpha Vantage</CardTitle>
          <CardDescription>Sélectionnez un endpoint et un symbole pour tester l'API Alpha Vantage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint</Label>
              <Select value={endpoint} onValueChange={setEndpoint}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un endpoint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GLOBAL_QUOTE">Global Quote</SelectItem>
                  <SelectItem value="TIME_SERIES_DAILY">Time Series Daily</SelectItem>
                  <SelectItem value="TIME_SERIES_INTRADAY">Time Series Intraday</SelectItem>
                  <SelectItem value="OVERVIEW">Company Overview</SelectItem>
                  <SelectItem value="SECTOR">Sector Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">Symbole</Label>
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="ex: AAPL"
                disabled={endpoint === "SECTOR"}
              />
            </div>
          </div>

          <Button className="w-full" onClick={testApi} disabled={loading || (endpoint !== "SECTOR" && !symbol.trim())}>
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Test en cours...
              </>
            ) : (
              "Tester l'API"
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Résultat:</h3>
              <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Retour
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
