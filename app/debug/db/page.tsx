"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function DbDebugPage() {
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDbStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/debug/db-connection")

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      setDbStatus(data)
    } catch (error) {
      console.error("Erreur:", error)
      setError(error instanceof Error ? error.message : "Erreur inconnue")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDbStatus()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-3xl bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white text-center">Diagnostic de la base de données</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mr-2" />
              <span className="text-gray-400">Vérification de la base de données...</span>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-700 rounded p-4 text-red-300">
              <p className="font-medium mb-2">Erreur lors de la vérification de la base de données:</p>
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">État de la connexion:</h3>
                <p className={dbStatus?.connection ? "text-emerald-400" : "text-red-400"}>
                  {dbStatus?.connection ? "Connecté" : "Non connecté"}
                </p>
                {dbStatus?.error && (
                  <div className="mt-2 bg-red-900/30 p-3 rounded text-red-300 text-sm">
                    <p className="font-medium">Erreur:</p>
                    <p className="font-mono text-xs mt-1 break-all">{dbStatus.error}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">URL de la base de données:</h3>
                <p className="text-gray-300">{dbStatus?.databaseUrl || "Non configurée"}</p>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">Version de Prisma:</h3>
                <p className="text-gray-300">{dbStatus?.prismaVersion || "Inconnue"}</p>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">Tables disponibles:</h3>
                {dbStatus?.tables && dbStatus.tables.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {dbStatus.tables.map((table: any, index: number) => (
                      <div key={index} className="bg-gray-800 p-2 rounded text-emerald-400">
                        {table.table_name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-400">Aucune table trouvée</p>
                )}
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">Modèles Prisma disponibles:</h3>
                {dbStatus?.models && dbStatus.models.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {dbStatus.models.map((model: string, index: number) => (
                      <div key={index} className="bg-gray-800 p-2 rounded text-emerald-400">
                        {model}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-400">Aucun modèle trouvé</p>
                )}
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">Test d'insertion:</h3>
                {dbStatus?.rawQuery ? (
                  dbStatus.rawQuery.success ? (
                    <p className="text-emerald-400">Succès</p>
                  ) : (
                    <div>
                      <p className="text-red-400">Échec</p>
                      <p className="text-red-300 text-sm mt-1">{dbStatus.rawQuery.error}</p>
                      <p className="text-red-300 text-sm mt-1">{dbStatus.rawQuery.secondError}</p>
                    </div>
                  )
                ) : (
                  <p className="text-gray-400">Non testé</p>
                )}
              </div>

              <div className="flex justify-center mt-4">
                <Button onClick={fetchDbStatus} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Actualiser le diagnostic
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
