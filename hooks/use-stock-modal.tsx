"use client"

import type { StockData } from "@/lib/stock-service"
import { createContext, useContext, useState, type ReactNode } from "react"

interface StockModalContextProps {
  isOpen: boolean
  stock: StockData | null
  openModal: (stock: StockData) => void
  closeModal: () => void
}

const StockModalContext = createContext<StockModalContextProps | undefined>(undefined)

export function StockModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [stock, setStock] = useState<StockData | null>(null)

  const openModal = (stockData: StockData) => {
    setStock(stockData)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  return (
    <StockModalContext.Provider value={{ isOpen, stock, openModal, closeModal }}>{children}</StockModalContext.Provider>
  )
}

export function useStockModal() {
  const context = useContext(StockModalContext)
  if (context === undefined) {
    throw new Error("useStockModal must be used within a StockModalProvider")
  }
  return context
}
