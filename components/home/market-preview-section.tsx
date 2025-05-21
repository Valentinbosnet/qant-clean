"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, LineChart } from "lucide-react"
import { motion } from "framer-motion"

// Données fictives pour la démo
const marketData = {
  indices: [
    { symbol: "SPY", name: "S&P 500 ETF", price: 478.23, change: 1.25, changePercent: 0.26 },
    { symbol: "QQQ", name: "Nasdaq 100 ETF", price: 430.15, change: 2.34, changePercent: 0.55 },
    { symbol: "DIA", name: "Dow Jones ETF", price: 385.67, change: -0.45, changePercent: -0.12 },
    { symbol: "IWM", name: "Russell 2000 ETF", price: 201.89, change: 0.78, changePercent: 0.39 },
  ],
  trending: [
    { symbol: "AAPL", name: "Apple Inc.", price: 187.45, change: 3.21, changePercent: 1.74 },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 402.78, change: 5.67, changePercent: 1.43 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.56, change: 1.23, changePercent: 0.87 },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: 178.23, change: -2.45, changePercent: -1.36 },
    { symbol: "TSLA", name: "Tesla Inc.", price: 245.67, change: 12.34, changePercent: 5.29 },
    { symbol: "META", name: "Meta Platforms", price: 472.89, change: 8.76, changePercent: 1.89 },
  ],
  sectors: [
    { name: "Technologie", performance: 1.45 },
    { name: "Santé", performance: 0.87 },
    { name: "Finance", performance: -0.32 },
    { name: "Énergie", performance: 2.14 },
    { name: "Consommation", performance: 0.56 },
    { name: "Industrie", performance: -0.78 },
  ],
}

export function MarketPreviewSection() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Mise à jour toutes les minutes

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="py-12 sm:py-16 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl mb-3 sm:mb-4">Aperçu du marché</h2>
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Consultez les dernières tendances du marché et les performances des actions populaires.
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3 sm:mt-4">
            Dernière mise à jour: {currentTime.toLocaleTimeString()} · Données simulées à des fins de démonstration
          </p>
        </div>

        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 sm:mb-8 text-xs sm:text-sm">
            <TabsTrigger value="trending">Actions tendance</TabsTrigger>
            <TabsTrigger value="indices">Indices majeurs</TabsTrigger>
            <TabsTrigger value="sectors">Secteurs</TabsTrigger>
          </TabsList>

          <TabsContent value="trending">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {marketData.trending.map((stock, index) => (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <StockCard stock={stock} />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="indices">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {marketData.indices.map((index, i) => (
                <motion.div
                  key={index.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <StockCard stock={index} />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sectors">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {marketData.sectors.map((sector, index) => (
                <motion.div
                  key={sector.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{sector.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        {sector.performance > 0 ? (
                          <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span
                          className={`text-lg font-semibold ${
                            sector.performance > 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {sector.performance > 0 ? "+" : ""}
                          {sector.performance.toFixed(2)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StockCard({ stock }: { stock: any }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-1 sm:pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{stock.symbol}</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stock.name}</p>
          </div>
          <div className="flex items-center">
            {stock.changePercent > 0 ? (
              <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500 mr-1" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-3">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">${stock.price.toFixed(2)}</span>
          <div>
            <span className={`text-sm font-medium ${stock.changePercent > 0 ? "text-green-500" : "text-red-500"}`}>
              {stock.changePercent > 0 ? "+" : ""}
              {stock.change.toFixed(2)} ({stock.changePercent > 0 ? "+" : ""}
              {stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="mt-4 h-16 flex items-center justify-center">
          <LineChart className="h-full w-full text-gray-300 dark:text-gray-700" />
        </div>
      </CardContent>
    </Card>
  )
}
