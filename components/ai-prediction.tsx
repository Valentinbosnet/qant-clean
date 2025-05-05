"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"

interface AIPredictionProps {
  data: any
}

export default function AIPrediction({ data }: AIPredictionProps) {
  const [prediction, setPrediction] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAIPrediction = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/ai-prediction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data }),
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de la prédiction")
        }

        const result = await response.json()
        setPrediction(result.prediction)
      } catch (error) {
        console.error("Erreur:", error)
        setError("Impossible de charger la prédiction. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    fetchAIPrediction()
  }, [data])

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Prédiction de l'IA</CardTitle>
        <CardDescription>Analyse basée sur l'intelligence artificielle</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mr-2" />
            <span className="text-gray-400">Chargement de la prédiction...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-4">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <span className="text-red-400">{error}</span>
          </div>
        ) : (
          <p className="text-gray-300">{prediction}</p>
        )}
      </CardContent>
    </Card>
  )
}
