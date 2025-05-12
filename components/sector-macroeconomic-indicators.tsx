"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  AlertCircle,
  LineChart,
} from "lucide-react"
import { type SectorType, getSectorName } from "@/lib/sector-classification"
import type { SectorMacroeconomicData, SectorMacroIndicator } from "@/lib/sector-macroeconomic-service"

interface SectorMacroeconomicIndicatorsProps {
  sector: SectorType
  symbol: string
}

export function SectorMacroeconomicIndicators({ sector, symbol }: SectorMacroeconomicIndicatorsProps) {
  const [macroData, setMacroData] = useState<SectorMacroeconomicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("indicators")

  useEffect(() => {
    const fetchMacroData = async () => {
      if (!sector) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/macroeconomic/sector?sector=${sector}`)

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        setMacroData(data)
      } catch (err) {
        console.error("Error fetching sector macroeconomic data:", err)
        setError(err instanceof Error ? err.message : "Failed to load macroeconomic data")
      } finally {
        setLoading(false)
      }
    }

    fetchMacroData()
  }, [sector])

  // Obtenir l'icône de tendance
  const getTrendIcon = (trend: "positive" | "negative" | "neutral") => {
    switch (trend) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  // Obtenir la couleur de tendance
  const getTrendColor = (trend: "positive" | "negative" | "neutral") => {
    switch (trend) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200"
      case "negative":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  // Obtenir la couleur de l'outlook
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

  // Formater la valeur d'un indicateur
  const formatIndicatorValue = (indicator: SectorMacroIndicator) => {
    let valueText = indicator.value.toFixed(1)

    if (indicator.percentChange !== undefined) {
      const changeSymbol = indicator.percentChange > 0 ? "+" : ""
      valueText += ` (${changeSymbol}${indicator.percentChange.toFixed(1)}%)`
    } else if (indicator.change !== undefined) {
      const changeSymbol = indicator.change > 0 ? "+" : ""
      valueText += ` (${changeSymbol}${indicator.change.toFixed(1)})`
    }

    return valueText
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2 h-5 w-5" />
          Indicateurs Macroéconomiques Sectoriels
        </CardTitle>
        <CardDescription>
          Analyse des facteurs macroéconomiques spécifiques au secteur {sector ? getSectorName(sector) : ""}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : macroData ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="indicators">Indicateurs</TabsTrigger>
              <TabsTrigger value="outlook">Perspectives</TabsTrigger>
              <TabsTrigger value="themes">Thèmes & Risques</TabsTrigger>
            </TabsList>

            <TabsContent value="indicators" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Indicateurs clés pour {getSectorName(sector)}</h3>
                <Badge variant="outline" className="flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  {getSectorName(sector)}
                </Badge>
              </div>

              <div className="space-y-4">
                {macroData.indicators.slice(0, 5).map((indicator, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center">
                        <span className="font-medium text-sm">{indicator.name}</span>
                        <Badge
                          variant="outline"
                          className={`ml-2 text-xs flex items-center ${getTrendColor(indicator.sectorImpact)}`}
                        >
                          {getTrendIcon(indicator.sectorImpact)}
                          <span className="ml-1">
                            {indicator.sectorImpact === "positive"
                              ? "Positif"
                              : indicator.sectorImpact === "negative"
                                ? "Négatif"
                                : "Neutre"}
                          </span>
                        </Badge>
                      </div>
                      <span className="text-sm font-mono">{formatIndicatorValue(indicator)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Pertinence sectorielle</span>
                      <span className="text-xs">{(indicator.relevance * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={indicator.relevance * 100} className="h-1" />
                    <p className="text-xs text-muted-foreground mt-2">{indicator.description}</p>
                  </div>
                ))}

                {macroData.indicators.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>Aucun indicateur macroéconomique disponible pour ce secteur.</AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="outlook" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Perspectives macroéconomiques</h3>
                <Badge variant="outline" className={`flex items-center ${getOutlookColor(macroData.sectorOutlook)}`}>
                  {macroData.sectorOutlook === "bullish" ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : macroData.sectorOutlook === "bearish" ? (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  ) : (
                    <Minus className="h-4 w-4 mr-1" />
                  )}
                  <span>
                    {macroData.sectorOutlook === "bullish"
                      ? "Haussier"
                      : macroData.sectorOutlook === "bearish"
                        ? "Baissier"
                        : "Neutre"}
                  </span>
                </Badge>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <LineChart className="h-4 w-4 mr-1" />
                  Impact macroéconomique sur {symbol}
                </h4>
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Force de la perspective</span>
                    <span className="text-sm font-medium">{(macroData.outlookStrength * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={macroData.outlookStrength * 100} className="h-2" />
                </div>
                <p className="text-sm">
                  Les conditions macroéconomiques actuelles sont{" "}
                  <span
                    className={
                      macroData.sectorOutlook === "bullish"
                        ? "text-green-600 font-medium"
                        : macroData.sectorOutlook === "bearish"
                          ? "text-red-600 font-medium"
                          : "text-yellow-600 font-medium"
                    }
                  >
                    {macroData.sectorOutlook === "bullish"
                      ? "favorables"
                      : macroData.sectorOutlook === "bearish"
                        ? "défavorables"
                        : "neutres"}
                  </span>{" "}
                  pour le secteur {getSectorName(sector).toLowerCase()}, avec un impact{" "}
                  {macroData.outlookStrength > 0.7 ? "fort" : macroData.outlookStrength > 0.4 ? "modéré" : "faible"} sur
                  les performances attendues.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Indicateurs positifs</h4>
                  <ul className="space-y-1 text-sm">
                    {macroData.indicators
                      .filter((i) => i.sectorImpact === "positive")
                      .slice(0, 3)
                      .map((indicator, index) => (
                        <li key={index} className="flex items-start">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                          <span>
                            {indicator.name}: {formatIndicatorValue(indicator)}
                          </span>
                        </li>
                      ))}
                    {macroData.indicators.filter((i) => i.sectorImpact === "positive").length === 0 && (
                      <li className="text-muted-foreground">Aucun indicateur positif significatif</li>
                    )}
                  </ul>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Indicateurs négatifs</h4>
                  <ul className="space-y-1 text-sm">
                    {macroData.indicators
                      .filter((i) => i.sectorImpact === "negative")
                      .slice(0, 3)
                      .map((indicator, index) => (
                        <li key={index} className="flex items-start">
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
                          <span>
                            {indicator.name}: {formatIndicatorValue(indicator)}
                          </span>
                        </li>
                      ))}
                    {macroData.indicators.filter((i) => i.sectorImpact === "negative").length === 0 && (
                      <li className="text-muted-foreground">Aucun indicateur négatif significatif</li>
                    )}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="themes" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Thèmes & Facteurs de risque</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center text-green-800">
                    <Lightbulb className="h-4 w-4 mr-1 text-green-600" />
                    Thèmes macroéconomiques clés
                  </h4>
                  <ul className="space-y-1 text-sm text-green-700">
                    {macroData.keyThemes.map((theme, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{theme}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center text-red-800">
                    <AlertTriangle className="h-4 w-4 mr-1 text-red-600" />
                    Facteurs de risque macroéconomiques
                  </h4>
                  <ul className="space-y-1 text-sm text-red-700">
                    {macroData.riskFactors.map((risk, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Implications pour {symbol}</h4>
                <p className="text-sm">
                  Pour {symbol} dans le secteur {getSectorName(sector).toLowerCase()}, ces facteurs macroéconomiques
                  suggèrent{" "}
                  {macroData.sectorOutlook === "bullish" ? (
                    <span className="text-green-600 font-medium">
                      un environnement favorable qui pourrait soutenir la croissance et la valorisation
                    </span>
                  ) : macroData.sectorOutlook === "bearish" ? (
                    <span className="text-red-600 font-medium">
                      des défis potentiels qui pourraient peser sur la performance
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-medium">
                      un impact mitigé avec des opportunités et des défis équilibrés
                    </span>
                  )}
                  . Les investisseurs devraient surveiller particulièrement{" "}
                  {macroData.indicators[0]?.name || "les indicateurs économiques clés"} et{" "}
                  {macroData.indicators[1]?.name || "les tendances sectorielles"}.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              Aucune donnée macroéconomique sectorielle disponible. Veuillez sélectionner un secteur.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <span>Dernière mise à jour: {macroData ? new Date(macroData.lastUpdated).toLocaleString() : "N/A"}</span>
        <button
          onClick={() => {
            setLoading(true)
            // Ici, vous pourriez implémenter un rafraîchissement des données
            setTimeout(() => setLoading(false), 1000)
          }}
          className="flex items-center text-xs hover:underline"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Rafraîchir
        </button>
      </CardFooter>
    </Card>
  )
}
