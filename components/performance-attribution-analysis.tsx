"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart3, PieChartIcon, TrendingDown, TrendingUp, Activity, Calendar, ArrowDownRight } from "lucide-react"
import { ExportButtons } from "./export-buttons"
import type { RotationBacktestResult } from "@/lib/sector-rotation-backtest-service"

interface PerformanceAttributionAnalysisProps {
  backtestResult: RotationBacktestResult
}

export function PerformanceAttributionAnalysis({ backtestResult }: PerformanceAttributionAnalysisProps) {
  const [activeTab, setActiveTab] = useState("attribution")

  // Formater les données pour le graphique d'attribution
  const formatAttributionData = () => {
    const { performanceAttribution } = backtestResult
    return [
      { name: "Sélection de secteur", value: performanceAttribution.sectorSelection },
      { name: "Market timing", value: performanceAttribution.marketTiming },
      { name: "Allocation sectorielle", value: performanceAttribution.sectorAllocation },
      { name: "Autres facteurs", value: performanceAttribution.other },
    ].filter((item) => item.value !== 0)
  }

  // Formater les données pour le graphique de contribution par secteur
  const formatSectorAttributionData = () => {
    return backtestResult.sectorAttribution
      .filter((sector) => sector.contribution !== 0)
      .map((sector) => ({
        name: sector.sectorName,
        value: sector.contribution,
        percentageTimeHeld: sector.percentageTimeHeld,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 secteurs
  }

  // Formater les données pour le graphique de drawdown
  const formatDrawdownData = () => {
    return backtestResult.drawdownAnalysis.drawdowns.map((drawdown) => ({
      startDate: new Date(drawdown.startDate).toLocaleDateString(),
      endDate: new Date(drawdown.endDate).toLocaleDateString(),
      recoveryDate: drawdown.recoveryDate ? new Date(drawdown.recoveryDate).toLocaleDateString() : "Non récupéré",
      depth: drawdown.depth,
      duration: drawdown.duration,
      recoveryDuration: drawdown.recoveryDuration,
      sectorAtStart: drawdown.sectorAtStart,
    }))
  }

  // Formater les données pour le graphique de performance mensuelle
  const formatMonthlyPerformanceData = () => {
    return backtestResult.monthlyPerformance.map((month) => ({
      date: `${month.month}/${month.year}`,
      performance: month.performance,
      benchmark: month.benchmarkPerformance,
      excess: month.excessReturn,
    }))
  }

  // Formater les données pour le graphique de performance glissante
  const formatRollingPerformanceData = () => {
    return backtestResult.rollingPerformance.map((data) => ({
      date: data.date,
      "1M": data.rolling1M,
      "3M": data.rolling3M,
      "6M": data.rolling6M,
      "1A": data.rolling1Y,
      "Benchmark 1A": data.benchmarkRolling1Y,
    }))
  }

  // Couleurs pour les graphiques
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FF6B6B",
    "#6A7FDB",
    "#61DAFB",
    "#F25C54",
  ]

  // Données formatées
  const attributionData = formatAttributionData()
  const sectorAttributionData = formatSectorAttributionData()
  const drawdownData = formatDrawdownData()
  const monthlyPerformanceData = formatMonthlyPerformanceData()
  const rollingPerformanceData = formatRollingPerformanceData()

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <PieChartIcon className="mr-2 h-5 w-5" />
            Analyse d'Attribution de Performance
          </CardTitle>
          <CardDescription>Décomposition détaillée des sources de performance et de risque</CardDescription>
        </div>
        <ExportButtons results={[backtestResult]} />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="attribution" className="flex items-center">
              <PieChartIcon className="mr-1 h-4 w-4" /> Attribution
            </TabsTrigger>
            <TabsTrigger value="sectors" className="flex items-center">
              <BarChart3 className="mr-1 h-4 w-4" /> Secteurs
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center">
              <Activity className="mr-1 h-4 w-4" /> Risque
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" /> Temporel
            </TabsTrigger>
          </TabsList>

          {/* Onglet d'attribution de performance */}
          <TabsContent value="attribution" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Graphique d'attribution */}
              <div className="h-80">
                <div className="mb-2 font-medium">Sources de Performance</div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={attributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {attributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, "Contribution"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Statistiques d'attribution de décision */}
              <div className="space-y-4">
                <div className="mb-2 font-medium">Analyse des Décisions</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                      <div className="text-sm text-green-800">Rotations réussies</div>
                    </div>
                    <div className="mt-1">
                      <div className="text-2xl font-semibold">{backtestResult.decisionAttribution.goodRotations}</div>
                      <div className="text-green-600 text-sm">
                        +{backtestResult.decisionAttribution.averageGoodRotationReturn.toFixed(2)}% en moyenne
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <TrendingDown className="h-4 w-4 text-red-600 mr-2" />
                      <div className="text-sm text-red-800">Rotations échouées</div>
                    </div>
                    <div className="mt-1">
                      <div className="text-2xl font-semibold">{backtestResult.decisionAttribution.badRotations}</div>
                      <div className="text-red-600 text-sm">
                        {backtestResult.decisionAttribution.averageBadRotationReturn.toFixed(2)}% en moyenne
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Contribution du timing</div>
                    <div className="text-xl font-semibold">
                      {backtestResult.decisionAttribution.timingContribution >= 0 ? "+" : ""}
                      {backtestResult.decisionAttribution.timingContribution.toFixed(2)}%
                    </div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Contribution de la sélection</div>
                    <div className="text-xl font-semibold">
                      {backtestResult.decisionAttribution.sectorSelectionContribution >= 0 ? "+" : ""}
                      {backtestResult.decisionAttribution.sectorSelectionContribution.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <div className="text-sm text-amber-800">Opportunités manquées</div>
                    <div className="text-xl font-semibold">
                      {backtestResult.decisionAttribution.missedOpportunities}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-800">Faux signaux</div>
                    <div className="text-xl font-semibold">{backtestResult.decisionAttribution.falseSignals}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Métriques de risque avancées */}
            <div className="mt-6">
              <div className="mb-2 font-medium">Métriques de Risque Avancées</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Ratio de Sortino</div>
                  <div
                    className={`text-xl font-semibold ${
                      backtestResult.riskMetrics.sortinoRatio >= 1
                        ? "text-green-600"
                        : backtestResult.riskMetrics.sortinoRatio >= 0
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {backtestResult.riskMetrics.sortinoRatio.toFixed(2)}
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Ratio d'Information</div>
                  <div
                    className={`text-xl font-semibold ${
                      backtestResult.riskMetrics.informationRatio >= 0.5
                        ? "text-green-600"
                        : backtestResult.riskMetrics.informationRatio >= 0
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {backtestResult.riskMetrics.informationRatio.toFixed(2)}
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Tracking Error</div>
                  <div className="text-xl font-semibold">{backtestResult.riskMetrics.trackingError.toFixed(2)}%</div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Ratio de Calmar</div>
                  <div
                    className={`text-xl font-semibold ${
                      backtestResult.riskMetrics.calmarRatio >= 1
                        ? "text-green-600"
                        : backtestResult.riskMetrics.calmarRatio >= 0
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {backtestResult.riskMetrics.calmarRatio.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Onglet d'attribution par secteur */}
          <TabsContent value="sectors" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Graphique de contribution par secteur */}
              <div className="h-80">
                <div className="mb-2 font-medium">Contribution par Secteur</div>
                <ChartContainer
                  config={{
                    value: {
                      label: "Contribution",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectorAttributionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" tickFormatter={(value) => `${value.toFixed(1)}%`} />
                      <YAxis type="category" dataKey="name" width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="var(--color-value)" isAnimationActive={false} radius={[0, 4, 4, 0]}>
                        {sectorAttributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Graphique de temps passé par secteur */}
              <div className="h-80">
                <div className="mb-2 font-medium">Temps Passé par Secteur (%)</div>
                <ChartContainer
                  config={{
                    percentageTimeHeld: {
                      label: "Temps passé (%)",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectorAttributionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" tickFormatter={(value) => `${value.toFixed(1)}%`} />
                      <YAxis type="category" dataKey="name" width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="percentageTimeHeld"
                        fill="var(--color-percentageTimeHeld)"
                        isAnimationActive={false}
                        radius={[0, 4, 4, 0]}
                      >
                        {sectorAttributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            {/* Tableau d'attribution par secteur */}
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Secteur</TableHead>
                    <TableHead>Jours détenus</TableHead>
                    <TableHead>% du temps</TableHead>
                    <TableHead>Contribution</TableHead>
                    <TableHead>% de la perf.</TableHead>
                    <TableHead>Rendement moyen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backtestResult.sectorAttribution.map((sector, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{sector.sectorName}</TableCell>
                      <TableCell>{sector.daysHeld}</TableCell>
                      <TableCell>{sector.percentageTimeHeld.toFixed(1)}%</TableCell>
                      <TableCell className={sector.contribution >= 0 ? "text-green-600" : "text-red-600"}>
                        {sector.contribution >= 0 ? "+" : ""}
                        {sector.contribution.toFixed(2)}%
                      </TableCell>
                      <TableCell>{sector.contributionPercentage.toFixed(1)}%</TableCell>
                      <TableCell className={sector.averageReturn >= 0 ? "text-green-600" : "text-red-600"}>
                        {sector.averageReturn >= 0 ? "+" : ""}
                        {sector.averageReturn.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Onglet d'analyse de risque */}
          <TabsContent value="risk" className="space-y-4 mt-4">
            {/* Métriques de risque */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">VaR (95%)</div>
                <div className="text-xl font-semibold text-red-600">
                  -{backtestResult.riskMetrics.var95.toFixed(2)}%
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Expected Shortfall</div>
                <div className="text-xl font-semibold text-red-600">
                  -{backtestResult.riskMetrics.expectedShortfall.toFixed(2)}%
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Capture Ratio (Hausse)</div>
                <div
                  className={`text-xl font-semibold ${
                    backtestResult.riskMetrics.captureRatioUp > 1 ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {(backtestResult.riskMetrics.captureRatioUp * 100).toFixed(0)}%
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Capture Ratio (Baisse)</div>
                <div
                  className={`text-xl font-semibold ${
                    backtestResult.riskMetrics.captureRatioDown < 1 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {(backtestResult.riskMetrics.captureRatioDown * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Analyse des drawdowns */}
            <div className="mt-4">
              <div className="mb-2 font-medium">Analyse des Drawdowns</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <ArrowDownRight className="h-4 w-4 text-red-600 mr-2" />
                    <div className="text-sm text-red-800">Drawdown Maximal</div>
                  </div>
                  <div className="mt-1">
                    <div className="text-2xl font-semibold text-red-600">
                      -{backtestResult.drawdownAnalysis.maxDrawdown.toFixed(2)}%
                    </div>
                    <div className="text-sm">Durée: {backtestResult.drawdownAnalysis.maxDrawdownDuration} jours</div>
                    <div className="text-sm">
                      {new Date(backtestResult.drawdownAnalysis.maxDrawdownStartDate).toLocaleDateString()} -
                      {new Date(backtestResult.drawdownAnalysis.maxDrawdownEndDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    <div className="text-sm text-muted-foreground">Statistiques des Drawdowns</div>
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Moyenne</div>
                      <div className="text-lg font-semibold text-red-600">
                        -{backtestResult.drawdownAnalysis.averageDrawdown.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Fréquence</div>
                      <div className="text-lg font-semibold">
                        {backtestResult.drawdownAnalysis.drawdownFrequency.toFixed(1)}/an
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tableau des drawdowns */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Début</TableHead>
                      <TableHead>Fin</TableHead>
                      <TableHead>Récupération</TableHead>
                      <TableHead>Profondeur</TableHead>
                      <TableHead>Durée (j)</TableHead>
                      <TableHead>Récup. (j)</TableHead>
                      <TableHead>Secteur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drawdownData.map((drawdown, index) => (
                      <TableRow key={index}>
                        <TableCell>{drawdown.startDate}</TableCell>
                        <TableCell>{drawdown.endDate}</TableCell>
                        <TableCell>{drawdown.recoveryDate}</TableCell>
                        <TableCell className="text-red-600">-{drawdown.depth.toFixed(2)}%</TableCell>
                        <TableCell>{drawdown.duration}</TableCell>
                        <TableCell>{drawdown.recoveryDuration}</TableCell>
                        <TableCell>{drawdown.sectorAtStart}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* Onglet d'analyse temporelle */}
          <TabsContent value="time" className="space-y-4 mt-4">
            {/* Performances mensuelles */}
            <div>
              <div className="mb-2 font-medium">Performances Mensuelles</div>
              <div className="h-60">
                <ChartContainer
                  config={{
                    performance: {
                      label: "Performance",
                      color: "hsl(var(--chart-1))",
                    },
                    benchmark: {
                      label: "Benchmark",
                      color: "hsl(var(--chart-2))",
                    },
                    excess: {
                      label: "Excès",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyPerformanceData.slice(-12)} // 12 derniers mois
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="performance" fill="var(--color-performance)" isAnimationActive={false} />
                      <Bar dataKey="benchmark" fill="var(--color-benchmark)" isAnimationActive={false} />
                      <Bar dataKey="excess" fill="var(--color-excess)" isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            {/* Performances glissantes */}
            <div className="mt-6">
              <div className="mb-2 font-medium">Performances Glissantes</div>
              <div className="h-60">
                <ChartContainer
                  config={{
                    "1M": {
                      label: "1 Mois",
                      color: "hsl(var(--chart-4))",
                    },
                    "3M": {
                      label: "3 Mois",
                      color: "hsl(var(--chart-1))",
                    },
                    "6M": {
                      label: "6 Mois",
                      color: "hsl(var(--chart-2))",
                    },
                    "1A": {
                      label: "1 An",
                      color: "hsl(var(--chart-3))",
                    },
                    "Benchmark 1A": {
                      label: "Benchmark 1A",
                      color: "hsl(var(--chart-9))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rollingPerformanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                      <Line
                        type="monotone"
                        dataKey="1M"
                        stroke="var(--color-1M)"
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="3M"
                        stroke="var(--color-3M)"
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="6M"
                        stroke="var(--color-6M)"
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="1A"
                        stroke="var(--color-1A)"
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="Benchmark 1A"
                        stroke="var(--color-Benchmark 1A)"
                        strokeDasharray="5 5"
                        dot={false}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            {/* Statistiques de performance par période */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2 font-medium">Meilleures Périodes</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Période</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>vs Benchmark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyPerformanceData
                      .sort((a, b) => b.performance - a.performance)
                      .slice(0, 5)
                      .map((month, index) => (
                        <TableRow key={index}>
                          <TableCell>{month.date}</TableCell>
                          <TableCell className="text-green-600">+{month.performance.toFixed(2)}%</TableCell>
                          <TableCell className={month.excess >= 0 ? "text-green-600" : "text-red-600"}>
                            {month.excess >= 0 ? "+" : ""}
                            {month.excess.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
              <div>
                <div className="mb-2 font-medium">Pires Périodes</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Période</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>vs Benchmark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyPerformanceData
                      .sort((a, b) => a.performance - b.performance)
                      .slice(0, 5)
                      .map((month, index) => (
                        <TableRow key={index}>
                          <TableCell>{month.date}</TableCell>
                          <TableCell className={month.performance >= 0 ? "text-green-600" : "text-red-600"}>
                            {month.performance >= 0 ? "+" : ""}
                            {month.performance.toFixed(2)}%
                          </TableCell>
                          <TableCell className={month.excess >= 0 ? "text-green-600" : "text-red-600"}>
                            {month.excess >= 0 ? "+" : ""}
                            {month.excess.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
