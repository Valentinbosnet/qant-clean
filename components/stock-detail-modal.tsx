"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StockChart } from "@/components/stock-chart"
import { StockPrediction } from "@/components/stock-prediction"
import { useStockModal } from "@/hooks/use-stock-modal"
import { formatPrice } from "@/lib/utils"
import { getCompanyOverview } from "@/actions/stock-api"
import { Star, ExternalLink, Info, TrendingUp, History, BarChart3 } from "lucide-react"
import { useFavorites } from "@/hooks/use-favorites"

export function StockDetailModal() {
  const { isOpen, closeModal, stock } = useStockModal()
  const [companyInfo, setCompanyInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { favorites, addFavorite, removeFavorite, isLoading: favoritesLoading } = useFavorites()

  // Vérifier si l'action est dans les favoris
  const isFavorite = favorites.some((fav) => fav === stock?.symbol)

  // Charger les informations de l'entreprise lorsque le modal s'ouvre
  useEffect(() => {
    if (isOpen && stock) {
      loadCompanyInfo(stock.symbol)
    }
  }, [isOpen, stock])

  // Charger les informations de l'entreprise
  const loadCompanyInfo = async (symbol: string) => {
    setLoading(true)
    try {
      const info = await getCompanyOverview(symbol)
      setCompanyInfo(info)
    } catch (error) {
      console.error("Error loading company info:", error)
    } finally {
      setLoading(false)
    }
  }

  // Gérer l'ajout/suppression des favoris
  const handleFavoriteToggle = () => {
    if (!stock) return

    if (isFavorite) {
      removeFavorite(stock.symbol)
    } else {
      addFavorite(stock.symbol)
    }
  }

  if (!stock) return null

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <span>
                {stock.symbol} - {stock.name}
              </span>
              <Badge variant={stock.change >= 0 ? "success" : "destructive"} className="ml-2">
                {stock.change >= 0 ? "+" : ""}
                {stock.change.toFixed(2)} ({stock.percentChange.toFixed(2)}%)
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={handleFavoriteToggle} disabled={favoritesLoading}>
                <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                <span className="sr-only">{isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href={`https://finance.yahoo.com/quote/${stock.symbol}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Voir sur Yahoo Finance</span>
                </a>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-baseline justify-between mb-6">
            <div className="text-3xl font-bold">{formatPrice(stock.price)}</div>
            <div className={`text-lg font-semibold ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
              {stock.change >= 0 ? "+" : ""}
              {stock.change.toFixed(2)} ({stock.percentChange.toFixed(2)}%)
            </div>
          </div>

          <Tabs defaultValue="chart">
            <TabsList className="mb-4">
              <TabsTrigger value="chart" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Graphique
              </TabsTrigger>
              <TabsTrigger value="prediction" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Prédiction
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Informations
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center">
                <History className="h-4 w-4 mr-2" />
                Historique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="h-[400px]">
              <StockChart data={stock.history} intraday={stock.intraday} showIntraday={true} height={400} />
            </TabsContent>

            <TabsContent value="prediction">
              <StockPrediction stock={stock} days={30} />
            </TabsContent>

            <TabsContent value="info">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">À propos</h3>
                      <p className="text-sm text-muted-foreground">
                        {companyInfo?.Description ||
                          `${stock.name} (${stock.symbol}) est une entreprise cotée en bourse.`}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Secteur</h3>
                      <p className="text-sm">{companyInfo?.Sector || "Information non disponible"}</p>
                      <p className="text-xs text-muted-foreground mt-1">{companyInfo?.Industry || ""}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Chiffres clés</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Capitalisation</p>
                          <p className="text-sm font-medium">
                            {companyInfo?.MarketCapitalization
                              ? formatPrice(Number(companyInfo.MarketCapitalization))
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">P/E Ratio</p>
                          <p className="text-sm font-medium">{companyInfo?.PERatio || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Dividende</p>
                          <p className="text-sm font-medium">
                            {companyInfo?.DividendYield
                              ? `${(Number(companyInfo.DividendYield) * 100).toFixed(2)}%`
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">52 Semaines</p>
                          <p className="text-sm font-medium">
                            {companyInfo?.["52WeekLow"] && companyInfo?.["52WeekHigh"]
                              ? `${companyInfo["52WeekLow"]} - ${companyInfo["52WeekHigh"]}`
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Contact</h3>
                      <p className="text-sm">
                        {companyInfo?.Address
                          ? `${companyInfo.Address}, ${companyInfo.City}, ${companyInfo.Country}`
                          : "Information non disponible"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{companyInfo?.Website || ""}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Date</th>
                      <th className="text-right py-2 px-4">Prix</th>
                      <th className="text-right py-2 px-4">Variation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stock.history.slice(0, 60).map((point, index) => {
                      const prevPoint = stock.history[index + 1]
                      const change = prevPoint ? point.price - prevPoint.price : 0
                      const percentChange = prevPoint ? (change / prevPoint.price) * 100 : 0

                      return (
                        <tr key={point.date} className="border-b">
                          <td className="py-2 px-4">{point.date}</td>
                          <td className="text-right py-2 px-4">{formatPrice(point.price)}</td>
                          <td className={`text-right py-2 px-4 ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {change >= 0 ? "+" : ""}
                            {change.toFixed(2)} ({percentChange.toFixed(2)}%)
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
