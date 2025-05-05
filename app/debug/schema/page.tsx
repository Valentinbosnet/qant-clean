"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function SchemaDebugPage() {
  const [schema, setSchema] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSchema = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/debug/schema")

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      setSchema(data)
    } catch (error) {
      console.error("Erreur:", error)
      setError(error instanceof Error ? error.message : "Erreur inconnue")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSchema()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-4xl bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-white text-center">Schéma de la base de données</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mr-2" />
              <span className="text-gray-400">Récupération du schéma...</span>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-700 rounded p-4 text-red-300">
              <p className="font-medium mb-2">Erreur lors de la récupération du schéma:</p>
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-white font-medium mb-2">Tables disponibles:</h3>
                {schema?.tables && schema.tables.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {schema.tables.map((table: any, index: number) => (
                      <div key={index} className="bg-gray-800 p-2 rounded text-emerald-400">
                        {table.table_name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-400">Aucune table trouvée</p>
                )}
              </div>

              {schema?.columns && Object.keys(schema.columns).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-white font-medium">Structure des tables:</h3>
                  {Object.entries(schema.columns).map(([tableName, columns]: [string, any]) => (
                    <div key={tableName} className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="text-emerald-400 font-medium mb-2">{tableName}</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-600">
                              <th className="text-left py-2 px-4 text-gray-400">Colonne</th>
                              <th className="text-left py-2 px-4 text-gray-400">Type</th>
                              <th className="text-left py-2 px-4 text-gray-400">Nullable</th>
                            </tr>
                          </thead>
                          <tbody>
                            {columns.map((column: any, index: number) => (
                              <tr key={index} className="border-b border-gray-600">
                                <td className="py-2 px-4 text-white">{column.column_name}</td>
                                <td className="py-2 px-4 text-gray-300">{column.data_type}</td>
                                <td className="py-2 px-4">
                                  <span
                                    className={column.is_nullable === "YES" ? "text-yellow-400" : "text-emerald-400"}
                                  >
                                    {column.is_nullable === "YES" ? "Oui" : "Non"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {schema?.error && (
                <div className="bg-red-900/30 border border-red-700 rounded p-4 text-red-300">
                  <p className="font-medium mb-2">Erreur détectée:</p>
                  <p>{schema.error}</p>
                </div>
              )}

              <div className="flex justify-center mt-4">
                <Button onClick={fetchSchema} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Actualiser le schéma
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
