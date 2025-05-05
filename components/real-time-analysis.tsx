"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RealTimeAnalysisProps {
  symbol: string
}

export default function RealTimeAnalysis({ symbol }: RealTimeAnalysisProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Version simplifiée qui utilise des données fictives
  useEffect(() => {
    setLoading(true)

    // Simuler un délai de chargement
    setTimeout(() => {
      setData({
        symbol,
        currentPrice: Math.round((50 + Math.random() * 450) * 100) / 100,
        prediction: Math.random() > 0.5 ? "Hausse attendue" : "Baisse probable",
        confidence: Math.round((60 + Math.random() * 35) * 10) / 10,
      })
      setLoading(false)
    }, 500)
  }, [symbol])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse en temps réel: {symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Chargement...</div>
        ) : data ? (
          <div>
            <div>Prix actuel: ${data.currentPrice?.toFixed(2)}</div>
            <div>Prédiction: {data.prediction}</div>
            <div>Confiance: {data.confidence}%</div>
          </div>
        ) : (
          <div>Aucune donnée disponible</div>
        )}
      </CardContent>
    </Card>
  )
}
