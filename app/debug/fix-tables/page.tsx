"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function FixTablesPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fixTables = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/debug/fix-tables")
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || "Une erreur est survenue")
        setResult(data)
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Corriger les tables de la base de données</CardTitle>
          <CardDescription>
            Cette page vous permet de vérifier et corriger les tables nécessaires pour le système d'authentification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Résultats :</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  {result.verification_codes_exists || result.verification_codes_created ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span>
                    Table verification_codes :{" "}
                    {result.verification_codes_exists
                      ? "Existe déjà"
                      : result.verification_codes_created
                        ? "Créée avec succès"
                        : "Non créée"}
                  </span>
                </div>
                <div className="flex items-center">
                  {result.verification_tokens_exists || result.verification_tokens_created ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span>
                    Table verification_tokens :{" "}
                    {result.verification_tokens_exists
                      ? "Existe déjà"
                      : result.verification_tokens_created
                        ? "Créée avec succès"
                        : "Non créée"}
                  </span>
                </div>
                <div className="flex items-center">
                  {result.email_logs_fixed ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span>
                    Table email_logs : {result.email_logs_fixed ? "Vérifiée/créée avec succès" : "Non vérifiée"}
                  </span>
                </div>
              </div>

              {result.sql && (
                <div className="mt-4">
                  <h4 className="text-md font-medium mb-2">SQL à exécuter manuellement :</h4>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">{result.sql}</pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={fixTables} disabled={loading}>
            {loading ? "Vérification en cours..." : "Vérifier et corriger les tables"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
