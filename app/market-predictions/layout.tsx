import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Prédictions de Marché | Stock Dashboard",
  description: "Explorez les prédictions basées sur l'analyse technique et l'intelligence artificielle",
}

export default function MarketPredictionsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
