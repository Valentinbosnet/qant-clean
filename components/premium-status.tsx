"use client"

import { Badge } from "@/components/ui/badge"
import { CrownIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function PremiumStatus() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 px-2">
            <CrownIcon className="h-3 w-3" />
            <span>Premium</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Alpha Vantage Premium Plan ($50/month)</p>
          <p className="text-xs text-muted-foreground mt-1">Jusqu'à 150 requêtes par minute, 5000 par jour</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
