"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, AlertTriangle, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import type { JSX } from "react"

interface VolatilityInfoProps {
  symbol: string
  volatility: number
  className?: string
}

export function VolatilityInfo({ symbol, volatility, className }: VolatilityInfoProps) {
  // Déterminer le niveau de volatilité
  let level: "low" | "medium" | "high"
  let description: string
  let icon: JSX.Element

  if (volatility < 10) {
    level = "low"
    description = "Faible volatilité. Cette action tend à avoir des mouvements de prix relativement stables."
    icon = <Shield className="h-5 w-5 text-green-500" />
  } else if (volatility < 20) {
    level = "medium"
    description = "Volatilité moyenne. Cette action peut connaître des fluctuations modérées de prix."
    icon = <BarChart2 className="h-5 w-5 text-amber-500" />
  } else {
    level = "high"
    description = "Forte volatilité. Cette action peut connaître des mouvements de prix importants et rapides."
    icon = <AlertTriangle className="h-5 w-5 text-red-500" />
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          {icon}
          <span className="ml-2">Volatilité de {symbol}</span>
        </CardTitle>
        <CardDescription>Mesure de la variation des prix</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-2">
          <div className="text-2xl font-bold">{volatility.toFixed(1)}%</div>
          <span className="ml-2 text-sm px-2 py-0.5 rounded-full bg-muted">
            {level === "low" ? "Faible" : level === "medium" ? "Moyenne" : "Élevée"}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className={cn(
              "h-2.5 rounded-full",
              level === "low" ? "bg-green-500" : level === "medium" ? "bg-amber-500" : "bg-red-500",
            )}
            style={{ width: `${Math.min(volatility * 3, 100)}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Faible</span>
          <span>Moyenne</span>
          <span>Élevée</span>
        </div>
      </CardContent>
    </Card>
  )
}
