"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  ArrowRightLeft,
  Clock,
  Percent,
  PieChart,
  Zap,
} from "lucide-react"
import type { SectorRotationDashboard } from "@/lib/sector-rotation-service"
import Link from "next/link"

interface SectorRotationDashboardProps {
  initialData?: SectorRotationDashboard
}

export function SectorRotationDashboardComponent({ initialData }: SectorRotationDashboardProps) {
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<SectorRotationDashboard | null>(initialData || null)
  const [activeTab, setActiveTab] = useState("overview")

  // Charger les données du tableau de bord au chargement du composant
  useEffect(() => {
    if (!initialData) {
      loadDashboardData()
    }
  }, [initialData])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/sectors/rotation/dashboard")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      console.error("Error loading rotation dashboard:", err)
      setError(err instanceof Error ? err.message : "Une erreur s'est produite lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  // Formater une date relative
  const formatRelativeTime = (days: number): string => {
    if (days < 1) return "Aujourd'hui"
    if (days === 1) return "Demain"
    if (days < 7) return `Dans ${days} jours`
    if (days < 30) return `Dans ${Math.round(days / 7)} semaines`
    return `Dans ${Math.round(days / 30)} mois`
  }

  // Obtenir la couleur pour une phase du cycle
  const getPhaseColor = (
    phase: "early_expansion" | "late_expansion" | "early_contraction" | "late_contraction",
  ): string => {
    switch (phase) {
      case "early_expansion":
        return "bg-green-100 text-green-800 border-green-200"
      case "late_expansion":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "early_contraction":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "late_contraction":
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  // Obtenir la couleur pour un cycle économique
  const getEconomicCycleColor = (phase: "expansion" | "peak" | "contraction" | "trough"): string => {
    switch (phase) {
      case "expansion":
        return "bg-green-100 text-green-800 border-green-200"
      case "peak":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "contraction":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "trough":
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  // Obtenir la couleur pour un timeframe
  const getTimeframeColor = (timeframe: "immediate" | "short_term" | "medium_term" | "long_term"): string => {
    switch (timeframe) {
      case "immediate":
        return "bg-red-100 text-red-800 border-red-200"
      case "short_term":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium_term":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "long_term":
        return "bg-purple-100 text-purple-800 border-purple-200"
    }
  }

  // Obtenir le texte pour un timeframe
  const getTimeframeText = (timeframe: "immediate" | "short_term" | "medium_term" | "long_term"): string => {
    switch (timeframe) {
      case "immediate":
        return "Immédiat"
      case "short_term":
        return "Court terme"
      case "medium_term":
        return "Moyen terme"
      case "long_term":
        return "Long terme"
    }
  }

  // Obtenir la couleur pour un indicateur de tendance
  const getTrendColor = (trend: "improving" | "deteriorating" | "stable"): string => {
    switch (trend) {
      case "improving":
        return "text-green-600"
      case "deteriorating":
        return "text-red-600"
      case "stable":
        return "text-yellow-600"
    }
  }

  // Obtenir l'icône pour un indicateur de tendance
  const getTrendIcon = (trend: "improving" | "deteriorating" | "stable") => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "deteriorating":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "stable":
        return <ArrowRight className="h-4 w-4 text-yellow-600" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <ArrowRightLeft className="mr-2 h-5 w-5" />
            Tableau de Bord de Rotation Sectorielle
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadDashboardData} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>
          Optimisez le timing de vos rotations sectorielles en fonction du cycle économique
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <Skeleton className="h-60 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : dashboardData ? (
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="signals">Signaux de rotation</TabsTrigger>
              <TabsTrigger value="sectors">Cycles sectoriels</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Cycle économique actuel */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Cycle Économique Actuel</h3>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="outline" className={getEconomicCycleColor(dashboardData.economicCycle.currentPhase)}>
                    {dashboardData.economicCycle.currentPhase === "expansion"
                      ? "Expansion"
                      : dashboardData.economicCycle.currentPhase === "peak"
                        ? "Pic"
                        : dashboardData.economicCycle.currentPhase === "contraction"
                          ? "Contraction"
                          : "Creux"}
                  </Badge>
                  <span className="text-sm">
                    Force: <span className="font-medium">{dashboardData.economicCycle.strength}%</span>
                  </span>
                  <span className="text-sm">
                    Durée: <span className="font-medium">{dashboardData.economicCycle.duration} jours</span>
                  </span>
                  <span className="text-sm">
                    Prochaine phase:{" "}
                    <span className="font-medium">
                      {formatRelativeTime(dashboardData.economicCycle.estimatedTimeToNextPhase)}
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div
                    className={`p-2 rounded ${
                      dashboardData.economicCycle.currentPhase === "expansion"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100"
                    }`}
                  >
                    Expansion
                  </div>
                  <div
                    className={`p-2 rounded ${
                      dashboardData.economicCycle.currentPhase === "peak" ? "bg-blue-100 text-blue-800" : "bg-gray-100"
                    }`}
                  >
                    Pic
                  </div>
                  <div
                    className={`p-2 rounded ${
                      dashboardData.economicCycle.currentPhase === "contraction"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100"
                    }`}
                  >
                    Contraction
                  </div>
                  <div
                    className={`p-2 rounded ${
                      dashboardData.economicCycle.currentPhase === "trough" ? "bg-red-100 text-red-800" : "bg-gray-100"
                    }`}
                  >
                    Creux
                  </div>
                </div>
              </div>

              {/* Top signaux de rotation */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Meilleures Opportunités de Rotation</h3>
                <div className="space-y-3">
                  {dashboardData.topRotationSignals.slice(0, 3).map((signal, index) => (
                    <div key={index} className="p-3 bg-background rounded-md shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <ArrowRightLeft className="h-4 w-4 mr-2 text-primary" />
                          <span className="font-medium">
                            {signal.fromSector.charAt(0).toUpperCase() + signal.fromSector.slice(1)} →{" "}
                            {signal.toSector.charAt(0).toUpperCase() + signal.toSector.slice(1)}
                          </span>
                        </div>
                        <Badge variant="outline" className={getTimeframeColor(signal.timeframe)}>
                          {getTimeframeText(signal.timeframe)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Force</div>
                          <div className="font-medium">{signal.strength}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Confiance</div>
                          <div className="font-medium">{signal.confidence}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Gain potentiel</div>
                          <div className="font-medium text-green-600">+{signal.potentialGain}%</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{signal.reason}</div>
                    </div>
                  ))}
                </div>
                <Button variant="link" size="sm" className="mt-2 w-full" asChild>
                  <Link href="/predictions/sectors-rotation">
                    Voir toutes les opportunités
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Secteurs en phase optimale */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Secteurs en Phase Optimale</h3>
                <div className="space-y-2">
                  {dashboardData.sectorCycles
                    .filter((sector) => sector.optimalAllocation > 60)
                    .sort((a, b) => b.optimalAllocation - a.optimalAllocation)
                    .slice(0, 4)
                    .map((sector, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-background rounded-md">
                        <div className="flex items-center">
                          <Badge variant="outline" className={getPhaseColor(sector.currentPhase)}>
                            {sector.phaseName}
                          </Badge>
                          <span className="ml-2 font-medium">{sector.sectorName}</span>
                        </div>
                        <div className="flex items-center">
                          <PieChart className="h-4 w-4 mr-1 text-primary" />
                          <span>{sector.optimalAllocation}%</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="signals" className="space-y-4 mt-4">
              {/* Signaux de rotation détaillés */}
              <div className="space-y-4">
                {dashboardData.topRotationSignals.map((signal, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h3 className="text-lg font-semibold flex items-center">
                        <ArrowRightLeft className="h-5 w-5 mr-2 text-primary" />
                        <span>
                          {signal.fromSector.charAt(0).toUpperCase() + signal.fromSector.slice(1)} →{" "}
                          {signal.toSector.charAt(0).toUpperCase() + signal.toSector.slice(1)}
                        </span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={getTimeframeColor(signal.timeframe)}>
                          <Clock className="h-3 w-3 mr-1" />
                          {getTimeframeText(signal.timeframe)}
                        </Badge>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          <Percent className="h-3 w-3 mr-1" />+{signal.potentialGain}%
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm mb-3">{signal.reason}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                      <div className="bg-background p-3 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">Force du signal</div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{signal.strength}%</span>
                          <Progress value={signal.strength} className="w-2/3" />
                        </div>
                      </div>
                      <div className="bg-background p-3 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">Niveau de confiance</div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{signal.confidence}%</span>
                          <Progress value={signal.confidence} className="w-2/3" />
                        </div>
                      </div>
                      <div className="bg-background p-3 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">Allocation recommandée</div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{signal.recommendedAllocation}%</span>
                          <Progress value={signal.recommendedAllocation} className="w-2/3" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-background p-3 rounded-md">
                      <div className="text-xs font-medium mb-2">Indicateurs clés</div>
                      <div className="space-y-2">
                        {signal.indicators.map((indicator, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span>{indicator.name}</span>
                            <div className="flex items-center">
                              <span className={`mr-2 ${getTrendColor(indicator.trend)}`}>
                                {indicator.value.toFixed(1)}
                              </span>
                              {getTrendIcon(indicator.trend)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sectors" className="space-y-4 mt-4">
              {/* Cycles sectoriels détaillés */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.sectorCycles.map((sector, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{sector.sectorName}</h3>
                      <Badge variant="outline" className={getPhaseColor(sector.currentPhase)}>
                        {sector.phaseName}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">{sector.phaseDescription}</p>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-background p-2 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">Momentum</div>
                        <div className="flex items-center">
                          {sector.momentum > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                          )}
                          <span className="font-medium">{sector.momentum}</span>
                        </div>
                      </div>
                      <div className="bg-background p-2 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">Force relative</div>
                        <div className="flex items-center">
                          {sector.relativeStrength > 0 ? (
                            <Zap className="h-4 w-4 text-green-600 mr-1" />
                          ) : (
                            <Zap className="h-4 w-4 text-red-600 mr-1" />
                          )}
                          <span className="font-medium">{sector.relativeStrength}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background p-2 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">Prochaine phase</div>
                        <div className="flex items-center">
                          <Badge variant="outline" className={getPhaseColor(sector.nextPhase)}>
                            {sector.nextPhase === "early_expansion"
                              ? "Début d'expansion"
                              : sector.nextPhase === "late_expansion"
                                ? "Fin d'expansion"
                                : sector.nextPhase === "early_contraction"
                                  ? "Début de contraction"
                                  : "Fin de contraction"}
                          </Badge>
                        </div>
                      </div>
                      <div className="bg-background p-2 rounded-md">
                        <div className="text-xs text-muted-foreground mb-1">Allocation optimale</div>
                        <div className="flex items-center">
                          <PieChart className="h-4 w-4 text-primary mr-1" />
                          <span className="font-medium">{sector.optimalAllocation}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Aucune donnée de rotation sectorielle disponible.</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        <div>
          Les recommandations de rotation sectorielle sont basées sur l'analyse des cycles économiques, des indicateurs
          macroéconomiques et des tendances sectorielles.
        </div>
      </CardFooter>
    </Card>
  )
}
