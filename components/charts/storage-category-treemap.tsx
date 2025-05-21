"use client"

import { Treemap, ResponsiveContainer } from "recharts"
import type { StorageAnalysis } from "@/lib/offline-mode"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface StorageCategoryTreemapProps {
  data: StorageAnalysis
}

export function StorageCategoryTreemap({ data }: StorageCategoryTreemapProps) {
  // Préparer les données pour le graphique
  const prepareData = () => {
    const categories = Object.keys(data.sizeByCategory)

    // Si aucune catégorie n'est définie, créer une catégorie "Autres"
    if (categories.length === 0) {
      return [
        {
          name: "Stockage",
          children: [{ name: "Autres", size: data.totalSize }],
        },
      ]
    }

    return [
      {
        name: "Stockage",
        children: categories.map((category) => ({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          size: data.sizeByCategory[category],
          itemCount: data.itemsByCategory[category] || 0,
        })),
      },
    ]
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
        <Treemap
          data={chartData}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          fill="#8884d8"
          content={({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
            return (
              <g>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  style={{
                    fill: COLORS[index % COLORS.length],
                    stroke: "#fff",
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                  }}
                />
                {depth === 1 && width > 50 && height > 20 && (
                  <>
                    <text
                      x={x + width / 2}
                      y={y + height / 2 - 7}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {name}
                    </text>
                    <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={10}>
                      {formatSize(payload.size)}
                    </text>
                  </>
                )}
              </g>
            )
          }}
        >
          <ChartTooltip content={<ChartTooltipContent />} />
        </Treemap>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
