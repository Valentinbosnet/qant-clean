"use client"

import Link from "next/link"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, AlertCircle, Plus, ArrowUp, ArrowDown, Info, Calendar, TrendingUp, TrendingDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateRemainingTime, calculateProgress } from "@/lib/prediction-service"

interface Portfolio {
  id: string
  name: string
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

// Transactions de secours pour éviter les erreurs
const fallbackTransactions: Transaction[] = [
  {
    id: "1",
    type: "BUY",
    symbol: "AAPL",
    amount: 10,
    price: 175.34,
    date: new Date().toISOString(),
    portfolioId: "1",
    userId: "1",
    portfolio: {
      name: "Portfolio principal",
    },
  },
  {
    id: "2",
    type: "SELL",
    symbol: "MSFT",
    amount: 5,
    price: 338.11,
    date: new Date(Date.now() - 86400000).toISOString(), // Hier
    portfolioId: "1",
    userId: "1",
    portfolio: {
      name: "Portfolio principal",
    },
  },
]

export default function TransactionsPage() {
  const searchParams = useSearchParams()
  const portfolioIdParam = searchParams.get("portfolioId")

  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [predictions, setPredictions] = useState<Transaction[]>([])
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>(portfolioIdParam || "all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTransaction, setNewTransaction] = useState({
    symbol: "",
    type: "BUY",
    amount: "1",
    price: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("transactions")
  const [selectedType, setSelectedType] = useState<string>("")

  // Charger les portfolios
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await fetch("/api/portfolios")

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des portfolios")
        }

        const data = await response.json()
        setPortfolios(data)
      } catch (error) {
        console.error("Erreur:", error)
        setError("Impossible de charger vos portfolios. Veuillez réessayer.")
      }
    }

    fetchPortfolios()
  }, [])

  // Charger les transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Construire l'URL en fonction des filtres
        let url = "/api/transactions"
        const params = new URLSearchParams()

        if (selectedPortfolio && selectedPortfolio !== "all") {
          params.append("portfolioId", selectedPortfolio)
        }

        // Si on est dans l'onglet transactions, on récupère tous les types
        // Si on est dans l'onglet prédictions, on récupère uniquement les prédictions
        if (activeTab === "predictions") {
          params.append("type", "PREDICTION")
        } else if (selectedType) {
          params.append("type", selectedType)
        }

        if (params.toString()) {
          url += `?${params.toString()}`
        }

        console.log("Fetching transactions with URL:", url)
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des transactions")
        }

        const data = await response.json()
        console.log("Transactions récupérées:", data.length, data)

        if (activeTab === "predictions") {
          setPredictions(data)
          // Garder les transactions précédentes pour l'autre onglet
        } else {
          setTransactions(data)
          // Filtrer les prédictions pour l'autre onglet
          const predictionData = data.filter((tx: Transaction) => tx.type === "PREDICTION")
          setPredictions(predictionData)
        }
      } catch (error) {
        console.error("Erreur:", error)
        setError("Impossible de charger vos transactions. Veuillez réessayer.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [selectedPortfolio, selectedType, activeTab])

  const handlePortfolioChange = (value: string) => {
    setSelectedPortfolio(value)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewTransaction((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPortfolio || selectedPortfolio === "all") {
      setError("Veuillez sélectionner un portfolio spécifique")
      return
    }

    if (!newTransaction.symbol || !newTransaction.price || !newTransaction.amount) {
      setError("Veuillez remplir tous les champs")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          portfolioId: selectedPortfolio,
          type: newTransaction.type,
          symbol: newTransaction.symbol,
          amount: Number.parseFloat(newTransaction.amount),
          price: Number.parseFloat(newTransaction.price),
          date: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de la transaction")
      }

      const newTx = await response.json()

      // Ajouter la nouvelle transaction à la liste
      setTransactions((prev) => [newTx, ...prev])

      // Réinitialiser le formulaire
      setNewTransaction({
        symbol: "",
        type: "BUY",
        amount: "1",
        price: "",
      })

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Erreur:", error)
      setError("Impossible d'ajouter la transaction. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
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

  // Fonction pour extraire le type et les détails de la description
  const parseDescription = (description: string) => {
    if (!description) return { type: "UNKNOWN", details: "" }

    const parts = description.split(" - ")
    if (parts.length < 2) return { type: "UNKNOWN", details: description }

    return {
      type: parts[0],
      details: parts[1],
    }
  }

  const renderTransactionType = (type: string) => {
    switch (type) {
      case "BUY":
        return <span className="text-green-400">Achat</span>
      case "SELL":
        return <span className="text-red-400">Vente</span>
      case "PREDICTION":
        return <span className="text-blue-400">Prédiction</span>
      default:
        return <span className="text-gray-400">{type}</span>
    }
  }

  if (isLoading && portfolios.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-2 text-gray-400">Chargement de vos données...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="text-gray-400">Historique de vos transactions</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Ajouter une transaction</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Enregistrez un achat ou une vente d'actif dans votre portfolio.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitTransaction}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio</Label>
                    <Select
                      value={selectedPortfolio === "all" ? "" : selectedPortfolio}
                      onValueChange={handlePortfolioChange}
                      disabled={portfolios.length === 0}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Sélectionner un portfolio" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600 text-white">
                        {portfolios.map((portfolio) => (
                          <SelectItem key={portfolio.id} value={portfolio.id}>
                            {portfolio.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type de transaction</Label>
                    <Select
                      value={newTransaction.type}
                      onValueChange={(value) => setNewTransaction((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Type de transaction" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600 text-white">
                        <SelectItem value="BUY">Achat</SelectItem>
                        <SelectItem value="SELL">Vente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symbol">Symbole</Label>
                    <Input
                      id="symbol"
                      name="symbol"
                      value={newTransaction.symbol}
                      onChange={handleInputChange}
                      placeholder="ex: AAPL, MSFT, GOOGL"
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Quantité</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={newTransaction.amount}
                      onChange={handleInputChange}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Prix unitaire</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={newTransaction.price}
                      onChange={handleInputChange}
                      placeholder="ex: 150.25"
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ajout en cours...
                      </>
                    ) : (
                      "Ajouter la transaction"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Card className="bg-red-900/30 border border-red-700 mb-6">
          <CardContent className="p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Filtrer les transactions</CardTitle>
          <CardDescription>Sélectionnez un portfolio pour filtrer les transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
              <Select value={selectedPortfolio} onValueChange={handlePortfolioChange}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Sélectionner un portfolio" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 text-white">
                  <SelectItem value="all">Tous les portfolios</SelectItem>
                  {portfolios.map((portfolio) => (
                    <SelectItem key={portfolio.id} value={portfolio.id}>
                      {portfolio.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-gray-700">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="predictions" className="data-[state=active]:bg-gray-700">
            Prédictions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                {selectedPortfolio === "all"
                  ? "Toutes les transactions"
                  : `Transactions - ${portfolios.find((p) => p.id === selectedPortfolio)?.name || ""}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                  <span className="ml-2 text-gray-400">Chargement des transactions...</span>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">Aucune transaction trouvée</p>
                  <div className="bg-gray-700 p-4 rounded-lg mb-4">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-gray-300 text-sm">
                          Ajoutez des transactions à vos portfolios pour suivre vos investissements.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une transaction
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Type</TableHead>
                        <TableHead className="text-gray-300">Symbole</TableHead>
                        <TableHead className="text-right text-gray-300">Quantité</TableHead>
                        <TableHead className="text-right text-gray-300">Prix unitaire</TableHead>
                        <TableHead className="text-right text-gray-300">Total</TableHead>
                        {selectedPortfolio === "all" && <TableHead className="text-gray-300">Portfolio</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => {
                        // Déterminer si c'est une transaction ou un asset avec description
                        const isAsset = !transaction.type && transaction.description
                        const { type, details } = isAsset
                          ? parseDescription(transaction.description)
                          : { type: transaction.type, details: "" }

                        const displayType = isAsset ? type : transaction.type
                        const displaySymbol = isAsset ? transaction.name : transaction.symbol
                        const displayAmount = transaction.amount || 1
                        const displayPrice = transaction.price || 0
                        const totalValue = displayAmount * displayPrice

                        return (
                          <TableRow key={transaction.id} className="border-gray-700">
                            <TableCell className="text-gray-300">
                              {formatDate(transaction.date || transaction.createdAt)}
                            </TableCell>
                            <TableCell>
                              {displayType === "BUY" ? (
                                <span className="flex items-center text-green-400">
                                  <ArrowDown className="h-4 w-4 mr-1" />
                                  Achat
                                </span>
                              ) : displayType === "SELL" ? (
                                <span className="flex items-center text-red-400">
                                  <ArrowUp className="h-4 w-4 mr-1" />
                                  Vente
                                </span>
                              ) : displayType === "PREDICTION" ? (
                                <span className="flex items-center text-blue-400">
                                  <TrendingUp className="h-4 w-4 mr-1" />
                                  Prédiction
                                </span>
                              ) : (
                                <span className="text-gray-300">{displayType}</span>
                              )}
                            </TableCell>
                            <TableCell className="font-medium text-white">{displaySymbol}</TableCell>
                            <TableCell className="text-right text-gray-300">{displayAmount}</TableCell>
                            <TableCell className="text-right text-gray-300">${displayPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium text-white">
                              ${totalValue.toFixed(2)}
                            </TableCell>
                            {selectedPortfolio === "all" && (
                              <TableCell className="text-gray-300">{transaction.portfolio?.name || "N/A"}</TableCell>
                            )}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                {selectedPortfolio === "all"
                  ? "Toutes les prédictions"
                  : `Prédictions - ${portfolios.find((p) => p.id === selectedPortfolio)?.name || ""}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                  <span className="ml-2 text-gray-400">Chargement des prédictions...</span>
                </div>
              ) : predictions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">Aucune prédiction trouvée</p>
                  <div className="bg-gray-700 p-4 rounded-lg mb-4">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-gray-300 text-sm">
                          Ajoutez des prédictions depuis la section Prédictions pour suivre leur performance.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link href="/predictions">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une prédiction
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {predictions.map((prediction) => {
                    const remainingDays = prediction.expiryDate ? calculateRemainingTime(prediction.expiryDate) : 0
                    const progress =
                      prediction.expiryDate && prediction.date
                        ? calculateProgress(prediction.date, prediction.expiryDate)
                        : 0
                    const gainAmount =
                      prediction.currentValue && prediction.initialValue
                        ? prediction.currentValue - prediction.initialValue
                        : 0
                    const gainPercentage = prediction.initialValue ? (gainAmount / prediction.initialValue) * 100 : 0

                    return (
                      <div key={prediction.id} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                          <div className="flex items-center">
                            <h3 className="text-white font-medium">{prediction.symbol}</h3>
                            <span className="ml-2 text-xs bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded">
                              Prédiction
                            </span>
                          </div>
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
                                {remainingDays} jour{remainingDays > 1 ? "s" : ""} restant{remainingDays > 1 ? "s" : ""}
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
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
