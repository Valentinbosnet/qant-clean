"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Database, Loader2 } from "lucide-react"

export default function FixSchemaPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    error?: string
    details?: string
    columns?: string[]
    addedColumns?: number
  } | null>(null)

  const runMigration = async () => {
    try {
      setIsLoading(true)
      setResult(null)

      const response = await fetch("/api/debug/fix-schema")
      const data = await response.json()

      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: "Erreur lors de l'exécution de la migration",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-10">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Database className="mr-2 h-6 w-6 text-emerald-500" />
            Correction du schéma de base de données
          </CardTitle>
          <CardDescription>Cet outil va ajouter les colonnes manquantes à la table Portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-md p-4 text-sm text-gray-300">
              <p>Cette opération va ajouter les colonnes suivantes si elles n'existent pas déjà :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>
                  <code className="bg-gray-700 px-1 rounded">balance</code> - Solde du portfolio (DECIMAL)
                </li>
                <li>
                  <code className="bg-gray-700 px-1 rounded">currency</code> - Devise du portfolio (TEXT)
                </li>
                <li>
                  <code className="bg-gray-700 px-1 rounded">isDefault</code> - Portfolio par défaut (BOOLEAN)
                </li>
              </ul>
            </div>

            {result && (
              <div
                className={`rounded-md p-4 ${
                  result.success
                    ? "bg-emerald-900/20 border border-emerald-800 text-emerald-300"
                    : "bg-red-900/20 border border-red-800 text-red-300"
                }`}
              >
                <div className="flex items-start">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">{result.message || result.error}</p>
                    {result.details && <p className="mt-1 text-sm">{result.details}</p>}
                    {result.columns && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Colonnes existantes :</p>
                        <ul className="list-disc list-inside mt-1 text-sm">
                          {result.columns.map((column) => (
                            <li key={column}>{column}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.addedColumns !== undefined && (
                      <p className="mt-2 text-sm">{result.addedColumns} colonne(s) ajoutée(s)</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={runMigration}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exécution en cours...
              </>
            ) : (
              "Exécuter la migration"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
