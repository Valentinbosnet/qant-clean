"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { analyzeStorageUsage, getCacheStats, CachePriority } from "@/lib/offline-mode"
import { StorageUsagePieChart } from "./charts/storage-usage-pie-chart"
import { StorageByPriorityBarChart } from "./charts/storage-by-priority-bar-chart"
import { StorageHistoryLineChart } from "./charts/storage-history-line-chart"
import { StorageCategoryTreemap } from "./charts/storage-category-treemap"
import { RefreshCw, Download, HelpCircle } from "lucide-react"
import type { StorageAnalysis } from "@/lib/offline-mode"
import type { CacheStats } from "@/lib/offline-mode"
import { StorageStatsCards } from "./storage-stats-cards"

export function StorageVisualization() {
  const [storageAnalysis, setStorageAnalysis] = useState<StorageAnalysis | null>(null)
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("7d")
  const [historyData, setHistoryData] = useState<any[]>([])

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const analysis = analyzeStorageUsage()
        const stats = getCacheStats()
        setStorageAnalysis(analysis)
        setCacheStats(stats)

        // Générer des données d'historique simulées
        generateHistoryData(timeRange)
      } catch (error) {
        console.error("Erreur lors du chargement des données de stockage:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [timeRange])

  // Générer des données d'historique simulées pour la démonstration
  const generateHistoryData = (range: string) => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90
    const data = []
    const now = new Date()
    let totalSize = Math.random() * 5 * 1024 * 1024 // Taille initiale aléatoire (max 5MB)

    for (let i = days; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      // Ajouter une variation aléatoire à la taille totale
      totalSize += (Math.random() - 0.3) * 500 * 1024 // Variation entre -150KB et +350KB
      totalSize = Math.max(totalSize, 100 * 1024) // Minimum 100KB

      // Répartir la taille totale entre les différentes priorités
      const criticalSize = totalSize * (0.2 + Math.random() * 0.1) // 20-30%
      const highSize = totalSize * (0.3 + Math.random() * 0.1) // 30-40%
      const mediumSize = totalSize * (0.2 + Math.random() * 0.1) // 20-30%
      const lowSize = totalSize * (0.1 + Math.random() * 0.05) // 10-15%
      const temporarySize = totalSize - criticalSize - highSize - mediumSize - lowSize

      data.push({
        date: date.toISOString().split("T")[0],
        totalSize,
        [CachePriority.CRITICAL]: criticalSize,
        [CachePriority.HIGH]: highSize,
        [CachePriority.MEDIUM]: mediumSize,
        [CachePriority.LOW]: lowSize,
        [CachePriority.TEMPORARY]: temporarySize,
        itemCount: Math.round(totalSize / (10 * 1024)), // ~10KB par élément en moyenne
      })
    }

    setHistoryData(data)
  }

  // Rafraîchir les données
  const refreshData = async () => {
    setIsLoading(true)
    try {
      const analysis = analyzeStorageUsage()
      const stats = getCacheStats()
      setStorageAnalysis(analysis)
      setCacheStats(stats)
      generateHistoryData(timeRange)
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des données:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Exporter les données
  const exportData = () => {
    if (!storageAnalysis || !cacheStats) return

    const exportObj = {
      storageAnalysis,
      cacheStats,
      historyData,
      exportDate: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(exportObj, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `storage-stats-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Formater la taille en KB ou MB
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  if (isLoading && !storageAnalysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visualisation du stockage</CardTitle>
          <CardDescription>Chargement des données...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-10">
          <RefreshCw className="h-10 w-10 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Visualisation du stockage</CardTitle>
            <CardDescription>Analysez l'utilisation de votre stockage hors ligne</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 jours</SelectItem>
                <SelectItem value="30d">30 jours</SelectItem>
                <SelectItem value="90d">90 jours</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={refreshData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={exportData}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {storageAnalysis && cacheStats && (
          <>
            <StorageStatsCards analysis={storageAnalysis} stats={cacheStats} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="categories">Catégories</TabsTrigger>
                <TabsTrigger value="priorities">Priorités</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Répartition de l'espace</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-[300px]">
                        <StorageUsagePieChart data={storageAnalysis} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Utilisation par priorité</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-[300px]">
                        <StorageByPriorityBarChart data={cacheStats} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="categories" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Répartition par catégorie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <StorageCategoryTreemap data={storageAnalysis} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="priorities" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Détail par priorité</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {Object.values(CachePriority).map((priority) => (
                        <div key={priority} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{priority.charAt(0).toUpperCase() + priority.slice(1)}</h3>
                            <span className="text-sm font-medium">
                              {formatSize(cacheStats.sizeByPriority[priority] || 0)}
                            </span>
                          </div>
                          <div className="bg-muted h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                priority === CachePriority.CRITICAL
                                  ? "bg-red-500"
                                  : priority === CachePriority.HIGH
                                    ? "bg-orange-500"
                                    : priority === CachePriority.MEDIUM
                                      ? "bg-blue-500"
                                      : priority === CachePriority.LOW
                                        ? "bg-green-500"
                                        : "bg-gray-500"
                              }`}
                              style={{
                                width: `${
                                  cacheStats.totalSize > 0
                                    ? ((cacheStats.sizeByPriority[priority] || 0) / cacheStats.totalSize) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{cacheStats.itemsByPriority[priority] || 0} éléments</span>
                            <span>
                              {cacheStats.totalSize > 0
                                ? (((cacheStats.sizeByPriority[priority] || 0) / cacheStats.totalSize) * 100).toFixed(1)
                                : 0}
                              % du total
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Évolution du stockage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <StorageHistoryLineChart data={historyData} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-6">
        <div className="flex items-center text-sm text-muted-foreground">
          <HelpCircle className="h-4 w-4 mr-1" />
          <span>Les données sont mises à jour en temps réel</span>
        </div>
        <Button variant="outline" onClick={exportData}>
          <Download className="h-4 w-4 mr-2" />
          Exporter les données
        </Button>
      </CardFooter>
    </Card>
  )
}
