"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, BarChart3, LineChartIcon, ArrowRightLeft } from "lucide-react"
import type { RotationBacktestResult } from "@/lib/sector-rotation-backtest-service"

interface SectorRotationBacktestChartProps {
  backtestResult: RotationBacktestResult
  showBenchmark?: boolean
}

export function SectorRotationBacktestChart({
  backtestResult,
  showBenchmark = true,
}: SectorRotationBacktestChartProps) {
  const [activeTab, setActiveTab] = useState("performance")

  // Formater les données pour les graphiques
  const formatChartData = () => {
    return backtestResult.dates.map((date, index) => ({
      date,
      performance: backtestResult.performance[index],
      benchmark: showBenchmark ? backtestResult.benchmarkPerformance[index] : undefined,
    }))
  }

  // Formater les données pour le graphique de rotations
  const formatRotationsData = () => {
    const rotationEvents = backtestResult.rotations.map((rotation) => ({
      date: rotation.date,
      fromSector: rotation.fromSectorName,
      toSector: rotation.toSectorName,
      performance: backtestResult.performance[backtestResult.dates.indexOf(rotation.date)] || 0,
      success: rotation.success,
    }))

    return rotationEvents
  }

  // Formater les données pour le graphique de performance des rotations
  const formatRotationPerformanceData = () => {
    return backtestResult.rotations.map((rotation) => ({
      date: rotation.date,
      return1M: rotation.subsequentReturn1M,
      return3M: rotation.subsequentReturn3M,
      return6M: rotation.subsequentReturn6M,
      success: rotation.success,
    }))
  }

  // Trouver les meilleurs et pires secteurs en termes de performance
  const getBestAndWorstSectors = () => {
    const sectors = Object.keys(backtestResult.sectorPerformances)
    if (sectors.length === 0) return { best: null, worst: null }

    let bestSector = sectors[0]
    let worstSector = sectors[0]
    let bestPerformance = Number.NEGATIVE_INFINITY
    let worstPerformance = Number.POSITIVE_INFINITY

    sectors.forEach((sector) => {
      const sectorData = backtestResult.sectorPerformances[sector]
      if (sectorData.length > 0) {
        const firstValue = sectorData[0].indexValue
        const lastValue = sectorData[sectorData.length - 1].indexValue
        const performance = (lastValue / firstValue - 1) * 100

        if (performance > bestPerformance) {
          bestPerformance = performance
          bestSector = sector
        }

        if (performance < worstPerformance) {
          worstPerformance = performance
          worstSector = sector
        }
      }
    })

    return {
      best: {
        sector: bestSector,
        performance: bestPerformance,
      },
      worst: {
        sector: worstSector,
        performance: worstPerformance,
      },
    }
  }

  const chartData = formatChartData()
  const rotationsData = formatRotationsData()
  const rotationPerformanceData = formatRotationPerformanceData()
  const { best, worst } = getBestAndWorstSectors()

  // Calculer les statistiques de succès des rotations
  const rotationSuccessRate =
    backtestResult.rotations.length > 0
      ? (backtestResult.rotations.filter((r) => r.success).length / backtestResult.rotations.length) * 100
      : 0

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              {backtestResult.name}
            </CardTitle>
            <CardDescription>{backtestResult.description}</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={backtestResult.totalReturn > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
          >
            {backtestResult.totalReturn > 0 ? "+" : ""}
            {backtestResult.totalReturn.toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance" className="flex items-center">
              <LineChartIcon className="mr-1 h-4 w-4" /> Performance
            </TabsTrigger>
            <TabsTrigger value="rotations" className="flex items-center">
              <ArrowRightLeft className="mr-1 h-4 w-4" /> Rotations
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center">
              <BarChart3 className="mr-1 h-4 w-4" /> Métriques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4 mt-4">
            {/* Graphique de performance */}
            <div className="h-80 w-full">
              <ChartContainer
                config={{
                  performance: {
                    label: "Stratégie",
                    color: "hsl(var(--chart-1))",
                  },
                  benchmark: showBenchmark
                    ? {
                        label: "S&P 500",
                        color: "hsl(var(--chart-2))",
                      }
                    : undefined,
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getFullYear()}`
                      }}
                      minTickGap={50}
                    />
                    <YAxis
                      tickFormatter={(value) => `${value.toFixed(0)}`}
                      domain={[(dataMin) => Math.max(0, dataMin * 0.8), (dataMax) => dataMax * 1.1]}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="performance"
                      stroke="var(--color-performance)"
                      fill="var(--color-performance)"
                      fillOpacity={0.3}
                      activeDot={{ r: 6 }}
                      isAnimationActive={false}
                    />
                    {showBenchmark && (
                      <Area
                        type="monotone"
                        dataKey="benchmark"
                        stroke="var(--color-benchmark)"
                        fill="var(--color-benchmark)"
                        fillOpacity={0.1}
                        activeDot={{ r: 4 }}
                        strokeDasharray="5 5"
                        isAnimationActive={false}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Statistiques de performance */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Rendement total</div>
                <div
                  className={`text-xl font-semibold ${backtestResult.totalReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {backtestResult.totalReturn >= 0 ? "+" : ""}
                  {backtestResult.totalReturn.toFixed(2)}%
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Rendement annualisé</div>
                <div
                  className={`text-xl font-semibold ${backtestResult.annualizedReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {backtestResult.annualizedReturn >= 0 ? "+" : ""}
                  {backtestResult.annualizedReturn.toFixed(2)}%
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Drawdown maximal</div>
                <div className="text-xl font-semibold text-red-600">-{backtestResult.maxDrawdown.toFixed(2)}%</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Ratio de Sharpe</div>
                <div
                  className={`text-xl font-semibold ${backtestResult.sharpeRatio >= 1 ? "text-green-600" : backtestResult.sharpeRatio >= 0 ? "text-yellow-600" : "text-red-600"}`}
                >
                  {backtestResult.sharpeRatio.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Meilleur et pire secteur */}
            {best && worst && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                    <div className="text-sm text-green-800">Meilleur secteur</div>
                  </div>
                  <div className="mt-1">
                    <div className="text-lg font-semibold">{best.sector}</div>
                    <div className="text-green-600">+{best.performance.toFixed(2)}%</div>
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <TrendingDown className="h-4 w-4 text-red-600 mr-2" />
                    <div className="text-sm text-red-800">Pire secteur</div>
                  </div>
                  <div className="mt-1">
                    <div className="text-lg font-semibold">{worst.sector}</div>
                    <div className="text-red-600">{worst.performance.toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rotations" className="space-y-4 mt-4">
            {backtestResult.rotations.length > 0 ? (
              <>
                {/* Graphique des rotations */}
                <div className="h-80 w-full">
                  <ChartContainer
                    config={{
                      performance: {
                        label: "Performance",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return `${date.getMonth() + 1}/${date.getFullYear()}`
                          }}
                          minTickGap={50}
                        />
                        <YAxis
                          tickFormatter={(value) => `${value.toFixed(0)}`}
                          domain={[(dataMin) => Math.max(0, dataMin * 0.8), (dataMax) => dataMax * 1.1]}
                        />
                        <Tooltip
                          formatter={(value, name) => [
                            `${Number.parseFloat(value as string).toFixed(2)}`,
                            name === "performance" ? "Performance" : "S&P 500",
                          ]}
                          labelFormatter={(label) => new Date(label as string).toLocaleDateString()}
                        />
                        <Line
                          type="monotone"
                          dataKey="performance"
                          stroke="var(--color-performance)"
                          dot={false}
                          activeDot={{ r: 6 }}
                          isAnimationActive={false}
                        />

                        {/* Marquer les points de rotation */}
                        {rotationsData.map((rotation, index) => (
                          <Line
                            key={index}
                            dataKey="performance"
                            data={[
                              {
                                date: rotation.date,
                                performance: rotation.performance,
                              },
                            ]}
                            stroke={rotation.success ? "green" : "red"}
                            dot={{
                              r: 6,
                              fill: rotation.success ? "green" : "red",
                              stroke: rotation.success ? "green" : "red",
                            }}
                            isAnimationActive={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {/* Graphique des performances de rotation */}
                <div className="h-60 w-full">
                  <ChartContainer
                    config={{
                      return1M: {
                        label: "1 Mois",
                        color: "hsl(var(--chart-3))",
                      },
                      return3M: {
                        label: "3 Mois",
                        color: "hsl(var(--chart-1))",
                      },
                      return6M: {
                        label: "6 Mois",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rotationPerformanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return `${date.getMonth() + 1}/${date.getFullYear()}`
                          }}
                          minTickGap={50}
                        />
                        <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="return1M" name="1 Mois" fill="var(--color-return1M)" isAnimationActive={false} />
                        <Bar dataKey="return3M" name="3 Mois" fill="var(--color-return3M)" isAnimationActive={false} />
                        <Bar dataKey="return6M" name="6 Mois" fill="var(--color-return6M)" isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {/* Tableau des rotations */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>De</TableHead>
                        <TableHead>Vers</TableHead>
                        <TableHead>1M</TableHead>
                        <TableHead>3M</TableHead>
                        <TableHead>6M</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backtestResult.rotations.map((rotation, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(rotation.date).toLocaleDateString()}</TableCell>
                          <TableCell>{rotation.fromSectorName}</TableCell>
                          <TableCell>{rotation.toSectorName}</TableCell>
                          <TableCell className={rotation.subsequentReturn1M >= 0 ? "text-green-600" : "text-red-600"}>
                            {rotation.subsequentReturn1M >= 0 ? "+" : ""}
                            {rotation.subsequentReturn1M.toFixed(2)}%
                          </TableCell>
                          <TableCell className={rotation.subsequentReturn3M >= 0 ? "text-green-600" : "text-red-600"}>
                            {rotation.subsequentReturn3M >= 0 ? "+" : ""}
                            {rotation.subsequentReturn3M.toFixed(2)}%
                          </TableCell>
                          <TableCell className={rotation.subsequentReturn6M >= 0 ? "text-green-600" : "text-red-600"}>
                            {rotation.subsequentReturn6M >= 0 ? "+" : ""}
                            {rotation.subsequentReturn6M.toFixed(2)}%
                          </TableCell>
                          <TableCell>
                            <Badge variant={rotation.success ? "success" : "destructive"}>
                              {rotation.success ? "Succès" : "Échec"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Taux de succès des rotations */}
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Taux de succès des rotations</div>
                    <div className={`font-semibold ${rotationSuccessRate >= 50 ? "text-green-600" : "text-red-600"}`}>
                      {rotationSuccessRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Aucune rotation n'a été effectuée pendant la période analysée.
              </div>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4 mt-4">
            {/* Métriques de performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Alpha (annualisé)</div>
                  <div
                    className={`text-xl font-semibold ${backtestResult.alpha >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {backtestResult.alpha >= 0 ? "+" : ""}
                    {backtestResult.alpha.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Beta</div>
                  <div className="text-xl font-semibold">{backtestResult.beta.toFixed(2)}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Volatilité (annualisée)</div>
                  <div className="text-xl font-semibold">{backtestResult.volatility.toFixed(2)}%</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Ratio de Sharpe</div>
                  <div
                    className={`text-xl font-semibold ${backtestResult.sharpeRatio >= 1 ? "text-green-600" : backtestResult.sharpeRatio >= 0 ? "text-yellow-600" : "text-red-600"}`}
                  >
                    {backtestResult.sharpeRatio.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Nombre de rotations</div>
                  <div className="text-xl font-semibold">{backtestResult.rotations.length}</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Taux de succès des rotations</div>
                  <div
                    className={`text-xl font-semibold ${rotationSuccessRate >= 50 ? "text-green-600" : "text-red-600"}`}
                  >
                    {rotationSuccessRate.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Rendement moyen par rotation</div>
                  <div className="text-xl font-semibold">
                    {backtestResult.rotations.length > 0
                      ? (
                          backtestResult.rotations.reduce((sum, r) => sum + r.subsequentReturn3M, 0) /
                          backtestResult.rotations.length
                        ).toFixed(2)
                      : "0.00"}
                    %
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Fréquence de rotation</div>
                  <div className="text-xl font-semibold">
                    {backtestResult.rotations.length > 0 && backtestResult.dates.length > 0
                      ? `${Math.round(backtestResult.dates.length / backtestResult.rotations.length)} jours`
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Graphique des performances mensuelles */}
            <div className="h-60 w-full mt-4">
              <ChartContainer
                config={{
                  performance: {
                    label: "Stratégie",
                    color: "hsl(var(--chart-1))",
                  },
                  benchmark: showBenchmark
                    ? {
                        label: "S&P 500",
                        color: "hsl(var(--chart-2))",
                      }
                    : undefined,
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={calculateMonthlyReturns()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="performance"
                      name="Stratégie"
                      fill="var(--color-performance)"
                      isAnimationActive={false}
                    />
                    {showBenchmark && (
                      <Bar dataKey="benchmark" name="S&P 500" fill="var(--color-benchmark)" isAnimationActive={false} />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )

  // Fonction pour calculer les rendements mensuels
  function calculateMonthlyReturns() {
    const monthlyData: { month: string; performance: number; benchmark?: number }[] = []
    const monthMap: Record<string, { performance: number; benchmark?: number }> = {}

    // Regrouper les données par mois
    backtestResult.dates.forEach((dateStr, index) => {
      const date = new Date(dateStr)
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          performance: 0,
          benchmark: showBenchmark ? 0 : undefined,
        }
      }

      // Calculer les rendements mensuels (simplification)
      if (index > 0 && new Date(backtestResult.dates[index - 1]).getMonth() !== date.getMonth()) {
        const prevPerf = backtestResult.performance[index - 1]
        const currPerf = backtestResult.performance[index]
        monthMap[monthKey].performance = (currPerf / prevPerf - 1) * 100

        if (showBenchmark) {
          const prevBench = backtestResult.benchmarkPerformance[index - 1]
          const currBench = backtestResult.benchmarkPerformance[index]
          monthMap[monthKey].benchmark = (currBench / prevBench - 1) * 100
        }
      }
    })

    // Convertir en tableau pour le graphique
    Object.entries(monthMap).forEach(([month, data]) => {
      monthlyData.push({
        month,
        performance: data.performance,
        benchmark: data.benchmark,
      })
    })

    return monthlyData.slice(-12) // Retourner les 12 derniers mois
  }
}
