"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
// No Supabase import needed

interface RealTimeAnalysisProps {
  symbol: string
}

export default function RealTimeAnalysis({ symbol }: RealTimeAnalysisProps) {
  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true)
        setError(null)

        // Effectuer la requête vers l'API sans token d'authentification
        // L'authentification sera gérée par les cookies de session
        const response = await fetch(`/api/real-time-predictions?symbol=${symbol}`)

        if (!response.ok) {
          throw new Error(`Erreur lors de la récupération des données (${response.status})`)
        }

        const data = await response.json()
        setPrediction(data)
      } catch (error: any) {
        console.error("Erreur lors de la récupération des données:", error)
        setError(error.message || "Erreur lors de la récupération des données")
      } finally {
        setLoading(false)
      }
    }

    fetchPrediction()
  }, [symbol])

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">{symbol}</CardTitle>
        <CardDescription>Prédiction en temps réel</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
            <span className="ml-2 text-gray-400">Chargement...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-red-500">{error}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Prédiction:</span>
              <span className="text-white font-medium">{prediction?.prediction || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Confiance:</span>
              <span className="text-white font-medium">{prediction?.confidence || "N/A"}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
