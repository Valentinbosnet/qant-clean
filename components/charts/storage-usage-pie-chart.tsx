"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import type { StorageAnalysis } from "@/lib/offline-mode"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface StorageUsagePieChartProps {
  data: StorageAnalysis
}

export function StorageUsagePieChart({ data }: StorageUsagePieChartProps) {
  // Préparer les données pour le graphique
  const prepareData = () => {
    const categories = Object.keys(data.sizeByCategory)

    // Si aucune catégorie n'est définie, créer une catégorie "Autres"
    if (categories.length === 0) {
      return [{ name: "Autres", value: data.totalSize }]
    }

    return categories.map((category) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: data.sizeByCategory[category],
    }))
  }

  const chartData = prepareData()

  // Couleurs pour les différentes catégories
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#6B66FF"]

  // Formater la taille en KB ou MB
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  // Formater le pourcentage
  const formatPercent = (value: number) => {
    return `${((value / data.totalSize) * 100).toFixed(1)}%`
  }

  return (
    <ChartContainer
      config={{
        size: {
          label: "Taille",
          color: "hsl(var(--chart-1))",
        },
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, value }) => `${name}: ${formatSize(value)}`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend
            formatter={(value, entry, index) => {
              // @ts-ignore
              const { payload } = entry
              return `${value} (${formatPercent(payload.value)})`
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
