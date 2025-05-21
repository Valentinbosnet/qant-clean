"use client"

import { useState, useCallback } from "react"

// Type pour les données de stock
export interface StockData {
  symbol: string
  price: number
  change: number
  changePercent: number
  history?: Array<{ date: string; price: number }>
}

// Données de stock simulées
const mockStockData: Record<string, StockData> = {
  SPY: {
    symbol: "SPY",
    price: 478.25,
    change: 2.35,
    changePercent: 0.49,
  },
  QQQ: {
    symbol: "QQQ",
    price: 430.78,
    change: 3.45,
    changePercent: 0.81,
  },
  DIA: {
    symbol: "DIA",
    price: 385.12,
    change: -0.87,
    changePercent: -0.23,
  },
  IWM: {
    symbol: "IWM",
    price: 201.45,
    change: -1.23,
    changePercent: -0.61,
  },
  VTI: {
    symbol: "VTI",
    price: 245.67,
    change: 1.12,
    changePercent: 0.46,
  },
  VGK: {
    symbol: "VGK",
    price: 65.32,
    change: 0.45,
    changePercent: 0.69,
  },
  EWJ: {
    symbol: "EWJ",
    price: 72.18,
    change: -0.32,
    changePercent: -0.44,
  },
  EEM: {
    symbol: "EEM",
    price: 41.56,
    change: -0.78,
    changePercent: -1.84,
  },
}

// Fonction pour générer des données aléatoires pour un symbole non reconnu
function generateRandomStockData(symbol: string): StockData {
  const price = Math.random() * 1000 + 50
  const change = Math.random() * 10 - 5
  const changePercent = (change / price) * 100

  return {
    symbol,
    price,
    change,
    changePercent,
  }
}

export function useStockData() {
  const [loadingSymbols, setLoadingSymbols] = useState<string[]>([])
  const [errorSymbols, setErrorSymbols] = useState<string[]>([])

  // Fonction pour récupérer les données d'un stock
  const getStockData = useCallback(async (symbol: string): Promise<StockData> => {
    // Ne pas modifier l'état ici pour éviter la boucle infinie
    try {
      // Simuler un délai réseau
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Vérifier si nous avons des données mockées pour ce symbole
      if (mockStockData[symbol]) {
        return mockStockData[symbol]
      }

      // Sinon, générer des données aléatoires
      return generateRandomStockData(symbol)
    } catch (err) {
      console.error(`Erreur lors de la récupération des données pour ${symbol}:`, err)
      // Retourner des données par défaut en cas d'erreur
      return {
        symbol,
        price: 0,
        change: 0,
        changePercent: 0,
      }
    }
  }, [])

  // Fonction pour récupérer les données de plusieurs stocks
  const getMultipleStocks = useCallback(async (symbols: string[]): Promise<StockData[]> => {
    try {
      // Simuler un délai réseau
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Récupérer les données pour chaque symbole
      return symbols.map((symbol) => {
        if (mockStockData[symbol]) {
          return mockStockData[symbol]
        }
        return generateRandomStockData(symbol)
      })
    } catch (err) {
      console.error("Erreur lors de la récupération des données de stocks multiples:", err)
      // Retourner un tableau vide en cas d'erreur
      return []
    }
  }, [])

  return {
    getStockData,
    getMultipleStocks,
    isLoading: (symbol: string) => loadingSymbols.includes(symbol),
    hasError: (symbol: string) => errorSymbols.includes(symbol),
  }
}
