"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react"
import type { SectorComparisonData } from "@/lib/sector-comparison-service"

interface SectorComparisonChartProps {
  data: SectorComparisonData[]
}

export function SectorComparisonChart({ data }: SectorComparisonChartProps) {
  const [chartType, setChartType] = useState<"score" | "growth" | "risk">("score")

  // Préparer les données pour le graphique
  const chartData = data.map((sector) => {
    const baseData = {
      name: sector.sectorName,
      score: sector.overallScore,
      growth: sector.growthPotential === "high" ? 100 : sector.growthPotential === "medium" ? 50 : 20,
      risk: sector.riskLevel === "high" ? 100 : sector.riskLevel === "medium" ? 50 : 20,
      outlook:
        sector.macroOutlook === "bullish"
          ? sector.outlookStrength * 100
          : sector.macroOutlook === "bearish"
            ? -sector.outlookStrength * 100
            : 0,
    }

    return baseData
  })

  // Obtenir la couleur en fonction du score
  const getScoreColor = (score: number) => {
    if (score > 50) return "var(--chart-1)"
    if (score > 0) return "var(--chart-2)"
    if (score > -50) return "var(--chart-3)"
    return "var(--chart-4)"
  }

  // Obtenir la couleur en fonction du niveau de risque
  const getRiskColor = (risk: "low" | "medium" | "high") => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  // Obtenir la couleur en fonction du potentiel de croissance
  const getGrowthColor = (growth: "low" | "medium" | "high") => {
    switch (growth) {
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "high":
        return "bg-green-100 text-green-800 border-green-200"
    }
  }

  // Obtenir l'icône de tendance
  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2 h-5 w-5" />
          Comparaison des Secteurs
        </CardTitle>
        <CardDescription>Analyse comparative des performances et perspectives sectorielles</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setChartType("score")}
            className={`px-3 py-1 text-sm rounded-full ${
              chartType === "score" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            Score global
          </button>
          <button
            onClick={() => setChartType("growth")}
            className={`px-3 py-1 text-sm rounded-full ${
              chartType === "growth" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            Potentiel de croissance
          </button>
          <button
            onClick={() => setChartType("risk")}
            className={`px-3 py-1 text-sm rounded-full ${
              chartType === "risk" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            Niveau de risque
          </button>
        </div>

        <div className="h-[300px] w-full">
          <ChartContainer
            config={{
              score: {
                label: "Score global",
                color: "hsl(var(--chart-1))",
              },
              growth: {
                label: "Potentiel de croissance",
                color: "hsl(var(--chart-2))",
              },
              risk: {
                label: "Niveau de risque",
                color: "hsl(var(--chart-3))",
              },
              outlook: {
                label: "Perspective macroéconomique",
                color: "hsl(var(--chart-4))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  domain={chartType === "score" ? [-100, 100] : [0, 100]}
                  label={
                    chartType === "score"
                      ? { value: "Score (-100 à 100)", angle: -90, position: "insideLeft" }
                      : { value: "Niveau (0-100)", angle: -90, position: "insideLeft" }
                  }
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                {chartType === "score" && <Bar dataKey="score" fill="var(--color-score)" name="Score global" />}
                {chartType === "growth" && (
                  <Bar dataKey="growth" fill="var(--color-growth)" name="Potentiel de croissance" />
                )}
                {chartType === "risk" && <Bar dataKey="risk" fill="var(--color-risk)" name="Niveau de risque" />}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="space-y-4 mt-6">
          {data.map((sector, index) => (
            <div key={index} className="p-4 bg-muted/50 rounded-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h3 className="text-lg font-semibold">{sector.sectorName}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={`flex items-center ${getOutlookColor(sector.macroOutlook)}`}>
                    {sector.macroOutlook === "bullish" ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : sector.macroOutlook === "bearish" ? (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    ) : (
                      <Minus className="h-4 w-4 mr-1" />
                    )}
                    <span>
                      {sector.macroOutlook === "bullish"
                        ? "Haussier"
                        : sector.macroOutlook === "bearish"
                          ? "Baissier"
                          : "Neutre"}
                    </span>
                  </Badge>
                  <Badge variant="outline" className={`flex items-center ${getRiskColor(sector.riskLevel)}`}>
                    Risque: {sector.riskLevel === "low" ? "Faible" : sector.riskLevel === "medium" ? "Moyen" : "Élevé"}
                  </Badge>
                  <Badge variant="outline" className={`flex items-center ${getGrowthColor(sector.growthPotential)}`}>
                    Croissance:{" "}
                    {sector.growthPotential === "low"
                      ? "Faible"
                      : sector.growthPotential === "medium"
                        ? "Moyenne"
                        : "Élevée"}
                  </Badge>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Score global</span>
                  <span className="text-sm font-medium">{sector.overallScore}</span>
                </div>
                <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gray-400"
                    style={{ transform: "translateX(-50%)" }}
                  ></div>
                  <div
                    className={`absolute top-0 bottom-0 ${
                      sector.overallScore >= 0 ? "left-1/2" : "right-1/2"
                    } bg-primary rounded-full`}
                    style={{
                      width: `${Math.abs(sector.overallScore) / 2}%`,
                      backgroundColor: getScoreColor(sector.overallScore),
                    }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Indicateurs clés</h4>
                  <ul className="space-y-1 text-xs">
                    {sector.keyIndicators.map((indicator, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span>{indicator.name}</span>
                        <div className="flex items-center">
                          <span className="font-mono mr-2">{indicator.value.toFixed(1)}</span>
                          {getTrendIcon(indicator.impact)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Actions représentatives</h4>
                  <ul className="space-y-1 text-xs">
                    {sector.representativeStocks.map((stock, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span>
                          {stock.symbol} ({stock.name.substring(0, 15)}
                          {stock.name.length > 15 ? "..." : ""})
                        </span>
                        <div className="flex items-center">
                          <span className="font-mono mr-2">${stock.price.toFixed(2)}</span>
                          {getTrendIcon(stock.trend)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        <div>
          Les scores sectoriels sont calculés en combinant les perspectives macroéconomiques et les prédictions des
          actions représentatives.
        </div>
      </CardFooter>
    </Card>
  )
}
