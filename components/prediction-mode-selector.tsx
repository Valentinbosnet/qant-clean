"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedStockPrediction } from "@/components/enhanced-stock-prediction"
import { LightweightStockPrediction } from "@/components/lightweight-stock-prediction"
import type { StockData } from "@/lib/stock-service"
import { Sparkles, Zap } from "lucide-react"

interface PredictionModeSelectorProps {
  stock: StockData
  days?: number
}

export function PredictionModeSelector({ stock, days = 30 }: PredictionModeSelectorProps) {
  const [mode, setMode] = useState<"enhanced" | "lightweight">("lightweight")

  return (
    <div>
      <div className="mb-4">
        <Tabs defaultValue="lightweight" onValueChange={(value) => setMode(value as "enhanced" | "lightweight")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lightweight" className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              Ultra-Légère
            </TabsTrigger>
            <TabsTrigger value="enhanced" className="flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              IA+ Complète
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {mode === "lightweight" ? (
        <LightweightStockPrediction stock={stock} days={days} />
      ) : (
        <EnhancedStockPrediction stock={stock} days={days} />
      )}
    </div>
  )
}
