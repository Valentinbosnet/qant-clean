"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SectorRotationBacktestChart } from "@/components/sector-rotation-backtest-chart"
import { SectorRotationBacktestComparison } from "@/components/sector-rotation-backtest-comparison"
import { PerformanceAttributionAnalysis } from "@/components/performance-attribution-analysis"
import { ExportButtons } from "@/components/export-buttons"
import {
  predefinedStrategies,
  sectorRotationBacktestService,
  type RotationBacktestResult,
} from "@/lib/sector-rotation-backtest-service"
import { Loader2 } from "lucide-react"

export default function SectorsBacktestPage() {
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState("2019-01-01")
  const [endDate, setEndDate] = useState("2023-12-31")
  const [selectedStrategy, setSelectedStrategy] = useState<string>(predefinedStrategies[0].name)
  const [backtestResults, setBacktestResults] = useState<RotationBacktestResult[]>([])
  const [activeTab, setActiveTab] = useState("single")

  // Exécuter le backtest au chargement de la page
  useEffect(() => {
    runBacktest()
  }, [])

  // Exécuter un backtest pour une stratégie spécifique
  const runBacktest = async () => {
    setLoading(true)
    try {
      // Trouver la stratégie sélectionnée
      const strategy = predefinedStrategies.find((s) => s.name === selectedStrategy) || predefinedStrategies[0]

      // Exécuter le backtest
      const result = await sectorRotationBacktestService.runBacktest(strategy, startDate, endDate)
      setBacktestResults([result])
    } catch (error) {
      console.error("Erreur lors du backtest:", error)
    } finally {
      setLoading(false)
    }
  }

  // Comparer toutes les stratégies
  const compareAllStrategies = async () => {
    setLoading(true)
    try {
      const results = await sectorRotationBacktestService.compareStrategies(predefinedStrategies, startDate, endDate)
      setBacktestResults(results)
      setActiveTab("compare")
    } catch (error) {
      console.error("Erreur lors de la comparaison des stratégies:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Backtest de Stratégies de Rotation Sectorielle</CardTitle>
            <CardDescription>
              Analysez les performances historiques des stratégies de rotation sectorielle
            </CardDescription>
          </div>
          <ExportButtons results={backtestResults} isComparison={activeTab === "compare"} />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="strategy">Stratégie</Label>
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger id="strategy">
                  <SelectValue placeholder="Sélectionner une stratégie" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedStrategies.map((strategy) => (
                    <SelectItem key={strategy.name} value={strategy.name}>
                      {strategy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Date de début</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="endDate">Date de fin</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex items-end space-x-2">
              <Button onClick={runBacktest} disabled={loading} className="flex-1">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Exécuter le Backtest
              </Button>
              <Button onClick={compareAllStrategies} disabled={loading} variant="outline">
                Comparer Tout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {backtestResults.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single">Analyse Individuelle</TabsTrigger>
            <TabsTrigger value="attribution">Attribution de Performance</TabsTrigger>
            <TabsTrigger value="compare">Comparaison</TabsTrigger>
          </TabsList>
          <TabsContent value="single" className="mt-4">
            <SectorRotationBacktestChart backtestResult={backtestResults[0]} />
          </TabsContent>
          <TabsContent value="attribution" className="mt-4">
            <PerformanceAttributionAnalysis backtestResult={backtestResults[0]} />
          </TabsContent>
          <TabsContent value="compare" className="mt-4">
            <SectorRotationBacktestComparison results={backtestResults} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
