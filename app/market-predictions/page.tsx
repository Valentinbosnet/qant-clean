"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Brain, TrendingUp, BarChart3, BarChart4 } from "lucide-react"
import Link from "next/link"
import { PredictionWidget } from "@/components/prediction-widget"
import { StockPrediction } from "@/components/stock-prediction"
import { popularStocks } from "@/lib/stock-service"
import { useStockData } from "@/hooks/use-stock-data"

export default function MarketPredictionsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL")
  const [predictionDays, setPredictionDays] = useState(30)
  const { data: stockData, isLoading, error } = useStockData(selectedSymbol)

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Link>
        </Button>
      </div>

      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Prédictions de Marché</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Explorez les prédictions basées sur l'analyse technique et l'intelligence artificielle pour vous aider dans
          vos décisions d'investissement.
        </p>
      </div>

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
                    Basées sur des algorithmes d'analyse technique comme les moyennes mobiles, les régressions linéaires
                    et polynomiales. Ces méthodes analysent les tendances historiques pour projeter les mouvements
                    futurs.
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
                    <strong>Note importante:</strong> Ces prédictions sont fournies à titre informatif uniquement et ne
                    constituent pas des conseils d'investissement. Les performances passées ne préjugent pas des
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
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
