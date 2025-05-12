"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TrendingUp, TrendingDown, Minus, BarChart3, RefreshCw, AlertCircle, ArrowRight } from "lucide-react"
import { getAllSectors } from "@/lib/sector-comparison-service"
import type { SectorType } from "@/lib/sector-classification"
import type { SectorComparisonData } from "@/lib/sector-comparison-service"
import Link from "next/link"

export function SectorsDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sectorData, setSectorData] = useState<SectorComparisonData[] | null>(null)

  // Charger les données des secteurs au chargement du composant
  useEffect(() => {
    loadSectorData()
  }, [])

  const loadSectorData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Récupérer tous les secteurs
      const allSectors = getAllSectors().map((s) => s.type)

      // Sélectionner 5 secteurs aléatoires pour un aperçu rapide
      const randomSectors = allSectors.sort(() => 0.5 - Math.random()).slice(0, 5) as SectorType[]

      const response = await fetch("/api/sectors/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sectors: randomSectors }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const data = await response.json()
      setSectorData(data)
    } catch (err) {
      console.error("Error loading sector data:", err)
      setError(err instanceof Error ? err.message : "Une erreur s'est produite lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  // Obtenir la couleur en fonction du score
  const getScoreColor = (score: number) => {
    if (score > 50) return "text-green-600"
    if (score > 0) return "text-blue-600"
    if (score > -50) return "text-yellow-600"
    return "text-red-600"
  }

  // Obtenir la couleur en fonction de l'outlook
  const getOutlookColor = (outlook: "bullish" | "bearish" | "neutral") => {
    switch (outlook) {
      case "bullish":
        return "bg-green-100 text-green-800 border-green-200"
      case "bearish":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Aperçu des Secteurs
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadSectorData} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>Vue d'ensemble des perspectives sectorielles</CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : sectorData && sectorData.length > 0 ? (
          <div className="space-y-3">
            {sectorData.map((sector, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex flex-col">
                  <span className="font-medium">{sector.sectorName}</span>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className={`text-xs ${getOutlookColor(sector.macroOutlook)}`}>
                      {sector.macroOutlook === "bullish" ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : sector.macroOutlook === "bearish" ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : (
                        <Minus className="h-3 w-3 mr-1" />
                      )}
                      {sector.macroOutlook === "bullish"
                        ? "Haussier"
                        : sector.macroOutlook === "bearish"
                          ? "Baissier"
                          : "Neutre"}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-2">
                      {sector.representativeStocks[0]?.symbol}, {sector.representativeStocks[1]?.symbol}
                      {sector.representativeStocks[2] ? `, ${sector.representativeStocks[2].symbol}` : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`text-xl font-bold ${getScoreColor(sector.overallScore)}`}>
                    {sector.overallScore > 0 ? "+" : ""}
                    {sector.overallScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Aucune donnée sectorielle disponible.</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <span className="text-xs text-muted-foreground">
          Les scores reflètent les perspectives macroéconomiques et les prédictions des actions représentatives.
        </span>
        <Button variant="link" size="sm" asChild>
          <Link href="/predictions/sectors-comparison">
            Comparaison complète
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
