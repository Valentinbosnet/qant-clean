"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Wallet, Loader2, AlertCircle, Calendar, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getLocalPortfolios } from "@/lib/local-storage"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

interface Portfolio {
  id: string
  name: string
  balance?: number
  currency?: string
  createdAt: string
  updatedAt: string
  description?: string | null
  _isLocal?: boolean
  _isMock?: boolean
  currentValue?: number
  totalInvested?: number
  returnValue?: number
  returnPercentage?: number
  lastUpdated?: string
}

interface Transaction {
  id: string
  type: string
  symbol: string
  amount: number
  price: number
  date: string
  portfolioId: string
  userId: string
  portfolio?: {
    name: string
  }
  // Champs spécifiques aux prédictions
  expiryDate?: string
  duration?: number
  initialValue?: number
  currentValue?: number
  expectedReturn?: number
  analysis?: string
}

interface Position {
  symbol: string
  quantity: number
  averagePrice: number
  currentPrice: number
  currentValue: number
  profitLoss: number
  profitLossPercentage: number
}

export default function PortfolioPage() {
  const router = useRouter()
  const { toast } = useToast() // Correction ici: utiliser le hook useToast
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null)
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [predictions, setPredictions] = useState<Transaction[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isUpdatingValue, setIsUpdatingValue] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("overview")

  // Fonction pour ajouter des valeurs par défaut aux portefeuilles
  const addDefaultValues = (portfolio: Portfolio): Portfolio => {
    return {
      ...portfolio,
      balance: portfolio.balance ?? 10000, // Valeur par défaut si balance est undefined ou null
      currency: portfolio.currency ?? "EUR", // Valeur par défaut si currency est undefined ou null
      currentValue: portfolio.currentValue ?? 0,
      totalInvested: portfolio.totalInvested ?? 0,
      returnValue: portfolio.returnValue ?? 0,
      returnPercentage: portfolio.returnPercentage ?? 0,
    }
  }

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
        // Ajouter des valeurs par défaut à tous les portefeuilles
        setPortfolios(data.map(addDefaultValues))
      } catch (error) {
        console.error("Erreur:", error)
        setError("Impossible de charger vos portfolios. Veuillez réessayer.")

        // Passer en mode hors ligne si l'API échoue
        setIsOfflineMode(true)

        // Charger les portfolios locaux comme solution de secours
        const localPortfolios = getLocalPortfolios("")
        setPortfolios(localPortfolios.map((p) => ({ ...addDefaultValues(p), _isLocal: true })))
      } finally {
        setIsLoading(false)
      }
    }

    fetchPortfolios()
  }, [])

  // Charger les détails du portfolio sélectionné
  useEffect(() => {
    if (!selectedPortfolioId) return

    const fetchPortfolioDetails = async () => {
      try {
        setIsDetailLoading(true)
        setError(null)

        // Charger les détails du portfolio
        const response = await fetch(`/api/portfolios/${selectedPortfolioId}`)

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des détails du portfolio")
        }

        const data = await response.json()
        // Ajouter des valeurs par défaut au portefeuille sélectionné
        setSelectedPortfolio(addDefaultValues(data))

        // Charger TOUTES les transactions (y compris les prédictions)
        try {
          const transactionsResponse = await fetch(`/api/transactions?portfolioId=${selectedPortfolioId}`)

          if (transactionsResponse.ok) {
            const allTransactionsData = await transactionsResponse.json()

            // Séparer les transactions normales des prédictions
            const normalTransactions = allTransactionsData.filter(
              (tx: Transaction) => tx.type === "BUY" || tx.type === "SELL",
            )
            const predictionTransactions = allTransactionsData.filter((tx: Transaction) => tx.type === "PREDICTION")

            // Définir les transactions récentes (uniquement BUY/SELL)
            setRecentTransactions(normalTransactions.slice(0, 5)) // Limiter aux 5 plus récentes

            // Définir les prédictions
            setPredictions(predictionTransactions)

            // Calculer les positions (simplifié)
            calculatePositions(normalTransactions)
          } else {
            console.error("Erreur lors de la récupération des transactions:", transactionsResponse.statusText)
            setRecentTransactions([])
            setPredictions([])
          }
        } catch (transactionError) {
          console.error("Erreur lors de la récupération des transactions:", transactionError)
          setRecentTransactions([])
          setPredictions([])
        }
      } catch (error) {
        console.error("Erreur:", error)
        setError("Impossible de charger les détails du portfolio. Veuillez réessayer.")
      } finally {
        setIsDetailLoading(false)
      }
    }

    fetchPortfolioDetails()
  }, [selectedPortfolioId])

  // Fonction pour calculer les positions à partir des transactions
  const calculatePositions = (transactions: Transaction[]) => {
    const positionsMap: Record<string, Position> = {}

    // Calculer les positions
    for (const transaction of transactions) {
      const { type, symbol, amount, price } = transaction

      if (!positionsMap[symbol]) {
        positionsMap[symbol] = {
          symbol,
          quantity: 0,
          averagePrice: 0,
          currentPrice: 0,
          currentValue: 0,
          profitLoss: 0,
          profitLossPercentage: 0,
        }
      }

      if (type === "BUY") {
        // Mettre à jour la quantité et le prix moyen pour les achats
        const currentQuantity = positionsMap[symbol].quantity
        const currentTotalValue = currentQuantity * positionsMap[symbol].averagePrice
        const newQuantity = currentQuantity + amount
        const newTotalValue = currentTotalValue + amount * price

        positionsMap[symbol].quantity = newQuantity
        positionsMap[symbol].averagePrice = newQuantity > 0 ? newTotalValue / newQuantity : 0
      } else if (type === "SELL") {
        // Réduire la quantité pour les ventes
        positionsMap[symbol].quantity -= amount

        // Si la quantité devient négative, la réinitialiser à 0
        if (positionsMap[symbol].quantity < 0) {
          positionsMap[symbol].quantity = 0
        }
      }
    }

    // Simuler des prix actuels (dans un cas réel, vous utiliseriez une API de marché)
    for (const symbol in positionsMap) {
      if (positionsMap[symbol].quantity > 0) {
        // Simuler une fluctuation de prix de -10% à +20% par rapport au prix moyen
        const fluctuation = 0.9 + Math.random() * 0.3 // Entre 0.9 et 1.2
        const currentPrice = positionsMap[symbol].averagePrice * fluctuation

        positionsMap[symbol].currentPrice = currentPrice
        positionsMap[symbol].currentValue = positionsMap[symbol].quantity * currentPrice
        positionsMap[symbol].profitLoss =
          positionsMap[symbol].currentValue - positionsMap[symbol].quantity * positionsMap[symbol].averagePrice
        positionsMap[symbol].profitLossPercentage =
          (positionsMap[symbol].profitLoss / (positionsMap[symbol].quantity * positionsMap[symbol].averagePrice)) * 100
      }
    }

    // Convertir l'objet en tableau et filtrer les positions avec quantité > 0
    const positionsArray = Object.values(positionsMap).filter((position) => position.quantity > 0)
    setPositions(positionsArray)
  }

  // Fonction pour mettre à jour la valeur du portfolio
  const updatePortfolioValue = async () => {
    if (!selectedPortfolioId) return

    try {
      setIsUpdatingValue(true)

      const response = await fetch("/api/portfolios/calculate-value", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          portfolioId: selectedPortfolioId,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la valeur du portfolio")
      }

      const data = await response.json()

      // Mettre à jour le portfolio sélectionné avec les nouvelles valeurs
      setSelectedPortfolio((prev) => {
        if (!prev) return null
        return {
          ...prev,
          currentValue: data.currentValue,
          totalInvested: data.totalInvested,
          returnValue: data.totalReturn,
          returnPercentage: data.returnPercentage,
          lastUpdated: new Date().toISOString(),
        }
      })

      // Mettre à jour la liste des portfolios
      setPortfolios((prev) => {
        return prev.map((p) => {
          if (p.id === selectedPortfolioId) {
            return {
              ...p,
              currentValue: data.currentValue,
              totalInvested: data.totalInvested,
              returnValue: data.totalReturn,
              returnPercentage: data.returnPercentage,
              lastUpdated: new Date().toISOString(),
            }
          }
          return p
        })
      })

      toast({
        title: "Portfolio mis à jour",
        description: "La valeur actuelle du portfolio a été mise à jour avec succès.",
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la valeur du portfolio:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la valeur du portfolio. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingValue(false)
    }
  }

  // Fonction pour calculer le temps restant pour une prédiction
  const calculateRemainingTime = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(diffDays, 0)
  }

  // Fonction pour calculer le pourcentage de progression d'une prédiction
  const calculateProgress = (startDate: string, expiryDate: string) => {
    const start = new Date(startDate)
    const expiry = new Date(expiryDate)
    const now = new Date()

    const totalDuration = expiry.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()

    return Math.min(Math.max(Math.floor((elapsed / totalDuration) * 100), 0), 100)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handlePortfolioClick = (portfolioId: string) => {
    if (selectedPortfolioId === portfolioId) {
      // Si le même portfolio est cliqué à nouveau, désélectionner
      setSelectedPortfolioId(null)
      setSelectedPortfolio(null)
    } else {
      // Sinon, sélectionner le nouveau portfolio
      setSelectedPortfolioId(portfolioId)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-2 text-gray-400">Chargement de vos portfolios...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Portfolios</h1>
          <p className="text-gray-400">Gérez vos différents portfolios d'investissement</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => router.push("/dashboard#create-portfolio-form")}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Créer un nouveau portfolio
          </Button>
        </div>
      </div>

      {error && !isOfflineMode && (
        <Card className="bg-red-900/30 border border-red-700 mb-6">
          <CardContent className="p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {isOfflineMode && (
        <Card className="bg-amber-900/20 border border-amber-700 mb-6">
          <CardContent className="p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-400 mr-2 mt-0.5 shrink-0" />
            <p className="text-amber-300 text-sm">
              Mode hors ligne activé. Vos portfolios sont stockés localement dans votre navigateur.
            </p>
          </CardContent>
        </Card>
      )}

      {portfolios.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Aucun portfolio</CardTitle>
            <CardDescription>Vous n'avez pas encore créé de portfolio.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="h-16 w-16 text-gray-600 mb-4" />
            <p className="text-gray-400 text-center mb-6">
              Créez votre premier portfolio pour commencer à suivre vos investissements
            </p>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => router.push("/dashboard#create-portfolio-form")}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Créer un portfolio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {portfolios.map((portfolio) => (
              <Card
                key={portfolio.id}
                className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${
                  selectedPortfolioId === portfolio.id ? "ring-2 ring-emerald-500" : "hover:bg-gray-750"
                }`}
                onClick={() => handlePortfolioClick(portfolio.id)}
              >
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
                  <CardDescription>
                    Solde:{" "}
                    {portfolio.balance
                      ? portfolio.balance.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: portfolio.currency || "EUR",
                        })
                      : "N/A"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-gray-300 text-sm">
                      Créé le: <span className="text-white">{new Date(portfolio.createdAt).toLocaleDateString()}</span>
                    </p>
                    {portfolio.currentValue && portfolio.totalInvested ? (
                      <div className="mt-2">
                        <p className="text-gray-300 text-sm">Valeur actuelle:</p>
                        <p className="text-xl font-semibold text-white">
                          {portfolio.currentValue.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: portfolio.currency || "EUR",
                          })}
                        </p>
                        <div className="flex items-center mt-1">
                          <span
                            className={`text-sm ${portfolio.returnValue && portfolio.returnValue >= 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            {portfolio.returnValue && portfolio.returnValue >= 0 ? "+" : ""}
                            {portfolio.returnValue?.toLocaleString("fr-FR", {
                              style: "currency",
                              currency: portfolio.currency || "EUR",
                            })}{" "}
                            ({portfolio.returnPercentage?.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-3">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation() // Empêcher la propagation pour éviter le double clic
                      handlePortfolioClick(portfolio.id)
                    }}
                  >
                    Voir les détails
                  </Button>
                  <Link href={`/transactions?portfolioId=${portfolio.id}`} className="w-full">
                    <Button
                      variant="outline"
                      className="w-full border-gray-700 text-gray-300 hover:bg-gray-700"
                      onClick={(e) => e.stopPropagation()} // Empêcher la propagation
                    >
                      Transactions
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}

            {/* Carte pour ajouter un nouveau portfolio */}
            <Card className="bg-gray-800 border-gray-700 border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <PlusCircle className="h-12 w-12 text-gray-600 mb-4" />
                <p className="text-gray-400 text-center mb-6">Ajouter un nouveau portfolio</p>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => router.push("/dashboard#create-portfolio-form")}
                >
                  Créer un portfolio
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Section des détails du portfolio sélectionné */}
          {selectedPortfolioId && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Détails du portfolio</h2>

              {isDetailLoading ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mr-2" />
                    <span className="text-gray-400">Chargement des détails...</span>
                  </CardContent>
                </Card>
              ) : selectedPortfolio ? (
                <>
                  <Card className="bg-gray-800 border-gray-700 mb-6">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-white flex items-center">
                          {selectedPortfolio.name}
                          {selectedPortfolio._isLocal && (
                            <span className="ml-2 text-xs bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded">
                              Local
                            </span>
                          )}
                          {selectedPortfolio._isMock && (
                            <span className="ml-2 text-xs bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded">
                              Simulé
                            </span>
                          )}
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-700 text-gray-300 hover:bg-gray-700"
                          onClick={updatePortfolioValue}
                          disabled={isUpdatingValue}
                        >
                          {isUpdatingValue ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Mise à jour...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Mettre à jour la valeur
                            </>
                          )}
                        </Button>
                      </div>
                      <CardDescription>{selectedPortfolio.description || "Aucune description"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <p className="text-gray-400 text-sm mb-1">Solde disponible</p>
                          <p className="text-2xl font-semibold text-white">
                            {selectedPortfolio.balance
                              ? selectedPortfolio.balance.toLocaleString("fr-FR", {
                                  style: "currency",
                                  currency: selectedPortfolio.currency || "EUR",
                                })
                              : "N/A"}
                          </p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <p className="text-gray-400 text-sm mb-1">Créé le</p>
                          <p className="text-white">
                            {new Date(selectedPortfolio.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>

                      {/* Section de la valeur du portfolio */}
                      <div className="bg-gray-700 p-4 rounded-lg mb-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                          <div>
                            <p className="text-gray-400 text-sm">Valeur actuelle du portfolio</p>
                            <p className="text-2xl font-semibold text-white">
                              {selectedPortfolio.currentValue
                                ? selectedPortfolio.currentValue.toLocaleString("fr-FR", {
                                    style: "currency",
                                    currency: selectedPortfolio.currency || "EUR",
                                  })
                                : "Non calculé"}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <p className="text-gray-400 text-sm">Total investi</p>
                            <p className="text-lg font-medium text-white">
                              {selectedPortfolio.totalInvested
                                ? selectedPortfolio.totalInvested.toLocaleString("fr-FR", {
                                    style: "currency",
                                    currency: selectedPortfolio.currency || "EUR",
                                  })
                                : "Non calculé"}
                            </p>
                          </div>
                        </div>

                        {selectedPortfolio.returnValue !== undefined && (
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-gray-400 text-sm">Rendement</p>
                              <p
                                className={`text-sm font-medium ${selectedPortfolio.returnValue >= 0 ? "text-green-400" : "text-red-400"}`}
                              >
                                {selectedPortfolio.returnValue >= 0 ? "+" : ""}
                                {selectedPortfolio.returnValue.toLocaleString("fr-FR", {
                                  style: "currency",
                                  currency: selectedPortfolio.currency || "EUR",
                                })}{" "}
                                ({selectedPortfolio.returnPercentage?.toFixed(2)}%)
                              </p>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2.5">
                              <div
                                className={`${selectedPortfolio.returnValue >= 0 ? "bg-green-500" : "bg-red-500"} h-2.5 rounded-full`}
                                style={{ width: `${50 + (selectedPortfolio.returnPercentage || 0) / 2}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {selectedPortfolio.lastUpdated && (
                          <p className="text-gray-400 text-xs mt-2">
                            Dernière mise à jour: {formatDate(selectedPortfolio.lastUpdated)}
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-3">
                      <Link href={`/transactions?portfolioId=${selectedPortfolio.id}`} className="w-full">
                        <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-700">
                          Voir les transactions
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList className="bg-gray-800 border-gray-700">
                      <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">
                        Vue d'ensemble
                      </TabsTrigger>
                      <TabsTrigger value="positions" className="data-[state=active]:bg-gray-700">
                        Positions
                      </TabsTrigger>
                      <TabsTrigger value="transactions" className="data-[state=active]:bg-gray-700">
                        Transactions récentes
                      </TabsTrigger>
                      <TabsTrigger value="predictions" className="data-[state=active]:bg-gray-700">
                        Prédictions
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-white">Vue d'ensemble</CardTitle>
                          <CardDescription>Résumé de votre portfolio</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-gray-700 p-4 rounded-lg">
                                <p className="text-gray-400 text-sm mb-1">Transactions</p>
                                <p className="text-2xl font-semibold text-white">
                                  {recentTransactions.length + predictions.length}
                                </p>
                              </div>
                              <div className="bg-gray-700 p-4 rounded-lg">
                                <p className="text-gray-400 text-sm mb-1">Prédictions actives</p>
                                <p className="text-2xl font-semibold text-white">{predictions.length}</p>
                              </div>
                              <div className="bg-gray-700 p-4 rounded-lg">
                                <p className="text-gray-400 text-sm mb-1">Dernière mise à jour</p>
                                <p className="text-white">
                                  {new Date(selectedPortfolio.updatedAt).toLocaleDateString("fr-FR")}
                                </p>
                              </div>
                            </div>

                            <div className="flex justify-center space-x-4">
                              <Link href="/predictions">
                                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-700">
                                  Ajouter une prédiction
                                </Button>
                              </Link>
                              <Link href={`/transactions?portfolioId=${selectedPortfolio.id}`}>
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                  Gérer les transactions
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="positions">
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-white">Positions actuelles</CardTitle>
                          <CardDescription>Actifs détenus dans ce portfolio</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {positions.length > 0 ? (
                            <div className="space-y-4">
                              {positions.map((position) => (
                                <div key={position.symbol} className="bg-gray-700 p-4 rounded-lg">
                                  <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-white font-medium">{position.symbol}</h3>
                                    <div
                                      className={`flex items-center ${position.profitLoss >= 0 ? "text-green-400" : "text-red-400"}`}
                                    >
                                      {position.profitLoss >= 0 ? (
                                        <TrendingUp className="h-4 w-4 mr-1" />
                                      ) : (
                                        <TrendingDown className="h-4 w-4 mr-1" />
                                      )}
                                      {position.profitLoss >= 0 ? "+" : ""}
                                      {position.profitLoss.toFixed(2)}€ ({position.profitLossPercentage.toFixed(2)}%)
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                    <div>
                                      <p className="text-gray-400 text-sm">Quantité</p>
                                      <p className="text-white">{position.quantity}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400 text-sm">Prix moyen</p>
                                      <p className="text-white">{position.averagePrice.toFixed(2)}€</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400 text-sm">Prix actuel</p>
                                      <p className="text-white">{position.currentPrice.toFixed(2)}€</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-400 text-sm">Valeur actuelle</p>
                                      <p className="text-white">{position.currentValue.toFixed(2)}€</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-gray-400 mb-4">Aucune position active trouvée</p>
                              <Link href={`/transactions?portfolioId=${selectedPortfolio.id}`}>
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                  Ajouter une transaction
                                </Button>
                              </Link>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="transactions">
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-white">Transactions récentes</CardTitle>
                          <CardDescription>Les 5 dernières transactions de ce portfolio</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {recentTransactions.length > 0 ? (
                            <div className="space-y-4">
                              {recentTransactions.map((transaction) => (
                                <div key={transaction.id} className="bg-gray-700 p-4 rounded-lg">
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center">
                                      <span className="font-medium text-white">{transaction.symbol}</span>
                                      <span
                                        className={`ml-2 px-2 py-0.5 rounded text-xs ${
                                          transaction.type === "BUY"
                                            ? "bg-green-900/30 text-green-400"
                                            : "bg-red-900/30 text-red-400"
                                        }`}
                                      >
                                        {transaction.type === "BUY" ? "Achat" : "Vente"}
                                      </span>
                                    </div>
                                    <span className="text-gray-300 text-sm">{formatDate(transaction.date)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">Quantité: {transaction.amount}</span>
                                    <span className="text-gray-300">Prix: {transaction.price.toFixed(2)}€</span>
                                    <span className="text-white font-medium">
                                      Total: {(transaction.amount * transaction.price).toFixed(2)}€
                                    </span>
                                  </div>
                                </div>
                              ))}
                              <div className="flex justify-center mt-4">
                                <Link href={`/transactions?portfolioId=${selectedPortfolio.id}`}>
                                  <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-700">
                                    Voir toutes les transactions
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-gray-400 mb-4">Aucune transaction trouvée</p>
                              <Link href={`/transactions?portfolioId=${selectedPortfolio.id}`}>
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                  Ajouter une transaction
                                </Button>
                              </Link>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="predictions">
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-white">Prédictions actives</CardTitle>
                          <CardDescription>Prédictions en cours pour ce portfolio</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {predictions.length > 0 ? (
                            <div className="space-y-4">
                              {predictions.map((prediction) => {
                                const remainingDays = prediction.expiryDate
                                  ? calculateRemainingTime(prediction.expiryDate)
                                  : 0
                                const progress =
                                  prediction.expiryDate && prediction.date
                                    ? calculateProgress(prediction.date, prediction.expiryDate)
                                    : 0
                                const gainAmount =
                                  prediction.currentValue && prediction.initialValue
                                    ? prediction.currentValue - prediction.initialValue
                                    : 0
                                const gainPercentage = prediction.initialValue
                                  ? (gainAmount / prediction.initialValue) * 100
                                  : 0

                                return (
                                  <div key={prediction.id} className="bg-gray-700 p-4 rounded-lg">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                                      <h3 className="text-white font-medium">{prediction.symbol}</h3>
                                      <div
                                        className={`flex items-center ${gainAmount >= 0 ? "text-green-400" : "text-red-400"}`}
                                      >
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
                                        <p className="text-white">
                                          {prediction.initialValue?.toFixed(2) || prediction.amount.toFixed(2)}€
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-400 text-sm">Valeur actuelle</p>
                                        <p className="text-white">
                                          {prediction.currentValue?.toFixed(2) || prediction.amount.toFixed(2)}€
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-400 text-sm">Date d'expiration</p>
                                        <p className="text-white flex items-center">
                                          <Calendar className="h-4 w-4 mr-1 text-blue-400" />
                                          {prediction.expiryDate ? formatDate(prediction.expiryDate) : "N/A"}
                                        </p>
                                      </div>
                                    </div>

                                    {prediction.expiryDate && (
                                      <div className="mt-4">
                                        <div className="flex justify-between text-sm mb-1">
                                          <span className="text-gray-400">Progression</span>
                                          <span className="text-gray-400 flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {remainingDays} jour{remainingDays > 1 ? "s" : ""} restant
                                            {remainingDays > 1 ? "s" : ""}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gray-600 rounded-full h-2.5">
                                          <div
                                            className="bg-emerald-600 h-2.5 rounded-full"
                                            style={{ width: `${progress}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                              <div className="flex justify-center mt-4">
                                <Link href="/predictions">
                                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    Ajouter une nouvelle prédiction
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-gray-400 mb-4">Aucune prédiction active trouvée</p>
                              <Link href="/predictions">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                  Ajouter une prédiction
                                </Button>
                              </Link>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <p className="text-gray-400 text-center mb-6">
                      Impossible de charger les détails du portfolio. Veuillez réessayer.
                    </p>
                    <Button
                      onClick={() => handlePortfolioClick(selectedPortfolioId)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Réessayer
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
