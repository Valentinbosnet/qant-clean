"use client"

import { useState } from "react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function ApiKeyTester() {
  const [symbol, setSymbol] = useState("AAPL")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [testType, setTestType] = useState("basic")

  const runApiTest = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      let url

      if (testType === "basic") {
        url = `/api/premium-stock-data?symbol=${symbol}&action=quote`
      } else {
        url = `/api/premium-stock-data?symbol=${symbol}&action=technical&interval=daily`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Une erreur s'est produite")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur inattendue s'est produite")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Testeur de clé API Alpha Vantage Premium</CardTitle>
          <CardDescription>
            Vérifiez que votre clé API premium fonctionne correctement et que vous pouvez accéder aux données
            financières.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="symbol">Symbole boursier</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="ex: AAPL, MSFT, GOOGL"
              />
              <Button onClick={runApiTest} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Tester"}
              </Button>
            </div>
          </div>

          <Tabs value={testType} onValueChange={setTestType}>
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Test basique</TabsTrigger>
              <TabsTrigger value="advanced">Test complet</TabsTrigger>
            </TabsList>
            <TabsContent value="basic">
              <p className="text-sm text-muted-foreground mb-4">
                Ce test vérifie si votre clé API peut récupérer les données de base d'une action.
              </p>
            </TabsContent>
            <TabsContent value="advanced">
              <p className="text-sm text-muted-foreground mb-4">
                Ce test vérifie si votre clé API peut récupérer des indicateurs techniques et des données historiques
                complètes.
              </p>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="mt-4">
              <Alert variant="success" className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Succès!</AlertTitle>
                <AlertDescription>Votre clé API Alpha Vantage Premium fonctionne correctement.</AlertDescription>
              </Alert>

              <div className="bg-muted rounded-md p-4 mt-2">
                <p className="font-semibold mb-2">Données reçues:</p>
                <pre className="text-xs overflow-auto p-2 bg-card rounded border">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">Source des données: Alpha Vantage Premium</p>
        </CardFooter>
      </Card>
    </div>
  )
}
