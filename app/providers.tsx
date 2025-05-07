"use client"

import { StockModalProvider } from "@/hooks/use-stock-modal"
import { AuthProvider } from "@/contexts/auth-context"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <StockModalProvider>{children}</StockModalProvider>
    </AuthProvider>
  )
}
