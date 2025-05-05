"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Wallet,
  PlusCircle,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { getLocalPortfolios } from "@/lib/local-storage"
import { Progress } from "@/components/ui/progress"

interface Portfolio {
  id: string
  name: string
  description?: string
  balance?: number
  currency?: string
  userId: string
  createdAt: string
  updatedAt: string
  _isMock?: boolean
  _isLocal?: boolean
}

interface Prediction {
  id: string
  type: string
  symbol: string
  amount: number
  price: number
  date: string
  expiryDate: string
  duration: number
  initialValue: number
  currentValue: number
  expectedReturn: number
  analysis?: string
  portfolioId: string
  userId: string
}

export default function PortfolioDetailPage() {
  const params = useParams()
  const router = useRouter()
  const portfolioId = params.id as string

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPredictionsLoading, setIsPredictionsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Essayer d'abord de récupérer depuis l'API
        try {
          const response = await fetch(`/api/portfolios/${portfolioId}`)

          if (response.ok) {
            const data = await response.json()
            setPortfolio(data)
            return
          }

          // Si l'API échoue, essayer le stockage local
          throw new Error("Portfolio non trouvé dans la base de données")
        } catch (apiError) {
          console.error("Erreur API:", apiError)

          // Chercher dans le stockage local
          const localPortfolios = getLocalPortfolios("") // Nous n'avons pas l'ID utilisateur ici
          const localPortfolio = localPortfolios.find((p) => p.id === portfolioId)

          if (localPortfolio) {
            setPortfolio({ ...localPortfolio, _isLocal: true })
            setIsOfflineMode(true)
          } else {
            throw new Error("Portfolio non trouvé")
          }
        }
      } catch (error) {
        console.error("Erreur:", error)
        setError(error instanceof Error ? error.message : "Erreur inconnue")
      } finally {
        setIsLoading(false)
      }
    }

    if (portfolioId) {
      fetchPortfolio()
    }
  }, [portfolioId])

  // Charger les prédictions actives pour ce portfolio
  useEffect(() => {
    const fetchPredictions = async () => {
      if (!portfolioId) return

      try {
        setIsPredictionsLoading(true)
        const response = await fetch(`/api/transactions?portfolioId=${portfolioId}&type=PREDICTION`)

        if (!response.ok) {
          console.error("Erreur lors de la récupération des prédictions:", response.status, response.statusText)
          setPredictions([])
          return
        }

        const data = await response.json()

        // Filtrer pour ne garder que les prédictions actives (date d'expiration future)
        const activePredictions = data.filter((pred: any) => {
          const expiryDate = pred.expiryDate ? new Date(pred.expiryDate) : null
          return expiryDate && expiryDate > new Date()
        })

        setPredictions(activePredictions)
      } catch (error) {
        console.error("Erreur:", error)
        setPredictions([])
      } finally {
        setIsPredictionsLoading(false)
      }
    }

    fetchPredictions()
  }, [portfolioId])

  // Calculer la valeur totale des prédictions
  const totalPredictionsValue = predictions.reduce((total, pred) => total + pred.currentValue, 0)

  // Calculer le gain/perte total des prédictions
  const totalPredictionsInitialValue = predictions.reduce((total, pred) => total + pred.initialValue, 0)
  const totalPredictionsGain = totalPredictionsValue - totalPredictionsInitialValue
  const totalPredictionsGainPercentage =
    totalPredictionsInitialValue > 0 ? (totalPredictionsGain / totalPredictionsInitialValue) * 100 : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-2 text-gray-400">Chargement du portfolio...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} className="border-gray-700 text-gray-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        <Card className="bg-red-900/30 border border-red-700">
          <CardContent className="p-6 flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Portfolio non trouvé</h2>
            <p className="text-red-300 text-center mb-6">{error}</p>
            <Link href="/portfolio">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Voir tous les portfolios</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} className="border-gray-700 text-gray-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 flex flex-col items-center">
            <Wallet className="h-12 w-12 text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Portfolio non trouvé</h2>
            <p className="text-gray-400 text-center mb-6">
              Le portfolio que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Link href="/portfolio">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Voir tous les portfolios</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculer le temps restant pour une prédiction
  const calculateRemainingTime = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Calculer le pourcentage de progression d'une prédiction
  const calculateProgress = (startDate: string, expiryDate: string) => {
    const start = new Date(startDate)
    const expiry = new Date(expiryDate)
    const now = new Date()

    const totalDuration = expiry.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()

    return Math.min(Math.max(Math.floor((elapsed / totalDuration) * 100), 0), 100)
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <Button variant="outline" onClick={() => router.back()} className="border-gray-700 text-gray-300">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link href={`/predictions`}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter une prédiction
            </Button>
          </Link>
          <Button variant="outline" className="border-red-700 text-red-400 hover:bg-red-900/20">
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {isOfflineMode && (
        <Card className="bg-amber-900/20 border border-amber-700 mb-6">
          <CardContent className="p-4">
            <p className="text-amber-300 text-sm">
              Ce portfolio est stocké localement dans votre navigateur et n'est pas synchronisé avec le serveur.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            {portfolio.name}
            {portfolio._isLocal && (
              <span className="ml-2 text-xs bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded">Local</span>
            )}
            {portfolio._isMock && (
              <span className="ml-2 text-xs bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded">Simulé</span>
            )}
          </CardTitle>
          <CardDescription>{portfolio.description || "Aucune description"}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Solde</p>
              <p className="text-2xl font-semibold text-white">
                {portfolio.balance !== undefined
                  ? portfolio.balance.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: portfolio.currency || "EUR",
                    })
                  : "N/A"}
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Créé le</p>
              <p className="text-white">{new Date(portfolio.createdAt).toLocaleDateString("fr-FR")}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Link href={`/transactions?portfolioId=${portfolio.id}`} className="w-full">
            <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-700">
              Voir les transactions
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* Section des prédictions actives */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Prédictions actives</CardTitle>
          <CardDescription>
            {predictions.length > 0
              ? `${predictions.length} prédiction${predictions.length > 1 ? "s" : ""} en cours`
              : "Aucune prédiction active"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPredictionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              <span className="ml-2 text-gray-400">Chargement des prédictions...</span>
            </div>
          ) : predictions.length > 0 ? (
            <div className="space-y-4">
              {/* Résumé des prédictions */}
              <div className="bg-gray-700 p-4 rounded-lg mb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                  <h3 className="text-white font-medium">Résumé des prédictions</h3>
                  <div className={`flex items-center ${totalPredictionsGain >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {totalPredictionsGain >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {totalPredictionsGain >= 0 ? "+" : ""}
                    {totalPredictionsGain.toFixed(2)}€ ({totalPredictionsGainPercentage.toFixed(2)}%)
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-gray-400 text-sm">Valeur initiale</p>
                    <p className="text-white font-medium">{totalPredictionsInitialValue.toFixed(2)}€</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Valeur actuelle</p>
                    <p className="text-white font-medium">{totalPredictionsValue.toFixed(2)}€</p>
                  </div>
                </div>
              </div>

              {/* Liste des prédictions */}
              {predictions.map((prediction) => {
                const remainingDays = calculateRemainingTime(prediction.expiryDate)
                const progress = calculateProgress(prediction.date, prediction.expiryDate)
                const gainAmount = prediction.currentValue - prediction.initialValue
                const gainPercentage = (gainAmount / prediction.initialValue) * 100

                return (
                  <div key={prediction.id} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                      <h3 className="text-white font-medium">{prediction.symbol}</h3>
                      <div className={`flex items-center ${gainAmount >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {gainAmount >= 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {gainAmount >= 0 ? "+" : ""}
                        {gainAmount.toFixed(2)}€ ({gainPercentage.toFixed(2)}%)
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div>
                        <p className="text-gray-400 text-sm">Montant investi</p>
                        <p className="text-white">{prediction.initialValue.toFixed(2)}€</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Valeur actuelle</p>
                        <p className="text-white">{prediction.currentValue.toFixed(2)}€</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Rendement attendu</p>
                        <p className={`${prediction.expectedReturn >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {prediction.expectedReturn >= 0 ? "+" : ""}
                          {prediction.expectedReturn.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Progression</span>
                        <span className="text-gray-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {remainingDays} jour{remainingDays > 1 ? "s" : ""} restant{remainingDays > 1 ? "s" : ""}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                )
              })}

              <div className="flex justify-center mt-4">
                <Link href="/predictions">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Ajouter une nouvelle prédiction
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Wallet className="h-16 w-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-center mb-6">
                Aucune prédiction active dans ce portfolio. Ajoutez des prédictions pour suivre leur performance.
              </p>
              <Link href="/predictions">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ajouter une prédiction
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section des actifs */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Actifs</CardTitle>
          <CardDescription>Aucun actif dans ce portfolio</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wallet className="h-16 w-16 text-gray-600 mb-4" />
          <p className="text-gray-400 text-center mb-6">
            Ajoutez des actifs à ce portfolio pour commencer à suivre vos investissements
          </p>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <PlusCircle className="h-4 w-4 mr-2" />
            Ajouter un actif
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
