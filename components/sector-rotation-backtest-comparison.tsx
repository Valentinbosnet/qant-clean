"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ExportButtons } from "./export-buttons"
import type { RotationBacktestResult } from "@/lib/sector-rotation-backtest-service"

interface SectorRotationBacktestComparisonProps {
  results: RotationBacktestResult[]
}

export function SectorRotationBacktestComparison({ results }: SectorRotationBacktestComparisonProps) {
  // Formater les données pour le graphique de comparaison
  const formatComparisonData = () => {
    if (results.length === 0 || results[0].dates.length === 0) return []

    // Prendre un échantillon des dates pour éviter de surcharger le graphique
    const sampleRate = Math.max(1, Math.floor(results[0].dates.length / 100))
    const sampledDates = results[0].dates.filter((_, i) => i % sampleRate === 0)

    return sampledDates.map((date, i) => {
      const dataPoint: any = { date }
      results.forEach((result) => {
        const index = i * sampleRate
        if (index < result.performance.length) {
          dataPoint[result.name] = result.performance[index]
        }
      })
      return dataPoint
    })
  }

  // Formater les données pour le graphique de drawdown
  const formatDrawdownData = () => {
    if (results.length === 0 || results[0].dates.length === 0) return []

    // Calculer les drawdowns pour chaque stratégie
    const drawdowns: Record<string, number[]> = {}

    results.forEach((result) => {
      const drawdownSeries: number[] = []
      let peak = result.performance[0]

      result.performance.forEach((value) => {
        if (value > peak) {
          peak = value
          drawdownSeries.push(0)
        } else {
          const drawdown = ((peak - value) / peak) * 100
          drawdownSeries.push(-drawdown) // Négatif pour représenter les baisses
        }
      })

      drawdowns[result.name] = drawdownSeries
    })

    // Prendre un échantillon des dates pour éviter de surcharger le graphique
    const sampleRate = Math.max(1, Math.floor(results[0].dates.length / 100))
    const sampledDates = results[0].dates.filter((_, i) => i % sampleRate === 0)

    return sampledDates.map((date, i) => {
      const dataPoint: any = { date }
      results.forEach((result) => {
        const index = i * sampleRate
        if (index < drawdowns[result.name].length) {
          dataPoint[result.name] = drawdowns[result.name][index]
        }
      })
      return dataPoint
    })
  }

  const comparisonData = formatComparisonData()
  const drawdownData = formatDrawdownData()

  // Générer des couleurs pour chaque stratégie
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
    "hsl(var(--chart-7))",
    "hsl(var(--chart-8))",
  ]

  // Configurer les couleurs pour le graphique
  const chartConfig: Record<string, { label: string; color: string }> = {}
  results.forEach((result, index) => {
    chartConfig[result.name] = {
      label: result.name,
      color: colors[index % colors.length],
    }
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Comparaison des Stratégies</CardTitle>
            <CardDescription>Performance relative des différentes stratégies de rotation sectorielle</CardDescription>
          </div>
          <ExportButtons results={results} isComparison={true} />
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getFullYear()}`
                    }}
                    minTickGap={50}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  {results.map((result, index) => (
                    <Line
                      key={result.name}
                      type="monotone"
                      dataKey={result.name}
                      stroke={`var(--color-${result.name})`}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analyse des Drawdowns</CardTitle>
          <CardDescription>Comparaison des drawdowns pour chaque stratégie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={drawdownData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                  <Legend />
                  {results.map((result) => (
                    <Bar
                      key={result.name}
                      dataKey={result.name}
                      fill={`var(--color-${result.name})`}
                      isAnimationActive={false}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tableau Comparatif</CardTitle>
          <CardDescription>Métriques clés pour chaque stratégie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stratégie</TableHead>
                  <TableHead>Rendement Total</TableHead>
                  <TableHead>Rendement Annualisé</TableHead>
                  <TableHead>Drawdown Max</TableHead>
                  <TableHead>Ratio de Sharpe</TableHead>
                  <TableHead>Volatilité</TableHead>
                  <TableHead>Alpha</TableHead>
                  <TableHead>Beta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.name}>
                    <TableCell className="font-medium">{result.name}</TableCell>
                    <TableCell className={result.totalReturn >= 0 ? "text-green-600" : "text-red-600"}>
                      {result.totalReturn >= 0 ? "+" : ""}
                      {result.totalReturn.toFixed(2)}%
                    </TableCell>
                    <TableCell className={result.annualizedReturn >= 0 ? "text-green-600" : "text-red-600"}>
                      {result.annualizedReturn >= 0 ? "+" : ""}
                      {result.annualizedReturn.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-red-600">-{result.maxDrawdown.toFixed(2)}%</TableCell>
                    <TableCell
                      className={
                        result.sharpeRatio >= 1
                          ? "text-green-600"
                          : result.sharpeRatio >= 0
                            ? "text-yellow-600"
                            : "text-red-600"
                      }
                    >
                      {result.sharpeRatio.toFixed(2)}
                    </TableCell>
                    <TableCell>{result.volatility.toFixed(2)}%</TableCell>
                    <TableCell className={result.alpha >= 0 ? "text-green-600" : "text-red-600"}>
                      {result.alpha >= 0 ? "+" : ""}
                      {result.alpha.toFixed(2)}%
                    </TableCell>
                    <TableCell>{result.beta.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métriques de Risque Avancées</CardTitle>
          <CardDescription>Comparaison des métriques de risque pour chaque stratégie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stratégie</TableHead>
                  <TableHead>Sortino</TableHead>
                  <TableHead>Information</TableHead>
                  <TableHead>Calmar</TableHead>
                  <TableHead>VaR (95%)</TableHead>
                  <TableHead>Expected Shortfall</TableHead>
                  <TableHead>Capture Ratio (Hausse)</TableHead>
                  <TableHead>Capture Ratio (Baisse)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.name}>
                    <TableCell className="font-medium">{result.name}</TableCell>
                    <TableCell
                      className={
                        result.riskMetrics.sortinoRatio >= 1
                          ? "text-green-600"
                          : result.riskMetrics.sortinoRatio >= 0
                            ? "text-yellow-600"
                            : "text-red-600"
                      }
                    >
                      {result.riskMetrics.sortinoRatio.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={
                        result.riskMetrics.informationRatio >= 0.5
                          ? "text-green-600"
                          : result.riskMetrics.informationRatio >= 0
                            ? "text-yellow-600"
                            : "text-red-600"
                      }
                    >
                      {result.riskMetrics.informationRatio.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={
                        result.riskMetrics.calmarRatio >= 1
                          ? "text-green-600"
                          : result.riskMetrics.calmarRatio >= 0
                            ? "text-yellow-600"
                            : "text-red-600"
                      }
                    >
                      {result.riskMetrics.calmarRatio.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-red-600">-{result.riskMetrics.var95.toFixed(2)}%</TableCell>
                    <TableCell className="text-red-600">-{result.riskMetrics.expectedShortfall.toFixed(2)}%</TableCell>
                    <TableCell className={result.riskMetrics.captureRatioUp > 1 ? "text-green-600" : "text-yellow-600"}>
                      {(result.riskMetrics.captureRatioUp * 100).toFixed(0)}%
                    </TableCell>
                    <TableCell className={result.riskMetrics.captureRatioDown < 1 ? "text-green-600" : "text-red-600"}>
                      {(result.riskMetrics.captureRatioDown * 100).toFixed(0)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
