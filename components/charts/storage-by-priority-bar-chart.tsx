"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { type CacheStats, CachePriority } from "@/lib/offline-mode"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface StorageByPriorityBarChartProps {
  data: CacheStats
}

export function StorageByPriorityBarChart({ data }: StorageByPriorityBarChartProps) {
  // Préparer les données pour le graphique
  const prepareData = () => {
    return Object.values(CachePriority).map((priority) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      size: data.sizeByPriority[priority] || 0,
      items: data.itemsByPriority[priority] || 0,
    }))
  }

  const chartData = prepareData()

  // Formater la taille en KB ou MB
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <ChartContainer
      config={{
        size: {
          label: "Taille",
          color: "hsl(var(--chart-1))",
        },
        items: {
          label: "Éléments",
          color: "hsl(var(--chart-2))",
        },
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" orientation="left" tickFormatter={formatSize} />
          <YAxis yAxisId="right" orientation="right" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar yAxisId="left" dataKey="size" name="Taille" fill="var(--color-size)" />
          <Bar yAxisId="right" dataKey="items" name="Éléments" fill="var(--color-items)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
