"use client"

import { StockDebug } from "@/components/stock-debug"

export default function StockDebugPage() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Stock Debug</h1>
      <StockDebug />
    </div>
  )
}
