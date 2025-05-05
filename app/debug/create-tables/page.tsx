"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateTablesPage() {
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    error?: string
    instructions?: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const createTables = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/debug/create-tables", {
        method: "POST",
      })

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setResult({ error: err.message || "Une erreur s'est produite" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Création des Tables Supabase</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Cette page vous permet de vérifier et créer les tables nécessaires dans votre base de données Supabase.
            Cliquez sur le bouton ci-dessous pour vérifier les tables requises pour l&apos;authentification et les
            autres fonctionnalités.
          </p>

          <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded">
            <strong>Note importante :</strong> Certaines tables devront être créées manuellement via l&apos;éditeur SQL
            de Supabase. Les instructions seront affichées après la vérification.
          </div>

          <Button onClick={createTables} disabled={loading}>
            {loading ? "Vérification des tables..." : "Vérifier les Tables"}
          </Button>

          {result && (
            <div className="mt-4">
              <div
                className={`p-4 rounded mb-4 ${result.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {result.success ? result.message : result.error}
              </div>

              {result.instructions && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <h3 className="font-bold mb-2">Instructions SQL</h3>
                  <pre className="whitespace-pre-wrap text-sm bg-gray-800 text-white p-4 rounded overflow-auto">
                    {result.instructions}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
