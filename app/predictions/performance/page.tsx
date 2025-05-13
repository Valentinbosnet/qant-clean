"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BarChart3, LineChart, History } from "lucide-react"
import Link from "next/link"
import { popularStocks } from "@/lib/stock-service"
import { PredictionComparisonChart } from "@/components/prediction-comparison-chart"
import { PredictionPerformanceMetrics } from "@/components/prediction-performance-metrics"

export default function PredictionPerformancePage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | undefined>(undefined)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | undefined>(undefined)
  const [activeTab, setActiveTab] = useState("comparison")

  const algorithms = ["sma", "ema", "linear", "polynomial", "ensemble", "ai"]

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/market-predictions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux prédictions
          </Link>
        </Button>
      </div>

      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Performance des Prédictions</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Analysez la précision des prédictions passées et comparez les performances des différents algorithmes
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>
            Affinez votre analyse en sélectionnant un symbole ou un algorithme spécifique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Symbole</label>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les symboles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>Tous les symboles</SelectItem>
                  {popularStocks.map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Algorithme</label>
              <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les algorithmes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>Tous les algorithmes</SelectItem>
                  {algorithms.map((algo) => (
                    <SelectItem key={algo} value={algo}>
                      {algo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="comparison">
            <LineChart className="h-4 w-4 mr-2" />
            Comparaison
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Métriques
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Historique
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-6">
        {activeTab === "comparison" && (
          <PredictionComparisonChart symbol={selectedSymbol} algorithm={selectedAlgorithm} limit={20} />
        )}

        {activeTab === "metrics" && (
          <PredictionPerformanceMetrics symbol={selectedSymbol} algorithm={selectedAlgorithm} />
        )}

        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle>Historique des Prédictions</CardTitle>
              <CardDescription>Consultez l'historique complet de vos prédictions passées</CardDescription>
            </CardHeader>
            <CardContent>
              <PredictionComparisonChart symbol={selectedSymbol} algorithm={selectedAlgorithm} limit={50} />
            </CardContent>
          </Card>
        )}

        <div className="bg-muted/30 p-4 rounded-lg text-sm">
          <h3 className="font-medium mb-2">À propos de l'analyse de performance</h3>
          <p className="mb-2">
            Cette page vous permet d'analyser la précision des prédictions passées et d'évaluer la performance des
            différents algorithmes de prédiction. Utilisez ces informations pour:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Identifier les algorithmes les plus performants pour chaque type d'action</li>
            <li>Comprendre les forces et faiblesses de chaque modèle de prédiction</li>
            <li>Améliorer vos décisions d'investissement en vous basant sur des données historiques</li>
            <li>Suivre l'évolution de la précision des prédictions au fil du temps</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
