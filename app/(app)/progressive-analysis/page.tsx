"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon, InfoIcon } from "lucide-react"
import ProgressiveAnalysisCard from "@/components/progressive-analysis-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ProgressiveAnalysisPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Récupérer le symbole depuis les paramètres d'URL
  const symbolParam = searchParams.get("symbol")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/progressive-analysis?symbol=${searchTerm.trim().toUpperCase()}`)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Analyse Progressive</h1>
        <p className="text-gray-600">
          Notre système d'analyse progressive apprend de ses prédictions passées pour améliorer sa précision au fil du
          temps.
        </p>
      </div>

      <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle>Comment fonctionne l'analyse progressive</AlertTitle>
        <AlertDescription>
          Notre système analyse les données à différents points dans le temps (N-5 à N-0), en comparant ses prédictions
          passées avec les résultats réels pour ajuster sa fiabilité. Chaque analyse contribue à améliorer la précision
          globale, avec un minimum de 65% de confiance.
        </AlertDescription>
      </Alert>

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

      {symbolParam ? (
        <ProgressiveAnalysisCard symbol={symbolParam} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Analyse Progressive</CardTitle>
            <CardDescription>Recherchez un symbole pour voir son analyse progressive</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              L'analyse progressive utilise un modèle qui s'améliore en comparant ses prédictions passées avec les
              résultats réels. Cela permet d'obtenir des prédictions plus précises et fiables au fil du temps.
            </p>
            <div className="mt-4">
              <h3 className="font-medium mb-2">Caractéristiques principales :</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Analyse des données à différents points dans le temps (N-5 à N-0)</li>
                <li>Ajustement de la fiabilité basé sur la précision des prédictions passées</li>
                <li>Niveau de confiance minimum de 65%</li>
                <li>Indicateurs techniques (RSI, MACD, moyennes mobiles)</li>
                <li>Prédictions à court, moyen et long terme</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
