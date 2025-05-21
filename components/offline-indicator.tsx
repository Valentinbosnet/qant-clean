"use client"

import { useState, useEffect } from "react"
import { WifiOff, Wifi, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { isOfflineMode, syncOfflineData } from "@/lib/offline-mode"

interface OfflineIndicatorProps {
  variant?: "badge" | "icon" | "full"
  showSync?: boolean
}

export function OfflineIndicator({ variant = "badge", showSync = true }: OfflineIndicatorProps) {
  const [offline, setOffline] = useState(isOfflineMode())
  const [isSyncing, setIsSyncing] = useState(false)
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)

  // Mettre à jour l'état de connexion
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Vérifier régulièrement le mode hors ligne
    const interval = setInterval(() => {
      setOffline(isOfflineMode())
    }, 1000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [])

  // Synchroniser les données
  const handleSync = async () => {
    if (!isOnline) return

    setIsSyncing(true)
    try {
      await syncOfflineData()
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  // Si nous sommes en ligne et pas en mode hors ligne, ne rien afficher
  if (isOnline && !offline) {
    return null
  }

  // Afficher l'indicateur selon le variant
  switch (variant) {
    case "icon":
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {offline ? <WifiOff className="h-4 w-4 text-red-500" /> : <Wifi className="h-4 w-4 text-green-500" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{offline ? "Mode hors ligne activé" : "Connexion internet disponible"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

    case "full":
      return (
        <div className="flex items-center gap-2">
          {offline ? <WifiOff className="h-4 w-4 text-red-500" /> : <Wifi className="h-4 w-4 text-green-500" />}
          <span className={offline ? "text-red-500" : "text-green-500"}>
            {offline ? "Mode hors ligne" : "Connexion rétablie"}
          </span>
          {showSync && isOnline && (
            <Button variant="ghost" size="sm" onClick={handleSync} disabled={isSyncing} className="h-7 px-2">
              {isSyncing ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <span className="text-xs">Synchroniser</span>
              )}
            </Button>
          )}
        </div>
      )

    default: // badge
      return (
        <Badge variant={offline ? "destructive" : "outline"} className="flex items-center gap-1">
          {offline ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
          <span>{offline ? "Hors ligne" : "En ligne"}</span>
        </Badge>
      )
  }
}
