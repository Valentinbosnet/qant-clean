"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EnvCheckPage() {
  const [envVars, setEnvVars] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkEnvVars = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/debug/check-env")
      if (!response.ok) {
        throw new Error("Erreur lors de la vérification des variables d'environnement")
      }

      const data = await response.json()
      setEnvVars(data)
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Vérification des Variables d&apos;Environnement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Vérifiez si toutes les variables d&apos;environnement nécessaires sont correctement configurées. Cliquez sur
            le bouton ci-dessous pour vérifier les variables d&apos;environnement requises pour l&apos;authentification
            et les autres fonctionnalités.
          </p>

          <Button onClick={checkEnvVars} disabled={loading}>
            {loading ? "Vérification..." : "Vérifier les Variables d'Environnement"}
          </Button>

          {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>}

          {envVars && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Résultats:</h3>
              <ul className="space-y-1">
                {Object.entries(envVars).map(([key, value]) => (
                  <li key={key} className="flex items-start">
                    <span className="font-medium">{key}:</span>
                    <span className={`ml-2 ${value === "Configuré" ? "text-green-600" : "text-red-600"}`}>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
