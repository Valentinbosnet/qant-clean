"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStockModal } from "@/hooks/use-stock-modal"
import { StockChart } from "@/components/stock-chart"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getStockData } from "@/lib/stock-service"
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, DollarSign, BarChart3 } from "lucide-react"
// Suppression de l'import du composant de prédiction
// import { StockPrediction } from '@/components/stock-prediction'

export function StockDetailModal() {
  const { isOpen, onClose, stock } = useStockModal()
  const [stockData, setStockData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    async function loadStockData() {
      if (stock?.symbol) {
        setLoading(true)
        try {
          const data = await getStockData(stock.symbol)
          setStockData(data)
        } catch (error) {
          console.error("Error loading stock data:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    if (isOpen && stock) {
      loadStockData()
    } else {
      setStockData(null)
    }
  }, [isOpen, stock])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatPercentage = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100)
  }

  const getChangeColor = (change) => {
    return change >= 0 ? "text-green-500" : "text-red-500"
  }

  const getChangeIcon = (change) => {
    return change >= 0 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        {stock && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    {stock.name} ({stock.symbol})
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground">{stock.exchange}</p>
                </div>
                {stockData && (
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">{formatCurrency(stockData.price)}</span>
                    <div className={`flex items-center ${getChangeColor(stockData.change)}`}>
                      {getChangeIcon(stockData.change)}
                      <span className="ml-1">
                        {formatCurrency(stockData.change)} ({formatPercentage(stockData.changePercent)})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </DialogHeader>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="chart">Chart</TabsTrigger>
                {/* Suppression de l'onglet de prédiction */}
                {/* <TabsTrigger value="prediction">Prediction</TabsTrigger> */}
              </TabsList>

              <TabsContent value="overview" className="space-y-4 py-4">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-[125px] w-full" />
                    <Skeleton className="h-[125px] w-full" />
                  </div>
                ) : stockData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Market Stats</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <dt className="text-muted-foreground">Open</dt>
                            <dd className="font-medium">{formatCurrency(stockData.open)}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Previous Close</dt>
                            <dd className="font-medium">{formatCurrency(stockData.previousClose)}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Day High</dt>
                            <dd className="font-medium">{formatCurrency(stockData.high)}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Day Low</dt>
                            <dd className="font-medium">{formatCurrency(stockData.low)}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Volume</dt>
                            <dd className="font-medium">{stockData.volume.toLocaleString()}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">52-Week Range</dt>
                            <dd className="font-medium">
                              {formatCurrency(stockData.yearLow)} - {formatCurrency(stockData.yearHigh)}
                            </dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Key Indicators</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-2">
                          <div className="flex items-center justify-between">
                            <dt className="flex items-center text-sm text-muted-foreground">
                              <TrendingUp className="mr-2 h-4 w-4" />
                              <span>Trend</span>
                            </dt>
                            <dd>
                              <Badge variant={stockData.trend === "up" ? "success" : "destructive"}>
                                {stockData.trend === "up" ? "Bullish" : "Bearish"}
                              </Badge>
                            </dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt className="flex items-center text-sm text-muted-foreground">
                              <BarChart3 className="mr-2 h-4 w-4" />
                              <span>Volatility</span>
                            </dt>
                            <dd>
                              <Badge variant="outline">{stockData.volatility}</Badge>
                            </dd>
                          </div>
                          <div className="flex items-center justify-between">
                            <dt className="flex items-center text-sm text-muted-foreground">
                              <DollarSign className="mr-2 h-4 w-4" />
                              <span>Market Cap</span>
                            </dt>
                            <dd className="font-medium">
                              {stockData.marketCap ? formatCurrency(stockData.marketCap) : "N/A"}
                            </dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="chart">
                {loading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : stockData ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Price History</CardTitle>
                      <CardDescription>Historical price data for {stock.symbol} over the past month</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <StockChart symbol={stock.symbol} data={stockData.historicalData} />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No chart data available</p>
                  </div>
                )}
              </TabsContent>

              {/* Suppression du contenu de l'onglet de prédiction */}
              {/* <TabsContent value="prediction">
                {loading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : stockData ? (
                  <StockPrediction symbol={stock.symbol} currentPrice={stockData.price} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No prediction data available</p>
                  </div>
                )}
              </TabsContent> */}
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
