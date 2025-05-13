"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Brain, TrendingUp, BarChart3, BarChart4, Filter, LineChart } from "lucide-react"
import Link from "next/link"
import { PredictionWidget } from "@/components/prediction-widget"
import { StockPrediction } from "@/components/stock-prediction"
import { popularStocks } from "@/lib/stock-service"
import { useStockData } from "@/hooks/use-stock-data"
import { StockFilterPanel, type FilterCriteria } from "@/components/stock-filter-panel"
import { useFilteredStocks } from "@/hooks/use-filtered-stocks"
import { SortedStockGrid } from "@/components/sorted-stock-grid"
import { PredictionAlertsManager } from "@/components/prediction-alerts-manager"

export default function MarketPredictionsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL")
  const [predictionDays, setPredictionDays] = useState(30)
  const { data: stockData, isLoading, error } = useStockData(selectedSymbol)

  // État pour le mode d'affichage (détaillé ou filtré)
  const [showFilters, setShowFilters] = useState(false)

  // État pour les critères de filtrage et de tri
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
    sector: "all",
    trend: "all",
    minChangePercent: 0,
    maxChangePercent: 100,
    onlyFavorites: false,
    sortBy: "performance_desc",
  })

  // Charger les stocks filtrés
  const { stocks: filteredStocks, isLoading: isLoadingFiltered } = useFilteredStocks(popularStocks, filterCriteria)

  // Mock prediction and selectedStock for PredictionAlertsManager
  const [prediction, setPrediction] = useState({
    predictedPrice: 180,
    confidence: 0.85,
  })
  const [selectedStock, setSelectedStock] = useState({
    symbol: "AAPL",
    name: "Apple Inc.",
  })

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Link>
        </Button>

        <Button variant={showFilters ? "secondary" : "outline"} size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? "Mode détaillé" : "Mode filtré"}
        </Button>
      </div>

      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Prédictions de Marché</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Explorez les prédictions basées sur l'analyse technique et l'intelligence artificielle pour vous aider dans
          vos décisions d'investissement.
        </p>
      </div>

      {showFilters ? (
        <div className="space-y-6">
          <StockFilterPanel criteria={filterCriteria} onChange={setFilterCriteria} />

          {isLoadingFiltered ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des prédictions...</p>
            </div>
          ) : (
            <SortedStockGrid
              stocks={filteredStocks}
              sortBy={filterCriteria.sortBy}
              onSelectStock={(symbol) => {
                setSelectedSymbol(symbol)
                setShowFilters(false)
              }}
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de prédiction</CardTitle>
                <CardDescription>Sélectionnez une action et configurez les paramètres de prédiction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Action</label>
                    <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une action" />
                      </SelectTrigger>
                      <SelectContent>
                        {popularStocks.map((symbol) => (
                          <SelectItem key={symbol} value={symbol}>
                            {symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Horizon de prédiction</label>
                    <Select
                      value={predictionDays.toString()}
                      onValueChange={(value) => setPredictionDays(Number.parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Nombre de jours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 jours</SelectItem>
                        <SelectItem value="14">14 jours</SelectItem>
                        <SelectItem value="30">30 jours</SelectItem>
                        <SelectItem value="60">60 jours</SelectItem>
                        <SelectItem value="90">90 jours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {stockData && (
              <Tabs defaultValue="standard">
                <TabsList className="mb-4">
                  <TabsTrigger value="standard">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Standard
                  </TabsTrigger>
                  <TabsTrigger value="ai">
                    <Brain className="h-4 w-4 mr-2" />
                    IA
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="standard">
                  <StockPrediction stock={stockData} days={predictionDays} defaultAlgorithm="ensemble" />
                </TabsContent>

                <TabsContent value="ai">
                  <StockPrediction stock={stockData} days={predictionDays} defaultAlgorithm="ai" />
                </TabsContent>
              </Tabs>
            )}

            {selectedStock && prediction && (
              <div className="mt-6">
                <PredictionAlertsManager stock={selectedStock} prediction={prediction} />
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">À propos des prédictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-medium mb-1 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Prédictions standard
                    </h3>
                    <p className="text-muted-foreground">
                      Basées sur des algorithmes d'analyse technique comme les moyennes mobiles, les régressions
                      linéaires et polynomiales. Ces méthodes analysent les tendances historiques pour projeter les
                      mouvements futurs.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-1 flex items-center">
                      <Brain className="h-4 w-4 mr-2" />
                      Prédictions IA
                    </h3>
                    <p className="text-muted-foreground">
                      Utilisent des modèles d'intelligence artificielle avancés qui prennent en compte non seulement les
                      données historiques mais aussi des facteurs contextuels comme les tendances sectorielles et les
                      indicateurs macroéconomiques.
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-xs">
                      <strong>Note importante:</strong> Ces prédictions sont fournies à titre informatif uniquement et
                      ne constituent pas des conseils d'investissement. Les performances passées ne préjugent pas des
                      performances futures.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <PredictionWidget />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analyses avancées</CardTitle>
                <CardDescription>Explorez des analyses plus détaillées</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/predictions/sectors-comparison">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Comparaison sectorielle
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/predictions/advanced">
                    <BarChart4 className="h-4 w-4 mr-2" />
                    Analyse technique avancée
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/predictions/performance">
                    <LineChart className="h-4 w-4 mr-2" />
                    Performance des prédictions
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </main>
  )
}
