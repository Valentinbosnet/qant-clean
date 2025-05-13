"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SectorRotationBacktestChart } from "./sector-rotation-backtest-chart"
import { Settings2, RefreshCw, Save, PencilRuler } from "lucide-react"
import type { RotationStrategyConfig, RotationBacktestResult } from "@/lib/sector-rotation-backtest-service"
import { getAllSectors } from "@/lib/sector-comparison-service"
import type { SectorType } from "@/lib/sector-classification"

interface SectorRotationStrategyOptimizerProps {
  initialStrategy: RotationStrategyConfig
  onRunBacktest: (config: RotationStrategyConfig) => Promise<RotationBacktestResult>
  onSaveStrategy?: (config: RotationStrategyConfig) => Promise<void>
  isLoading?: boolean
  backtestResult?: RotationBacktestResult
}

export function SectorRotationStrategyOptimizer({
  initialStrategy,
  onRunBacktest,
  onSaveStrategy,
  isLoading = false,
  backtestResult,
}: SectorRotationStrategyOptimizerProps) {
  const [strategy, setStrategy] = useState<RotationStrategyConfig>({ ...initialStrategy })
  const [activeTab, setActiveTab] = useState("settings")

  // Liste des secteurs disponibles
  const availableSectors = getAllSectors()

  // Fonction pour mettre à jour une propriété de la stratégie
  const updateStrategy = (key: keyof RotationStrategyConfig, value: any) => {
    setStrategy((prev) => ({ ...prev, [key]: value }))
  }

  // Fonction pour mettre à jour une propriété de la gestion des risques
  const updateRiskManagement = (key: keyof RotationStrategyConfig["riskManagement"], value: any) => {
    setStrategy((prev) => ({
      ...prev,
      riskManagement: {
        ...prev.riskManagement,
        [key]: value,
      },
    }))
  }

  // Fonction pour gérer l'inclusion/exclusion des secteurs
  const toggleSectorInclusion = (sector: SectorType, include: boolean) => {
    if (include) {
      // Ajouter le secteur aux secteurs inclus s'il n'y est pas déjà
      // et le retirer des secteurs exclus
      setStrategy((prev) => ({
        ...prev,
        includeSectors: prev.includeSectors.includes(sector) ? prev.includeSectors : [...prev.includeSectors, sector],
        excludeSectors: prev.excludeSectors.filter((s) => s !== sector),
      }))
    } else {
      // Retirer le secteur des secteurs inclus
      setStrategy((prev) => ({
        ...prev,
        includeSectors: prev.includeSectors.filter((s) => s !== sector),
      }))
    }
  }

  const toggleSectorExclusion = (sector: SectorType, exclude: boolean) => {
    if (exclude) {
      // Ajouter le secteur aux secteurs exclus s'il n'y est pas déjà
      // et le retirer des secteurs inclus
      setStrategy((prev) => ({
        ...prev,
        excludeSectors: prev.excludeSectors.includes(sector) ? prev.excludeSectors : [...prev.excludeSectors, sector],
        includeSectors: prev.includeSectors.filter((s) => s !== sector),
      }))
    } else {
      // Retirer le secteur des secteurs exclus
      setStrategy((prev) => ({
        ...prev,
        excludeSectors: prev.excludeSectors.filter((s) => s !== sector),
      }))
    }
  }

  // Fonction pour exécuter le backtest
  const handleRunBacktest = () => {
    onRunBacktest(strategy)
  }

  // Fonction pour sauvegarder la stratégie
  const handleSaveStrategy = () => {
    if (onSaveStrategy) {
      onSaveStrategy(strategy)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <PencilRuler className="mr-2 h-5 w-5" />
          Optimisation de Stratégie de Rotation
        </CardTitle>
        <CardDescription>Configurez et testez différentes stratégies de rotation sectorielle</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings" className="flex items-center">
              <Settings2 className="mr-1 h-4 w-4" /> Paramètres
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center" disabled={!backtestResult}>
              <RefreshCw className="mr-1 h-4 w-4" /> Résultats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4 mt-4">
            {/* Paramètres généraux */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="strategy-name">Nom de la stratégie</Label>
                  <Input
                    id="strategy-name"
                    value={strategy.name}
                    onChange={(e) => updateStrategy("name", e.target.value)}
                    placeholder="Nom de la stratégie"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strategy-description">Description</Label>
                  <Input
                    id="strategy-description"
                    value={strategy.description}
                    onChange={(e) => updateStrategy("description", e.target.value)}
                    placeholder="Description de la stratégie"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="signal-threshold">Seuil de signal ({strategy.signalThreshold}%)</Label>
                  </div>
                  <Slider
                    id="signal-threshold"
                    min={1}
                    max={30}
                    step={1}
                    value={[strategy.signalThreshold]}
                    onValueChange={(value) => updateStrategy("signalThreshold", value[0])}
                  />
                  <p className="text-xs text-muted-foreground">
                    Différence de performance minimale requise pour générer un signal de rotation
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="rebalance-period">
                      Période de rééquilibrage ({strategy.rebalancePeriod} jours)
                    </Label>
                  </div>
                  <Slider
                    id="rebalance-period"
                    min={7}
                    max={90}
                    step={7}
                    value={[strategy.rebalancePeriod]}
                    onValueChange={(value) => updateStrategy("rebalancePeriod", value[0])}
                  />
                  <p className="text-xs text-muted-foreground">
                    Fréquence à laquelle la stratégie évalue les opportunités de rotation
                  </p>
                </div>
              </div>
            </div>

            {/* Gestion des risques */}
            <div className="border p-4 rounded-lg space-y-4 mt-6">
              <h3 className="text-lg font-semibold">Gestion des risques</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="stop-loss">Stop Loss ({strategy.riskManagement.stopLoss}%)</Label>
                  </div>
                  <Slider
                    id="stop-loss"
                    min={0}
                    max={30}
                    step={1}
                    value={[strategy.riskManagement.stopLoss]}
                    onValueChange={(value) => updateRiskManagement("stopLoss", value[0])}
                  />
                  <p className="text-xs text-muted-foreground">
                    Perte maximale avant de sortir d'une position (0 = désactivé)
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="max-allocation">
                      Allocation maximale par secteur ({strategy.riskManagement.maxAllocationPerSector}%)
                    </Label>
                  </div>
                  <Slider
                    id="max-allocation"
                    min={10}
                    max={100}
                    step={10}
                    value={[strategy.riskManagement.maxAllocationPerSector]}
                    onValueChange={(value) => updateRiskManagement("maxAllocationPerSector", value[0])}
                  />
                  <p className="text-xs text-muted-foreground">
                    Pourcentage maximal du portefeuille à allouer à un secteur
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="use-market-timing"
                  checked={strategy.useMarketTiming}
                  onCheckedChange={(checked) => updateStrategy("useMarketTiming", checked)}
                />
                <Label htmlFor="use-market-timing">Utiliser le market timing</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Ajuster les allocations en fonction des conditions générales du marché
              </p>
            </div>

            {/* Sélection des secteurs */}
            <div className="border p-4 rounded-lg space-y-4 mt-6">
              <h3 className="text-lg font-semibold">Sélection des secteurs</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {availableSectors.map((sector) => (
                  <div key={sector.type} className="flex items-start space-x-2">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`include-${sector.type}`}
                          checked={strategy.includeSectors.includes(sector.type)}
                          onCheckedChange={(checked) => toggleSectorInclusion(sector.type, checked === true)}
                        />
                        <Label htmlFor={`include-${sector.type}`}>Inclure</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`exclude-${sector.type}`}
                          checked={strategy.excludeSectors.includes(sector.type)}
                          onCheckedChange={(checked) => toggleSectorExclusion(sector.type, checked === true)}
                        />
                        <Label htmlFor={`exclude-${sector.type}`}>Exclure</Label>
                      </div>
                    </div>
                    <Label className="pt-0.5">{sector.name}</Label>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Si aucun secteur n'est spécifiquement inclus, tous les secteurs non exclus seront considérés
              </p>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4 mt-4">
            {backtestResult ? (
              <SectorRotationBacktestChart backtestResult={backtestResult} />
            ) : (
              <div className="text-center p-8 text-muted-foreground">Exécutez un backtest pour voir les résultats</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleSaveStrategy} disabled={isLoading || !onSaveStrategy}>
          <Save className="mr-2 h-4 w-4" />
          Sauvegarder la stratégie
        </Button>
        <Button onClick={handleRunBacktest} disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Exécution en cours...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Exécuter le backtest
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
