"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function CreateMissingTablesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  async function createTables() {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/debug/create-missing-tables")
      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setResult(data.sql || null) // Afficher le SQL en cas d'erreur
      } else {
        setResult(data.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Créer les tables manquantes</CardTitle>
          <CardDescription>
            Cette page vous permet de créer les tables manquantes dans votre base de données Supabase.
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

          {result && !error && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">Succès</AlertTitle>
              <AlertDescription className="text-green-600">{result}</AlertDescription>
            </Alert>
          )}

          {result && error && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">SQL à exécuter manuellement :</h3>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-xs">{result}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={createTables} disabled={isLoading}>
            {isLoading ? "Création en cours..." : "Créer les tables manquantes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
