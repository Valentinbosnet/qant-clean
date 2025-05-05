"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, Activity, Minus, Clock, AlertTriangle } from "lucide-react"
import RealTimeAnalysis from "@/components/real-time-analysis"
import TechnicalIndicatorChart from "@/components/technical-indicator-chart"
import ProgressiveAnalysisCard from "@/components/progressive-analysis-card"
import { popularStocks } from "@/lib/stock-service"

interface Portfolio {
  id: string
  name: string
  balance: number
  currency: string
}

interface TechnicalIndicator {
  value: number
  interpretation: string
  description: string
}

interface MACD extends TechnicalIndicator {
  signal: number
  histogram: number
}

interface MovingAverages extends TechnicalIndicator {
  ma20: number
  ma50: number
  ma200: number
}

interface BollingerBands extends TechnicalIndicator {
  upper: number
  middle: number
  lower: number
  width: number
}

interface SupportResistance extends TechnicalIndicator {
  supports: number[]
  resistances: number[]
}

interface VolumeAnalysis {
  trend: string
  interpretation: string
  description: string
}

interface PatternRecognition {
  pattern: string
  reliability: string
  target: number
  description: string
}

interface Fundamentals {
  pe: number
  eps: number
  dividendYield: number
  marketCap: string
  beta: number
  avgVolume: string
}

interface Prediction {
  symbol: string
  name?: string
  currentPrice: number
  previousPrice: number
  change: number
  changePercent: number
  dayHigh?: number
  dayLow?: number
  volume?: number
  history: { timestamp: string; price: number }[]
  shortTerm: { trend: string; percentage: number }
  mediumTerm: { trend: string; percentage: number }
  longTerm: { trend: string; percentage: number }
  analysis: string
  lastUpdated: string
  technicalIndicators?: {
    rsi: TechnicalIndicator
    macd: MACD
    movingAverages: MovingAverages
    bollingerBands: BollingerBands
    supportResistance: SupportResistance
  }
  volumeAnalysis?: VolumeAnalysis
  patternRecognition?: PatternRecognition
  fundamentals?: Fundamentals
}

// Liste des indices populaires pour la recherche
const popularIndices = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "WMT", name: "Walmart Inc." },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "PG", name: "Procter & Gamble Co." },
  { symbol: "MA", name: "Mastercard Inc." },
  { symbol: "UNH", name: "UnitedHealth Group Inc." },
  { symbol: "HD", name: "Home Depot Inc." },
  { symbol: "BAC", name: "Bank of America Corp." },
  { symbol: "XOM", name: "Exxon Mobil Corporation" },
  { symbol: "PFE", name: "Pfizer Inc." },
  { symbol: "CSCO", name: "Cisco Systems Inc." },
  { symbol: "ADBE", name: "Adobe Inc." },
]

export default function PredictionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const [selectedAsset, setSelectedAsset] = useState<string>("")
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPredictionLoading, setIsPredictionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // États pour le formulaire d'ajout au portfolio
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("")
  const [amount, setAmount] = useState<string>("1000")
  const [isAdding, setIsAdding] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Nouvel état pour la durée de la prédiction
  const [predictionDuration, setPredictionDuration] = useState<number>(30) // Jours par défaut
  const [predictionEndDate, setPredictionEndDate] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

  // Nouvel état pour les onglets d'analyse
  const [activeTab, setActiveTab] = useState<string>("overview")

  // Nouvel état pour l'affichage de l'analyse en temps réel
  const [showRealTimeAnalysis, setShowRealTimeAnalysis] = useState<boolean>(false)

  const [selectedStock, setSelectedStock] = useState<string | null>(null)

  // Nouvel état pour le type d'analyse
  const [analysisType, setAnalysisType] = useState<string>("standard")

  // Charger les portfolios
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/portfolios")

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des portfolios")
        }

        const data = await response.json()
        setPortfolios(data)

        // Sélectionner le premier portfolio par défaut s'il y en a
        if (data.length > 0 && !selectedPortfolio) {
          setSelectedPortfolio(data[0].id)
        }
      } catch (error) {
        console.error("Erreur:", error)
        setError("Impossible de charger vos portfolios. Veuillez réessayer.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPortfolios()
  }, [])

  // Fonction de recherche d'indices
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)

    try {
      const response = await fetch(`/api/search-stocks?query=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`)
      }

      const data = await response.json()
      setSearchResults(data)
    } catch (err) {
      console.error("Erreur lors de la recherche:", err)
      setError("Impossible de rechercher des indices. Veuillez réessayer.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handlePredict = (symbol: string) => {
    setSelectedStock(symbol)
    setSelectedAsset(symbol)
  }

  // Charger la prédiction lorsqu'un actif est sélectionné
  const fetchPrediction = async (symbol: string) => {
    if (!symbol) return

    try {
      setIsPredictionLoading(true)
      setError(null)
      const response = await fetch(`/api/premium-stock-data?symbol=${symbol}&action=technical`) // Utiliser la nouvelle API

      if (!response.ok) {
        console.error("Erreur API prédiction détaillée:", response.status, response.statusText)
        throw new Error("Impossible de charger les données pour cet indice")
      }

      const data = await response.json()
      if (data && data.symbol) {
        setPrediction(data)
        setLastUpdated(new Date(data.lastUpdated || new Date()))
      } else {
        throw new Error("Données incorrectes reçues de l'API")
      }
    } catch (error) {
      console.error("Erreur:", error)
      setError("Impossible de charger la prédiction pour cet indice. Veuillez réessayer.")
      setPrediction(null)
    } finally {
      setIsPredictionLoading(false)
    }
  }

  // Mettre à jour la prédiction lorsqu'un actif est sélectionné
  useEffect(() => {
    if (selectedAsset) {
      fetchPrediction(selectedAsset)
      // Réinitialiser l'état de l'analyse en temps réel
      setShowRealTimeAnalysis(false)
    }
  }, [selectedAsset])

  // Mettre à jour la date de fin lorsque la durée change
  useEffect(() => {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + predictionDuration)
    setPredictionEndDate(endDate)
  }, [predictionDuration])

  const handleDurationChange = (value: number[]) => {
    setPredictionDuration(value[0])
  }

  const handleAddToPortfolio = async () => {
    if (!selectedPortfolio || !selectedAsset || !amount || !prediction) {
      setError("Veuillez sélectionner un portfolio et spécifier un montant")
      return
    }

    try {
      setIsAdding(true)
      setError(null)
      setSuccess(null)

      // Appeler l'API pour ajouter la prédiction au portfolio
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          portfolioId: selectedPortfolio,
          type: "PREDICTION",
          symbol: selectedAsset,
          amount: Number.parseFloat(amount),
          price: prediction.currentPrice,
          date: new Date().toISOString(),
          expiryDate: predictionEndDate.toISOString(),
          duration: predictionDuration,
          initialValue: Number.parseFloat(amount),
          currentValue: Number.parseFloat(amount),
          expectedReturn: prediction.shortTerm.percentage,
          analysis: prediction.analysis,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout au portfolio")
      }

      setSuccess(
        `Prédiction de ${amount}€ sur ${selectedAsset} ajoutée à votre portfolio pour ${predictionDuration} jours !`,
      )
      setIsDialogOpen(false)

      // Rafraîchir les données du portfolio après l'ajout de la prédiction
      try {
        // Attendre un court instant pour que la transaction soit enregistrée
        setTimeout(async () => {
          // Rafraîchir la liste des portfolios
          const portfoliosResponse = await fetch("/api/portfolios")
          if (portfoliosResponse.ok) {
            const updatedPortfolios = await portfoliosResponse.json()
            setPortfolios(updatedPortfolios)
          }
        }, 500)
      } catch (refreshError) {
        console.error("Erreur lors du rafraîchissement des données:", refreshError)
      }
    } catch (error) {
      console.error("Erreur:", error)
      setError("Impossible d'ajouter au portfolio. Veuillez réessayer.")
    } finally {
      setIsAdding(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffSeconds < 10) return "à l'instant"
    if (diffSeconds < 60) return `il y a ${diffSeconds} secondes`

    const diffMinutes = Math.floor(diffSeconds / 60)
    if (diffMinutes < 60) return `il y a ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`

    return date.toLocaleTimeString()
  }

  // Fonction pour obtenir la couleur en fonction de la tendance
  const getTrendColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case "bullish":
        return "text-green-400"
      case "bearish":
        return "text-red-400"
      case "neutral":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  // Fonction pour obtenir l'icône en fonction de la tendance
  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case "bullish":
        return <TrendingUp className="h-5 w-5 text-green-400" />
      case "bearish":
        return <TrendingDown className="h-5 w-5 text-red-400" />
      case "neutral":
        return <Minus className="h-5 w-5 text-yellow-400" />
      default:
        return <Activity className="h-5 w-5 text-gray-400" />
    }
  }

  // Fonction pour formater les nombres avec séparateurs de milliers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fr-FR").format(num)
  }

  // Fonction pour obtenir la couleur en fonction de la valeur du RSI
  const getRSIColor = (value: number) => {
    if (value >= 70) return "text-red-400"
    if (value <= 30) return "text-green-400"
    return "text-yellow-400"
  }

  // Fonction pour obtenir la couleur en fonction de la valeur du MACD
  const getMACDColor = (histogram: number) => {
    if (histogram > 0) return "text-green-400"
    if (histogram < 0) return "text-red-400"
    return "text-yellow-400"
  }

  // Fonction pour basculer l'affichage de l'analyse en temps réel
  const toggleRealTimeAnalysis = () => {
    setShowRealTimeAnalysis(!showRealTimeAnalysis)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Prédictions en temps réel</h1>
        <p className="text-gray-400 mb-4">
          Recherchez un indice et obtenez des analyses techniques détaillées basées sur des données en temps réel
          <span className="text-xs ml-2 text-emerald-400">Dernière mise à jour: à l'instant</span>
        </p>

        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">À propos des données boursières</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 text-sm">
            <p className="mb-2">
              Cette application utilise l'API Alpha Vantage pour récupérer des données boursières en temps réel.
              Veuillez noter que la version gratuite de l'API a des limites de 5 requêtes par minute et 500 requêtes par
              jour.
            </p>
            <p>
              Si vous rencontrez des erreurs ou des données manquantes, cela peut être dû à ces limitations. Les données
              sont mises en cache pendant 1 minute pour optimiser l'utilisation de l'API.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Rechercher un indice</CardTitle>
            <CardDescription>
              Entrez le nom ou le symbole d'un indice pour obtenir des analyses techniques détaillées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                placeholder="Ex: AAPL, MSFT, GOOGL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSearching ? "Recherche..." : "Rechercher"}
              </Button>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Indices populaires:</h3>
              <div className="flex flex-wrap gap-2">
                {popularStocks.map((stock) => (
                  <Badge
                    key={stock}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-700"
                    onClick={() => {
                      setSearchQuery(stock)
                      handleSearch()
                    }}
                  >
                    {stock}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center text-yellow-500">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {searchResults.length > 0 && (
        <div className="mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Résultats de recherche</CardTitle>
              <CardDescription>
                {searchResults.length} résultat(s) trouvé(s) pour "{searchQuery}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-400">Symbole</TableHead>
                    <TableHead className="text-gray-400">Nom</TableHead>
                    <TableHead className="text-gray-400">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((result) => (
                    <TableRow key={result.symbol}>
                      <TableCell className="font-medium text-white">{result.symbol}</TableCell>
                      <TableCell className="text-gray-300">{result.name}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handlePredict(result.symbol)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Prédire
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedStock && (
        <div>
          <div className="flex items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Analyse pour {selectedStock}</h2>
            <Badge className="ml-2 bg-emerald-600 text-white">
              <Clock className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
          </div>

          <div className="mb-4">
            <Tabs defaultValue="progressive" className="mb-4">
              <TabsList className="bg-gray-700 border-gray-600">
                <TabsTrigger
                  value="progressive"
                  className="data-[state=active]:bg-blue-600"
                  onClick={() => setAnalysisType("progressive")}
                >
                  Analyse Progressive
                </TabsTrigger>
                <TabsTrigger
                  value="realtime"
                  className="data-[state=active]:bg-emerald-600"
                  onClick={() => setAnalysisType("realtime")}
                >
                  Analyse en temps réel
                </TabsTrigger>
                <TabsTrigger
                  value="technical"
                  className="data-[state=active]:bg-purple-600"
                  onClick={() => setAnalysisType("technical")}
                >
                  Analyse technique
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {analysisType === "progressive" && <ProgressiveAnalysisCard symbol={selectedStock} />}

          {analysisType === "realtime" && <RealTimeAnalysis symbol={selectedStock} />}

          {analysisType === "technical" && <TechnicalIndicatorChart symbol={selectedStock} />}

          {prediction && (
            <div>
              <p>Prix actuel: {prediction.currentPrice}</p>
              <p>Volume: {prediction.volume}</p>
              {/* Afficher d'autres indicateurs techniques */}
              {prediction.technicalIndicators?.rsi && <p>RSI: {prediction.technicalIndicators.rsi.value}</p>}
              {prediction.technicalIndicators?.macd && <p>MACD: {prediction.technicalIndicators.macd.value}</p>}
              {/* ... */}
            </div>
          )}
        </div>
      )}

      <Card className="bg-gray-800 border-gray-700 mt-8">
        <CardHeader>
          <CardTitle className="text-white">À propos des prédictions</CardTitle>
          <CardDescription>
            Comment utiliser les prédictions pour améliorer vos décisions d'investissement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>Analyse progressive</strong> - Notre système d'analyse progressive compare les prédictions passées
              avec les résultats réels pour améliorer continuellement la précision des prédictions futures. Le niveau de
              confiance minimum est de 65%.
            </li>
            <li>
              <strong>Prédictions de prix</strong> - Estimations basées sur l'analyse technique et les tendances
              actuelles.
            </li>
            <li>
              <strong>Indice de confiance</strong> - Indique la fiabilité des prédictions à différents horizons
              temporels.
            </li>
            <li>
              <strong>Signaux techniques</strong> - Analyse des indicateurs comme le MACD, RSI et moyennes mobiles.
            </li>
            <li>
              <strong>Analyse des risques</strong> - Évaluation des facteurs de risque potentiels pour l'investissement.
            </li>
            <li>
              <strong>Impact des actualités</strong> - Analyse des événements récents qui pourraient affecter le cours.
            </li>
            <li className="font-medium text-amber-600">
              Note: Ces prédictions sont générées automatiquement et ne constituent pas des conseils financiers.
              Consultez un professionnel avant de prendre des décisions d'investissement.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
