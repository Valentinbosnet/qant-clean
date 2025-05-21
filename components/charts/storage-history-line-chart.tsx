"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { CachePriority } from "@/lib/offline-mode"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface StorageHistoryLineChartProps {
  data: any[]
}

export function StorageHistoryLineChart({ data }: StorageHistoryLineChartProps) {
  // Formater la taille en KB ou MB
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <ChartContainer
      config={{
        totalSize: {
          label: "Total",
          color: "hsl(var(--chart-1))",
        },
        [CachePriority.CRITICAL]: {
          label: "Critique",
          color: "hsl(var(--chart-2))",
        },
        [CachePriority.HIGH]: {
          label: "Haute",
          color: "hsl(var(--chart-3))",
        },
        [CachePriority.MEDIUM]: {
          label: "Moyenne",
          color: "hsl(var(--chart-4))",
        },
        [CachePriority.LOW]: {
          label: "Basse",
          color: "hsl(var(--chart-5))",
        },
        [CachePriority.TEMPORARY]: {
          label: "Temporaire",
          color: "hsl(var(--chart-6))",
        },
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatSize} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalSize"
            name="Total"
            stroke="var(--color-totalSize)"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey={CachePriority.CRITICAL}
            name="Critique"
            stroke={`var(--color-${CachePriority.CRITICAL})`}
          />
          <Line
            type="monotone"
            dataKey={CachePriority.HIGH}
            name="Haute"
            stroke={`var(--color-${CachePriority.HIGH})`}
          />
          <Line
            type="monotone"
            dataKey={CachePriority.MEDIUM}
            name="Moyenne"
            stroke={`var(--color-${CachePriority.MEDIUM})`}
          />
          <Line type="monotone" dataKey={CachePriority.LOW} name="Basse" stroke={`var(--color-${CachePriority.LOW})`} />
          <Line
            type="monotone"
            dataKey={CachePriority.TEMPORARY}
            name="Temporaire"
            stroke={`var(--color-${CachePriority.TEMPORARY})`}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
