"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Types pour les données de secteur
interface SectorData {
  name: string
  performance: number
  volume: number
  marketCap: number
}

// Props pour le widget
interface SectorWidgetProps {
  config: {
    settings?: {
      limit?: number
      defaultPeriod?: string
      defaultSort?: string
    }
  }
}

// Fonction pour simuler le chargement des données de secteur
const fetchSectorData = async (period: string): Promise<SectorData[]> => {
  // Simuler un délai de chargement
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Données simulées pour différentes périodes
  const multiplier = period === "day" ? 1 : period === "week" ? 2 : period === "month" ? 3 : 5

  return [
    { name: "Technologie", performance: 1.2 * multiplier, volume: 12500000, marketCap: 9800000000000 },
    { name: "Finance", performance: -0.8 * multiplier, volume: 9800000, marketCap: 7600000000000 },
    { name: "Santé", performance: 0.5 * multiplier, volume: 7600000, marketCap: 6500000000000 },
    { name: "Consommation", performance: 0.3 * multiplier, volume: 6500000, marketCap: 5400000000000 },
    { name: "Industrie", performance: -0.4 * multiplier, volume: 5400000, marketCap: 4800000000000 },
    { name: "Énergie", performance: 1.8 * multiplier, volume: 4800000, marketCap: 3900000000000 },
    { name: "Matériaux", performance: -0.6 * multiplier, volume: 3900000, marketCap: 3200000000000 },
    { name: "Services", performance: 0.2 * multiplier, volume: 3200000, marketCap: 2800000000000 },
    { name: "Immobilier", performance: -1.1 * multiplier, volume: 2800000, marketCap: 2400000000000 },
    { name: "Télécommunications", performance: 0.7 * multiplier, volume: 2400000, marketCap: 2100000000000 },
  ]
}

// Composant principal du widget
export function SectorWidget({ config }: SectorWidgetProps) {
  const [sectors, setSectors] = useState<SectorData[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(config.settings?.defaultPeriod || "day")
  const [sortBy, setSortBy] = useState(config.settings?.defaultSort || "performance")

  const limit = config.settings?.limit || 10

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const data = await fetchSectorData(period)
        setSectors(data)
      } catch (error) {
        console.error("Erreur lors du chargement des données de secteur:", error)
        setSectors([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [period])

  // Trier les secteurs
  const sortedSectors = [...sectors]
    .sort((a, b) => {
      if (sortBy === "performance") {
        return Math.abs(b.performance) - Math.abs(a.performance)
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      }
      return 0
    })
    .slice(0, limit)

  // Fonction pour formater les pourcentages
  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  // Fonction pour déterminer la couleur en fonction de la performance
  const getPerformanceColor = (performance: number) => {
    if (performance > 1.5) return "bg-green-500"
    if (performance > 0) return "bg-green-400"
    if (performance > -1.5) return "bg-red-400"
    return "bg-red-500"
  }

  return (
    <Card className="w-full h-full">
      <CardContent className="p-4">
        <Tabs defaultValue={period} onValueChange={setPeriod}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="day">Jour</TabsTrigger>
              <TabsTrigger value="week">Semaine</TabsTrigger>
              <TabsTrigger value="month">Mois</TabsTrigger>
              <TabsTrigger value="year">Année</TabsTrigger>
            </TabsList>

            <select className="text-xs border rounded p-1" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="performance">Trier par performance</option>
              <option value="name">Trier par nom</option>
            </select>
          </div>

          {/* Contenu pour toutes les périodes */}
          {["day", "week", "month", "year"].map((p) => (
            <TabsContent key={p} value={p} className="space-y-2 mt-0">
              {loading
                ? // État de chargement
                  Array(limit)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))
                : // Données des secteurs
                  sortedSectors.map((sector) => (
                    <div
                      key={sector.name}
                      className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors"
                      title={`Volume: ${sector.volume.toLocaleString()} | Cap. Marché: ${(sector.marketCap / 1000000000).toFixed(1)} Mds $`}
                    >
                      <span className="font-medium">{sector.name}</span>
                      <div className="flex items-center gap-1">
                        {sector.performance > 0 ? (
                          <ArrowUpIcon className="h-3 w-3 text-green-500" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3 text-red-500" />
                        )}
                        <span
                          className={cn(
                            "text-sm font-medium",
                            sector.performance > 0 ? "text-green-600" : "text-red-600",
                          )}
                        >
                          {formatPercentage(sector.performance)}
                        </span>
                        <div
                          className={cn("w-2 h-8 rounded-sm", getPerformanceColor(sector.performance))}
                          style={{
                            opacity: Math.min(0.3 + Math.abs(sector.performance) / 5, 1),
                            height: `${Math.min(Math.abs(sector.performance) * 5 + 12, 30)}px`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
