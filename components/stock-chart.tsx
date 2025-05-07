"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import type { StockHistoryPoint } from "@/lib/stock-service"
import { formatPrice } from "@/lib/utils"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface StockChartProps {
  data: StockHistoryPoint[]
  days?: number
  showAxes?: boolean
  height?: number
}

export function StockChart({ data, days = 30, showAxes = true, height = 300 }: StockChartProps) {
  // Get the last X days of data
  const chartData = data.slice(-days)

  // Determine if the price trend is positive
  const startPrice = chartData[0]?.price || 0
  const endPrice = chartData[chartData.length - 1]?.price || 0
  const isPositive = endPrice >= startPrice

  return (
    <ChartContainer
      config={{
        price: {
          label: "Price",
          color: isPositive ? "hsl(142.1 76.2% 36.3%)" : "hsl(346.8 77.2% 49.8%)",
        },
      }}
      className="h-full w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          {showAxes && (
            <>
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis tickFormatter={(value) => formatPrice(value)} tickLine={false} axisLine={false} width={60} />
            </>
          )}
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatPrice(value as number)} />} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--color-price)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
