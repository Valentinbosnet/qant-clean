"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, AlertTriangle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { StockPrediction } from "@/components/stock-prediction"
import { getStockData, popularStocks } from "@/lib/stock-service"
import type { StockData } from "@/lib/stock-service"
import { formatPrice } from "@/lib/utils"

export default function PredictionsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL")
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [predictionDays, setPredictionDays] = useState(30)

  // Charger les données de l'action sélectionnée
  useEffect(() => {
    loadStockData()
  }, [selectedSymbol])

  const loadStockData = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getStockData(selectedSymbol)
      setStockData(data)
    } catch (err: any) {
      console.error("Erreur lors du chargement des données:", err)
      setError(err.message || "Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Prédictions de marché</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Analysez les tendances futures des actions grâce à nos algorithmes de prédiction basés sur l'analyse des
          données historiques.
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Information importante</AlertTitle>
        <AlertDescription>
          Les prédictions sont générées à partir de modèles statistiques simples et ne constituent pas des conseils
          d'investissement. Les performances passées ne préjugent pas des performances futures.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Paramètres de prédiction</CardTitle>
          <CardDescription>Sélectionnez une action et configurez les paramètres de prédiction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Action</label>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une action" />
                </SelectTrigger>
                <SelectContent>
                  {popularStocks.map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Horizon de prédiction</label>
              <Select
                value={predictionDays.toString()}
                onValueChange={(value) => setPredictionDays(Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nombre de jours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 jours</SelectItem>
                  <SelectItem value="14">14 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="60">60 jours</SelectItem>
                  <SelectItem value="90">90 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={loadStockData} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Chargement...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Actualiser
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : loading ? (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-[400px] w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : stockData ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{stockData.name}</CardTitle>
                  <CardDescription>{stockData.symbol}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatPrice(stockData.price)}</div>
                  <div className={`${stockData.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {stockData.change >= 0 ? "+" : ""}
                    {stockData.change.toFixed(2)} ({stockData.percentChange.toFixed(2)}%)
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="ensemble">
            <TabsList className="mb-4">
              <TabsTrigger value="sma">SMA</TabsTrigger>
              <TabsTrigger value="ema">EMA</TabsTrigger>
              <TabsTrigger value="linear">Linéaire</TabsTrigger>
              <TabsTrigger value="polynomial">Polynomial</TabsTrigger>
              <TabsTrigger value="ensemble">Ensemble</TabsTrigger>
            </TabsList>

            <TabsContent value="sma">
              <StockPrediction stock={stockData} days={predictionDays} />
            </TabsContent>
            <TabsContent value="ema">
              <StockPrediction stock={stockData} days={predictionDays} />
            </TabsContent>
            <TabsContent value="linear">
              <StockPrediction stock={stockData} days={predictionDays} />
            </TabsContent>
            <TabsContent value="polynomial">
              <StockPrediction stock={stockData} days={predictionDays} />
            </TabsContent>
            <TabsContent value="ensemble">
              <StockPrediction stock={stockData} days={predictionDays} />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Sélectionnez une action pour voir les prédictions</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
