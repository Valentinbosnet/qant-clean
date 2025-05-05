"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon, RefreshCwIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RealTimePredictionCard from "@/components/real-time-prediction-card"
import type { RealTimePrediction } from "@/lib/real-time-prediction"

export default function RealTimePredictionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [topPredictions, setTopPredictions] = useState<RealTimePrediction[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>("popular")

  // Récupérer le symbole depuis les paramètres d'URL
  const symbolParam = useSearchParams().get("symbol")

  useEffect(() => {
    if (symbolParam) {
      setActiveTab("search")
    }
    // fetchPopularPredictions();
  }, [symbolParam])

  const fetchPopularPredictions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/real-time-predictions")

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`)
      }

      const data = await response.json()
      setTopPredictions(data)
    } catch (error) {
      console.error("Erreur lors du chargement des prédictions populaires:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/real-time-predictions?symbol=${searchTerm.trim().toUpperCase()}`)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Prédictions en temps réel</h1>
        <p className="text-gray-600">
          Analysez les prédictions générées instantanément grâce à notre algorithme d'intelligence artificielle.
        </p>
      </div>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Rechercher par symbole (ex: AAPL, MSFT...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <SearchIcon className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
        </form>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="popular">Actions populaires</TabsTrigger>
          {symbolParam && <TabsTrigger value="search">Recherche: {symbolParam}</TabsTrigger>}
        </TabsList>

        <TabsContent value="popular">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="w-full shadow-md animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-7 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-5 bg-gray-200 rounded w-full"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))
            ) : topPredictions.length > 0 ? (
              topPredictions.map((prediction) => (
                <RealTimePredictionCard
                  key={prediction.symbol}
                  symbol={prediction.symbol}
                  defaultPrediction={prediction}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
                <p className="text-gray-600 mb-4">
                  Aucune prédiction disponible actuellement. Veuillez réessayer plus tard.
                </p>
                <Button variant="outline" onClick={fetchPopularPredictions}>
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Réessayer
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="search">
          {symbolParam && (
            <div className="max-w-md mx-auto">
              <RealTimePredictionCard symbol={symbolParam} />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>À propos des prédictions en temps réel</CardTitle>
          <CardDescription>
            Comment utiliser les prédictions pour améliorer vos décisions d'investissement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
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
