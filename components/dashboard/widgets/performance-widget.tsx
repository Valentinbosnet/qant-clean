"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { WidgetConfig } from "@/lib/dashboard-service"

interface PerformanceWidgetProps {
  config: WidgetConfig
}

export function PerformanceWidget({ config }: PerformanceWidgetProps) {
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const period = config.settings?.period || "1M"

  useEffect(() => {
    // Simuler le chargement des données de performance
    setIsLoading(true)

    setTimeout(() => {
      try {
        // Données fictives pour la démonstration
        const mockData = [
          { name: "Tech", value: 12.5 },
          { name: "Finance", value: 8.2 },
          { name: "Energy", value: -5.3 },
          { name: "Health", value: 7.1 },
          { name: "Consumer", value: 3.8 },
          { name: "Utilities", value: -2.1 },
          { name: "Materials", value: 1.4 },
        ]

        setPerformanceData(mockData)
        setIsLoading(false)
      } catch (err) {
        console.error("Erreur lors du chargement des données de performance:", err)
        setError(err instanceof Error ? err : new Error("Erreur inconnue"))
        setIsLoading(false)
      }
    }, 1000)
  }, [period])

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-destructive">Erreur lors du chargement des données</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Performance des secteurs</h3>
        <Badge variant="outline">{period}</Badge>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={performanceData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={["dataMin", "dataMax"]} />
            <YAxis dataKey="name" type="category" width={80} />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(2)}%`, "Performance"]}
              labelFormatter={(label) => `Secteur: ${label}`}
            />
            <Bar
              dataKey="value"
              fill={(entry) => (entry.value >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))")}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
