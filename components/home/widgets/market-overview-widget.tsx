"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useStockData } from "@/hooks/use-stock-data"
import type { HomeWidgetConfig } from "@/types/widget"

interface MarketOverviewWidgetProps {
  config?: HomeWidgetConfig
}

export function MarketOverviewWidget({ config }: MarketOverviewWidgetProps) {
  // Utiliser les indices configurés ou les indices par défaut
  const indices = config?.settings?.indices || ["SPY", "QQQ", "DIA", "IWM"]

  const [marketData, setMarketData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now())

  const { getStockData } = useStockData()

  // Mapping des symboles aux noms complets
  const indexNames: Record<string, string> = {
    SPY: "S&P 500",
    QQQ: "Nasdaq 100",
    DIA: "Dow Jones",
    IWM: "Russell 2000",
    VTI: "Total Market",
    VGK: "Europe",
    EWJ: "Japan",
    EEM: "Emerging Markets",
  }

  // Utiliser un useEffect avec une dépendance stable (lastUpdated)
  useEffect(() => {
    let isMounted = true

    async function loadMarketData() {
      if (!isMounted) return

      try {
        setIsLoading(true)

        // Récupérer les données pour chaque indice
        const dataPromises = indices.map((symbol) => getStockData(symbol))
        const data = await Promise.all(dataPromises)

        if (!isMounted) return

        // Formater les données pour l'affichage
        const formattedData = data.map((stockInfo, index) => {
          const symbol = indices[index]
          return {
            symbol,
            name: indexNames[symbol] || symbol,
            value: stockInfo?.price || 0,
            change: stockInfo?.change || 0,
            changePercent: stockInfo?.changePercent || 0,
          }
        })

        setMarketData(formattedData)
        setError(null)
      } catch (err) {
        if (!isMounted) return
        console.error("Erreur lors du chargement des données de marché:", err)
        setError("Impossible de charger les données de marché")
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadMarketData()

    // Nettoyage pour éviter les mises à jour sur un composant démonté
    return () => {
      isMounted = false
    }
  }, [indices, getStockData, lastUpdated])

  // Fonction pour rafraîchir manuellement les données
  const refreshData = () => {
    setLastUpdated(Date.now())
  }

  // Afficher un état de chargement
  if (isLoading) {
    return (
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Aperçu du marché</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-2 sm:p-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <div className="text-right">
                      <Skeleton className="h-5 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    )
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Aperçu du marché</h3>
        <Card className="overflow-hidden">
          <CardContent className="p-4 text-center">
            <p className="text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={refreshData}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4">
      <div className="flex justify-between items-center mb-2 sm:mb-3">
        <h3 className="text-base sm:text-lg font-medium">Aperçu du marché</h3>
        <Button variant="ghost" size="sm" onClick={refreshData} className="h-8 px-2">
          Actualiser
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
        {marketData.map((index) => (
          <Card key={index.symbol} className="overflow-hidden">
            <CardContent className="p-2 sm:p-3">
              <div className="flex justify-between items-center">
                <div className="font-medium text-sm sm:text-base">{index.name}</div>
                <div className="text-right">
                  <div className="font-medium text-sm sm:text-base">
                    {index.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div
                    className={`text-xs flex items-center justify-end ${index.change >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {index.change >= 0 ? (
                      <ArrowUpIcon className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 mr-1" />
                    )}
                    {index.change >= 0 ? "+" : ""}
                    {typeof index.change === "number" ? index.change.toFixed(2) : index.change} (
                    {typeof index.changePercent === "number" ? index.changePercent.toFixed(2) : index.changePercent}%)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Pour compatibilité avec l'importation dynamique
export default MarketOverviewWidget
