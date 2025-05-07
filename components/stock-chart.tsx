"use client"

import { useState } from "react"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import type { StockHistoryPoint, IntradayPoint } from "@/lib/stock-service"
import { formatPrice } from "@/lib/utils"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface StockChartProps {
  data: StockHistoryPoint[]
  intraday?: IntradayPoint[]
  days?: number
  showAxes?: boolean
  height?: number
  showIntraday?: boolean
}

export function StockChart({
  data,
  intraday,
  days = 30,
  showAxes = true,
  height = 300,
  showIntraday = false,
}: StockChartProps) {
  const [viewMode, setViewMode] = useState<"daily" | "intraday">(
    showIntraday && intraday && intraday.length > 0 ? "intraday" : "daily",
  )

  // Get the appropriate data based on view mode
  const chartData =
    viewMode === "daily"
      ? data.slice(-days) // Daily data with specified days
      : intraday || [] // Intraday data if available

  // Determine if the price trend is positive
  const startPrice = chartData[0]?.price || 0
  const endPrice = chartData[chartData.length - 1]?.price || 0
  const isPositive = endPrice >= startPrice

  // Format X-axis labels based on data type
  const formatXAxis = (value: string) => {
    if (viewMode === "intraday") {
      // For intraday, show time only (e.g., "14:30")
      const date = new Date(value)
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
    } else {
      // For daily, show month/day (e.g., "9/15")
      const date = new Date(value)
      return `${date.getMonth() + 1}/${date.getDate()}`
    }
  }

  // Determine the data key based on view mode
  const dataKey = viewMode === "intraday" ? "timestamp" : "date"

  return (
    <div className="h-full w-full">
      {/* Show intraday/daily toggle if intraday data is available */}
      {intraday && intraday.length > 0 && showIntraday && (
        <div className="flex justify-end mb-2">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-2 py-1 text-xs rounded-l-md ${
                viewMode === "daily" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
              }`}
              onClick={() => setViewMode("daily")}
            >
              Daily
            </button>
            <button
              type="button"
              className={`px-2 py-1 text-xs rounded-r-md ${
                viewMode === "intraday" ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80"
              }`}
              onClick={() => setViewMode("intraday")}
            >
              Intraday
            </button>
          </div>
        </div>
      )}

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
                  dataKey={dataKey}
                  tickFormatter={formatXAxis}
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
    </div>
  )
}
