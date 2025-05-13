"use client"

import { useState, useEffect } from "react"
import { type StockData, getMultipleStocks } from "@/lib/stock-service"
import { getSectorInfo } from "@/lib/sector-classification"
import { useFavorites } from "@/hooks/use-favorites"
import type { FilterCriteria, SortOption } from "@/components/stock-filter-panel"

// Type pour les prédictions simulées
interface StockPrediction {
  trend: "up" | "down"
  percentChange: number
  volatility: number
}

// Type étendu pour inclure les prédictions
interface StockWithPrediction extends StockData {
  prediction: StockPrediction
}

export function useFilteredStocks(symbols: string[], criteria: FilterCriteria) {
  const [stocks, setStocks] = useState<StockWithPrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { favorites } = useFavorites()

  useEffect(() => {
    async function loadStocks() {
      if (!symbols || symbols.length === 0) return

      setIsLoading(true)
      setError(null)

      try {
        const allStocks = await getMultipleStocks(symbols)

        // Ajouter des prédictions simulées aux stocks
        const stocksWithPredictions: StockWithPrediction[] = allStocks.map((stock) => {
          // Simuler des prédictions pour le filtrage et le tri
          // Dans une implémentation réelle, ces données viendraient de l'API
          const percentChange = Math.random() * 20 - 5 // -5% à +15%
          return {
            ...stock,
            prediction: {
              trend: percentChange >= 0 ? "up" : "down",
              percentChange,
              volatility: Math.random() * 30, // 0% à 30%
            },
          }
        })

        // Filtrer les stocks selon les critères
        const filtered = stocksWithPredictions.filter((stock) => {
          // Filtre par favoris
          if (criteria.onlyFavorites && !favorites.includes(stock.symbol)) {
            return false
          }

          // Filtre par secteur
          if (criteria.sector !== "all") {
            const sectorInfo = getSectorInfo(stock.symbol)
            if (sectorInfo.sector !== criteria.sector) {
              return false
            }
          }

          // Filtre par tendance
          if (criteria.trend !== "all") {
            if (stock.prediction.trend !== criteria.trend) {
              return false
            }
          }

          // Filtre par pourcentage de changement
          const absChange = Math.abs(stock.prediction.percentChange)
          if (absChange < criteria.minChangePercent || absChange > criteria.maxChangePercent) {
            return false
          }

          return true
        })

        // Trier les stocks selon le critère sélectionné
        const sorted = sortStocks(filtered, criteria.sortBy)

        setStocks(sorted)
      } catch (err) {
        console.error("Erreur lors du chargement des stocks:", err)
        setError(err instanceof Error ? err : new Error("Erreur inconnue"))
      } finally {
        setIsLoading(false)
      }
    }

    loadStocks()
  }, [symbols, criteria, favorites])

  return { stocks, isLoading, error }
}

// Fonction pour trier les stocks selon différents critères
function sortStocks(stocks: StockWithPrediction[], sortOption: SortOption): StockWithPrediction[] {
  return [...stocks].sort((a, b) => {
    switch (sortOption) {
      case "performance_desc":
        return b.prediction.percentChange - a.prediction.percentChange
      case "performance_asc":
        return a.prediction.percentChange - b.prediction.percentChange
      case "volatility_desc":
        return b.prediction.volatility - a.prediction.volatility
      case "volatility_asc":
        return a.prediction.volatility - b.prediction.volatility
      case "alphabetical_asc":
        return a.symbol.localeCompare(b.symbol)
      case "alphabetical_desc":
        return b.symbol.localeCompare(a.symbol)
      case "price_asc":
        return a.price - b.price
      case "price_desc":
        return b.price - a.price
      default:
        return b.prediction.percentChange - a.prediction.percentChange
    }
  })
}
