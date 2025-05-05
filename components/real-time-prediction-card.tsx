"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCwIcon, AlertTriangleIcon } from "lucide-react"
import { Loader2 } from "lucide-react"

interface RealTimePredictionCardProps {
  symbol: string
}

interface TechnicalData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  shortTerm: {
    trend: "Haussière" | "Baissière" | "Neutre"
    value: number
    strength: number
  }
  mediumTerm: {
    trend: "Haussière" | "Baissière" | "Neutre"
    value: number
    strength: number
  }
  longTerm: {
    trend: "Haussière" | "Baissière" | "Neutre"
    value: number
    strength: number
  }
  dayHigh: number | null
  dayLow: number | null
  volume: number | null
  rsi: number
  macd: {
    value: number
    signal: "Achat" | "Vente" | "Neutre"
    histogram: number[]
  }
  movingAverages: {
    ma20: number
    ma50: number
    ma200: number
    alignment: "Haussier" | "Baissière" | "Mixte"
    values: {
      ma20: number[]
      ma50: number[]
      ma200: number[]
    }
  }
  bollingerBands: {
    upper: number
    middle: number
    lower: number
    width: number
    trend: "Expansion" | "Contraction" | "Stable"
  }
  fibonacci: {
    levels: {
      level: number
      price: number
      significance: "Support" | "Résistance" | "Neutre"
    }[]
    trend: "Haussier" | "Baissier" | "Neutre"
  }
  pattern: {
    name: string
    reliability: "Élevée" | "Modérée" | "Faible"
    target: number
    description: string
    probability: number
  }
  supportResistance: {
    supports: { price: number; strength: "Forte" | "Modérée" | "Faible" }[]
    resistances: { price: number; strength: "Forte" | "Modérée" | "Faible" }[]
  }
  volumeProfile: {
    trend: "Haussier" | "Baissier" | "Neutre"
    strength: number
    distribution: number[]
  }
  summary: string
  detailedAnalysis: string
  lastUpdated: Date
  isSimulated: boolean
  dataQuality?: string
  realDataPoints?: {
    price: boolean
    volume: boolean
    rsi: boolean
    macd: boolean
    ma20: boolean
    ma50: boolean
    ma200: boolean
  }
  error?: string
}

export default function RealTimePredictionCard({ symbol }: RealTimePredictionCardProps) {
  const [data, setData] = useState<TechnicalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchPrediction = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      // Add a timeout to the fetch request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      // Call the premium API endpoint to get detailed analysis
      const response = await fetch(
        `/api/premium-stock-data?symbol=${symbol}&action=technical&interval=daily${refresh ? "&refresh=true" : ""}`,
        { signal: controller.signal },
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Erreur lors du chargement de la prédiction:", err)

      if (err.name === "AbortError") {
        setError("La requête a pris trop de temps. Veuillez réessayer.")
      } else {
        setError("Impossible de charger la prédiction. Veuillez réessayer.")
      }
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (symbol) {
      fetchPrediction()
    }
  }, [symbol])

  // Fonction pour formater les prix
  const formatPrice = (price: number | null) => {
    if (price === null) return "N/A"
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(price)
  }

  // Fonction pour formater les pourcentages
  const formatPercentage = (percentage: number) => {
    return `${percentage > 0 ? "+" : ""}${percentage.toFixed(2)}%`
  }

  // Fonction pour obtenir la classe de couleur en fonction de la tendance
  const getTrendColorClass = (trend: string) => {
    if (trend === "Haussière" || trend === "Haussier") return "text-green-400"
    if (trend === "Baissière" || trend === "Baissier") return "text-red-400"
    return "text-gray-400"
  }

  return (
    <Card className="w-full h-full shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{symbol}</CardTitle>
            <CardDescription>Prédiction en temps réel</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-4">
            <AlertTriangleIcon className="h-6 w-6 text-yellow-500 mr-2" />
            {error}
          </div>
        ) : (
          data && (
            <div className="space-y-4">
              {/* Affichez les données de l'analyse technique */}
              {/* Tendances */}
              {data.shortTerm && (
                <div className="bg-gray-700 p-3 rounded-lg">
                  <h3 className="text-sm font-semibold text-white">Tendances</h3>
                  <p className="text-sm text-gray-300">Court terme: {data.shortTerm.trend}</p>
                  <p className="text-sm text-gray-300">Moyen terme: {data.mediumTerm.trend}</p>
                  <p className="text-sm text-gray-300">Long terme: {data.longTerm.trend}</p>
                </div>
              )}

              {/* Niveau de résistance et de support */}
              {data.supportResistance && (
                <div className="bg-gray-700 p-3 rounded-lg">
                  <h3 className="text-sm font-semibold text-white">Supports et résistances</h3>
                  <p className="text-sm text-gray-300">Support 1: {data.supportResistance.supports[0]?.price}</p>
                  <p className="text-sm text-gray-300">Résistance 1: {data.supportResistance.resistances[0]?.price}</p>
                </div>
              )}

              {/* Aperçu général du volume */}
              {data.volumeProfile && (
                <div className="bg-gray-700 p-3 rounded-lg">
                  <h3 className="text-sm font-semibold text-white">Volume</h3>
                  <p className="text-sm text-gray-300">
                    Tendance du volume: {data.volumeProfile.trend}, force: {data.volumeProfile.strength}
                  </p>
                </div>
              )}

              {/* Affichez d'autres détails */}
              <p className="text-gray-300">Prix: {formatPrice(data.price)}</p>
              <p className="text-gray-300">
                Changement: {data.change} ({formatPercentage(data.changePercent)})
              </p>
            </div>
          )
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <button
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center transition-colors"
          onClick={() => fetchPrediction(true)}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Rafraîchissement...
            </>
          ) : (
            <>
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Rafraîchir la prédiction
            </>
          )}
        </button>
        {lastUpdated && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Dernière mise à jour: {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </CardFooter>
    </Card>
  )
}
