"use client"

import { useRef } from "react"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Info, AlertTriangle, RefreshCw, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

interface TechnicalIndicatorChartProps {
  symbol: string
  indicator?: string
  timeframe?: string
}

interface IndicatorData {
  date: string
  value: number
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

export default function TechnicalIndicatorChart({
  symbol,
  indicator = "RSI",
  timeframe = "daily",
}: TechnicalIndicatorChartProps) {
  const [data, setData] = useState<IndicatorData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [technicalData, setTechnicalData] = useState<TechnicalData | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState("apercu")
  const [retryCount, setRetryCount] = useState(0)
  const [nextRetryTime, setNextRetryTime] = useState<Date | null>(null)
  const [manualRefreshCount, setManualRefreshCount] = useState(0)
  const [lastRefreshStatus, setLastRefreshStatus] = useState<"success" | "error" | null>(null)
  const [apiLimitInfo, setApiLimitInfo] = useState<{ remaining: number; resetTime: Date } | null>(null)
  const [allowSimulatedData, setAllowSimulatedData] = useState(false)
  const [dataSource, setDataSource] = useState<"real" | "simulated" | "mixed" | null>(null)
  const [aiPrediction, setAiPrediction] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  // Référence pour annuler le timer de rafraîchissement automatique
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  const fetchTechnicalData = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true)
        setManualRefreshCount((prev) => prev + 1)
        setLastRefreshStatus(null)
      } else {
        setLoading(true)
      }

      // Appeler l'API d'analyse technique avec le paramètre allowSimulated basé sur l'état
      const response = await fetch(
        `/api/premium-stock-data?symbol=${symbol}&action=technical&interval=daily${refresh ? "&refresh=true" : ""}&allowSimulated=${allowSimulatedData}`,
      )

      // Clone response before reading the body to avoid "body already read" errors
      const clonedResponse = response.clone()
      const contentType = response.headers.get("content-type")
      let errorData: any = {}

      // Only parse JSON if the content type is application/json
      if (contentType && contentType.includes("application/json")) {
        try {
          errorData = await response.json()
        } catch (e) {
          console.error("Failed to parse response JSON:", e)
        }
      }

      if (!response.ok) {
        // Gérer l'erreur de quota d'API
        if (
          response.status === 429 ||
          (response.status === 503 &&
            errorData.error &&
            (errorData.error.includes("données réelles") || errorData.error.includes("quota d'API")))
        ) {
          console.log("Quota d'API dépassé:", errorData.error)

          // Extraire les informations de limite d'API si disponibles
          if (errorData.apiLimit) {
            setApiLimitInfo({
              remaining: errorData.apiLimit.availableRequestsPerMinute || 0,
              resetTime: new Date(errorData.apiLimit.minuteResetTime || Date.now() + 60000),
            })
          }

          // Si nous autorisons les données simulées, essayons de les récupérer
          if (allowSimulatedData) {
            console.log("Tentative de récupération de données simulées...")
            try {
              const simulatedResponse = await fetch(
                `/api/technical-analysis?symbol=${symbol}${refresh ? "&refresh=true" : ""}&allowSimulated=true`,
              )

              if (simulatedResponse.ok) {
                const simulatedData = await simulatedResponse.json()
                simulatedData.lastUpdated = new Date(simulatedData.lastUpdated)
                setTechnicalData(simulatedData)
                setLastUpdated(new Date())
                setError(null)
                setDataSource(
                  simulatedData.isSimulated
                    ? "simulated"
                    : simulatedData.dataQuality === "Partiellement réelle mais fiable"
                      ? "mixed"
                      : "real",
                )
                setLastRefreshStatus("success")
                return
              }
            } catch (simError) {
              console.error("Error fetching simulated data:", simError)
            }
          }

          // Si nous n'autorisons pas les données simulées ou si la récupération a échoué
          setError(
            "Données réelles indisponibles. Quota d'API dépassé. Activez l'option 'Autoriser les données simulées' pour voir des données approximatives.",
          )
          setLastRefreshStatus("error")

          // Calculer le temps d'attente avant la prochaine tentative (exponentiel)
          const waitTime = Math.min(30, 5 * Math.pow(2, retryCount))
          const nextRetry = new Date(Date.now() + waitTime * 1000)
          setNextRetryTime(nextRetry)

          // Incrémenter le compteur de tentatives
          setRetryCount((prev) => prev + 1)

          // Programmer une nouvelle tentative automatique
          if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current)
          }

          refreshTimerRef.current = setTimeout(() => {
            console.log("Tentative automatique de rafraîchissement...")
            fetchTechnicalData(true)
          }, waitTime * 1000)

          return // On sort de la fonction pour éviter de lancer l'erreur
        }

        // Pour les autres erreurs, on lance l'exception normalement
        throw new Error(errorData.error || `Erreur API: ${response.status}`)
      }

      // If we got here, the response is ok, so use the cloned response to get the data
      const technicalDataResult = await clonedResponse.json()

      // Vérifier que les données ne sont pas simulées si nous n'autorisons pas les données simulées
      if (!allowSimulatedData && technicalDataResult.isSimulated) {
        setError("Seules des données réelles sont acceptées.")
        setLastRefreshStatus("error")

        // Calculer le temps d'attente avant la prochaine tentative
        const waitTime = Math.min(30, 5 * Math.pow(2, retryCount))
        const nextRetry = new Date(Date.now() + waitTime * 1000)
        setNextRetryTime(nextRetry)

        // Incrémenter le compteur

        setRetryCount((prev) => prev + 1)

        // Programmer une nouvelle tentative automatique
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current)
        }

        refreshTimerRef.current = setTimeout(() => {
          console.log("Tentative automatique de rafraîchissement...")
          fetchTechnicalData(true)
        }, waitTime * 1000)

        return
      }

      // Convertir la date de dernière mise à jour
      technicalDataResult.lastUpdated = new Date(technicalDataResult.lastUpdated)

      setTechnicalData(technicalDataResult)
      setLastUpdated(new Date())
      setError(null)
      setRetryCount(0)
      setNextRetryTime(null)
      setLastRefreshStatus("success")
      setDataSource(
        technicalDataResult.isSimulated
          ? "simulated"
          : technicalDataResult.dataQuality === "Partiellement réelle mais fiable"
            ? "mixed"
            : "real",
      )

      // Mettre à jour les informations de limite d'API si disponibles dans la réponse
      if (technicalDataResult.apiLimit) {
        setApiLimitInfo({
          remaining: technicalDataResult.apiLimit.availableRequestsPerMinute || 0,
          resetTime: new Date(technicalDataResult.apiLimit.minuteResetTime || Date.now() + 60000),
        })
      }

      try {
        setAiLoading(true)
        setAiError(null)

        // Create an AbortController for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

        // Use the API route instead of direct AI SDK
        const aiResponse = await fetch("/api/ai-prediction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symbol: technicalDataResult.symbol,
            data: {
              price: technicalDataResult.price,
              change: technicalDataResult.change,
              changePercent: technicalDataResult.changePercent,
              shortTerm: technicalDataResult.shortTerm,
              mediumTerm: technicalDataResult.mediumTerm,
              longTerm: technicalDataResult.longTerm,
              rsi: technicalDataResult.rsi,
              macd: technicalDataResult.macd,
              movingAverages: technicalDataResult.movingAverages,
              supportResistance: technicalDataResult.supportResistance,
              pattern: technicalDataResult.pattern,
            },
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!aiResponse.ok) {
          throw new Error(`Erreur API: ${aiResponse.status}`)
        }

        const aiData = await aiResponse.json()
        setAiPrediction(aiData.prediction)
      } catch (aiError) {
        console.error("Erreur lors de la génération de la prédiction IA:", aiError)
        setAiError(
          "Impossible de générer la prédiction IA. Veuillez réessayer plus tard ou vérifier votre connexion internet.",
        )
        // Still set a fallback prediction so the UI doesn't get stuck
        setAiPrediction(
          "L'analyse IA n'est pas disponible pour le moment. Veuillez vous référer aux indicateurs techniques pour prendre vos décisions.",
        )
      } finally {
        setAiLoading(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Impossible de charger les données techniques"
      setError(errorMessage)
      setLastRefreshStatus("error")
      console.error("Erreur lors du chargement des données techniques:", err)

      // Calculer le temps d'attente avant la prochaine tentative (exponentiel)
      const waitTime = Math.min(30, 5 * Math.pow(2, retryCount))
      const nextRetry = new Date(Date.now() + waitTime * 1000)
      setNextRetryTime(nextRetry)

      // Incrémenter le compteur de tentatives
      setRetryCount((prev) => prev + 1)

      // Programmer une nouvelle tentative automatique
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }

      refreshTimerRef.current = setTimeout(() => {
        console.log("Tentative automatique de rafraîchissement...")
        fetchTechnicalData(true)
      }, waitTime * 1000)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    const fetchIndicatorData = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/technical-analysis?symbol=${symbol}&indicator=${indicator}&timeframe=${timeframe}`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch technical indicator data")
        }

        const result = await response.json()

        if (!result.data || !Array.isArray(result.data)) {
          throw new Error("Invalid data format")
        }

        // Format data for chart
        const formattedData = result.data.map((item: any) => ({
          date: item.date,
          value: Number.parseFloat(item.value),
        }))

        setData(formattedData)
        setError(null)
      } catch (err) {
        console.error("Error fetching indicator data:", err)
        setError(err instanceof Error ? err.message : "Failed to load indicator data")
      } finally {
        setLoading(false)
      }
    }

    if (symbol) {
      fetchTechnicalData()
      fetchIndicatorData()
      // Nettoyage des timers au démontage du composant
      return () => {
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current)
        }
      }
    }
  }, [symbol, indicator, timeframe, allowSimulatedData])

  // Determine chart line color based on indicator
  const getLineColor = () => {
    switch (indicator) {
      case "RSI":
        return "#0ea5e9" // sky blue
      case "MACD":
        return "#8b5cf6" // violet
      case "SMA":
        return "#22c55e" // green
      case "EMA":
        return "#f59e0b" // amber
      default:
        return "#3b82f6" // blue
    }
  }

  // Determine threshold lines if applicable
  const renderThresholdLines = () => {
    if (indicator === "RSI") {
      return (
        <>
          <line x1="0%" y1="70" x2="100%" y2="70" stroke="#ef4444" strokeDasharray="3 3" />
          <line x1="0%" y1="30" x2="100%" y2="30" stroke="#22c55e" strokeDasharray="3 3" />
        </>
      )
    }
    return null
  }

  // Fonction pour formater les prix
  const formatPrice = (price: number | null) => {
    if (price === null) return "N/A"
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "USD" }).format(price)
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

  // Fonction pour obtenir l'icône en fonction de la tendance
  const getTrendIcon = (trend: string) => {
    if (trend === "Haussière" || trend === "Haussier") return <TrendingUp className="h-5 w-5 text-green-400" />
    if (trend === "Baissière" || trend === "Baissier") return <TrendingDown className="h-5 w-5 text-red-400" />
    return <Info className="h-5 w-5 text-gray-400" />
  }

  // Fonction pour formater le temps écoulé
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)

    if (diffSeconds < 10) return "à l'instant"
    if (diffSeconds < 60) return `il y a ${diffSeconds} secondes`

    if (diffMinutes < 60) return `il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`

    return date.toLocaleTimeString()
  }

  // Fonction pour formater le temps restant avant la prochaine tentative
  const formatTimeRemaining = () => {
    if (!nextRetryTime) return ""

    const now = new Date()
    const diffSeconds = Math.max(0, Math.floor((nextRetryTime.getTime() - now.getTime()) / 1000))

    if (diffSeconds < 1) return "maintenant"
    if (diffSeconds < 60) return `dans ${diffSeconds} seconde${diffSeconds > 1 ? "s" : ""}`

    const minutes = Math.floor(diffSeconds / 60)
    const seconds = diffSeconds % 60

    if (minutes < 60) {
      return `dans ${minutes} minute${minutes > 1 ? "s" : ""} et ${seconds} seconde${seconds > 1 ? "s" : ""}`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    return `dans ${hours} heure${hours > 1 ? "s" : ""} et ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`
  }

  // Fonction pour gérer le rafraîchissement manuel
  const handleManualRefresh = () => {
    // Si le temps d'attente n'est pas écoulé, on affiche un message
    if (nextRetryTime && nextRetryTime.getTime() > Date.now()) {
      // On peut quand même forcer le rafraîchissement, mais on prévient l'utilisateur
      if (
        window.confirm(
          `Le temps d'attente recommandé n'est pas écoulé. Forcer le rafraîchissement pourrait entraîner des erreurs de quota d'API. Voulez-vous continuer ?`,
        )
      ) {
        fetchTechnicalData(true)
      }
    } else {
      fetchTechnicalData(true)
    }
  }

  // Fonction pour gérer le changement de mode de données
  const handleDataModeChange = (checked: boolean) => {
    setAllowSimulatedData(checked)
    // Réinitialiser les compteurs et les erreurs
    setRetryCount(0)
    setNextRetryTime(null)
    setError(null)
    setTechnicalData(null)
    setLoading(true)
    // Récupérer les données avec le nouveau mode
    fetchTechnicalData()
  }

  // Fonction pour obtenir la classe de couleur pour RSI
  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return "text-red-400" // Surachat
    if (rsi < 30) return "text-green-400" // Survente
    return "text-gray-400" // Neutre
  }

  // Fonction pour obtenir la classe de couleur pour MACD
  const getMACDColor = (histogram: number) => {
    if (histogram > 0) return "text-green-400" // Tendance haussière
    if (histogram < 0) return "text-red-400" // Tendance baissière
    return "text-gray-400" // Neutre
  }

  return (
    <Card className="bg-gray-800 border-gray-700 mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white">Analyse technique détaillée</CardTitle>
            <CardDescription>
              Analyse et prédictions pour {symbol}
              {lastUpdated && (
                <span className="text-xs text-gray-400 ml-2">Mise à jour: {formatTimeAgo(lastUpdated)}</span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Indicateur de source de données */}
        <div className="flex items-center mb-4">
          <Switch id="data-mode" checked={allowSimulatedData} onCheckedChange={handleDataModeChange} />
          <Label htmlFor="data-mode" className="ml-2 text-white">
            Autoriser les données simulées
          </Label>
        </div>

        {/* Affichage des données techniques */}
        {loading ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <Skeleton className="w-full h-[300px]" />
          </div>
        ) : error ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
            {error}
          </div>
        ) : (
          technicalData && (
            <div className="space-y-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-white mb-3">Tendances</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Court terme (7 jours)</span>
                    <span
                      className={`text-sm font-medium ${getTrendColorClass(technicalData?.shortTerm?.trend || "")}`}
                    >
                      {technicalData?.shortTerm?.trend || "N/A"} (
                      {formatPercentage(technicalData?.shortTerm?.value || 0)})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Moyen terme (30 jours)</span>
                    <span
                      className={`text-sm font-medium ${getTrendColorClass(technicalData?.mediumTerm?.trend || "")}`}
                    >
                      {technicalData?.mediumTerm?.trend || "N/A"} (
                      {formatPercentage(technicalData?.mediumTerm?.value || 0)})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Long terme (90 jours)</span>
                    <span className={`text-sm font-medium ${getTrendColorClass(technicalData?.longTerm?.trend || "")}`}>
                      {technicalData?.longTerm?.trend || "N/A"} ({formatPercentage(technicalData?.longTerm?.value || 0)}
                      )
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-white mb-3">Indicateurs clés</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-300">RSI (14)</p>
                    <p className={`font-medium ${getRSIColor(technicalData?.rsi || 50)}`}>
                      {(technicalData?.rsi || 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">MACD</p>
                    <p className={`font-medium ${getMACDColor(technicalData?.macd?.histogram?.[0] || 0)}`}>
                      {technicalData?.macd?.signal || "N/A"} ({(technicalData?.macd?.value || 0).toFixed(2)})
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-white mb-3">Supports et résistances</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-300">Support 1</p>
                    <p className="font-medium text-white">
                      {technicalData?.supportResistance?.supports?.[0]?.price || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Résistance 1</p>
                    <p className="font-medium text-white">
                      {technicalData?.supportResistance?.resistances?.[0]?.price || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Support 2</p>
                    <p className="font-medium text-white">
                      {technicalData?.supportResistance?.supports?.[1]?.price || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Résistance 2</p>
                    <p className="font-medium text-white">
                      {technicalData?.supportResistance?.resistances?.[1]?.price || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              {aiLoading ? (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-white mb-3">Prédiction de l'IA</h3>
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                    <span className="text-gray-300">Génération de l'analyse...</span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-white mb-3">Prédiction de l'IA</h3>
                  {aiError ? (
                    <div className="flex items-center text-yellow-400 mb-2">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="text-sm">{aiError}</span>
                    </div>
                  ) : null}
                  <p className="text-gray-300">{aiPrediction || "Aucune prédiction disponible pour le moment."}</p>
                </div>
              )}
            </div>
          )
        )}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {indicator} - {symbol.toUpperCase()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="w-full h-[300px] flex items-center justify-center">
                <Skeleton className="w-full h-[300px]" />
              </div>
            ) : error ? (
              <div className="w-full h-[300px] flex items-center justify-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getDate()}`
                      }}
                    />
                    <YAxis domain={indicator === "RSI" ? [0, 100] : ["auto", "auto"]} />
                    <Tooltip
                      formatter={(value: number) => [value.toFixed(2), indicator]}
                      labelFormatter={(label) => {
                        const date = new Date(label)
                        return date.toLocaleDateString()
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={getLineColor()}
                      dot={false}
                      strokeWidth={2}
                      name={indicator}
                    />
                    {renderThresholdLines()}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-gray-500">
            {dataSource === "real" && "Données en temps réel"}
            {dataSource === "simulated" && "Données simulées"}
            {dataSource === "mixed" && "Données partiellement réelles"}
            {lastUpdated && ` - Dernière mise à jour: ${formatTimeAgo(lastUpdated)}`}
            {nextRetryTime && <span className="ml-2">Prochaine tentative: {formatTimeRemaining()}</span>}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-300"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Rafraîchissement...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Rafraîchir
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
