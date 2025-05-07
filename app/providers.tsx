"use client"

import { StockModalProvider } from "@/hooks/use-stock-modal"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return <StockModalProvider>{children}</StockModalProvider>
}
