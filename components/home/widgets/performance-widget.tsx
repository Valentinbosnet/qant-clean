import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import type { HomeWidgetConfig } from "@/lib/home-widgets-service"

interface PerformanceWidgetProps {
  config: HomeWidgetConfig
}

export function PerformanceWidget({ config }: PerformanceWidgetProps) {
  // Données fictives pour les performances
  const performanceData = {
    portfolio: {
      value: 25750.42,
      change: 325.18,
      changePercent: 1.28,
    },
    topPerformers: [
      { symbol: "NVDA", name: "NVIDIA Corp.", changePercent: 4.25 },
      { symbol: "AAPL", name: "Apple Inc.", changePercent: 2.18 },
    ],
    worstPerformers: [
      { symbol: "META", name: "Meta Platforms", changePercent: -1.75 },
      { symbol: "NFLX", name: "Netflix Inc.", changePercent: -0.92 },
    ],
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-3">Performance</h3>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Valeur du portefeuille</div>
          <div className="text-2xl font-bold">${performanceData.portfolio.value.toLocaleString()}</div>
          <div
            className={`flex items-center text-sm ${
              performanceData.portfolio.change >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {performanceData.portfolio.change >= 0 ? (
              <ArrowUpRight className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 mr-1" />
            )}
            {performanceData.portfolio.change >= 0 ? "+" : ""}${performanceData.portfolio.change.toFixed(2)} (
            {performanceData.portfolio.changePercent.toFixed(2)}%)
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Meilleures performances</h4>
          {performanceData.topPerformers.map((stock) => (
            <Card key={stock.symbol} className="mb-2">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-xs text-muted-foreground">{stock.name}</div>
                  </div>
                  <div className="text-green-500 flex items-center">
                    <ArrowUpRight className="h-4 w-4 mr-1" />+{stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Moins bonnes performances</h4>
          {performanceData.worstPerformers.map((stock) => (
            <Card key={stock.symbol} className="mb-2">
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-xs text-muted-foreground">{stock.name}</div>
                  </div>
                  <div className="text-red-500 flex items-center">
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                    {stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
