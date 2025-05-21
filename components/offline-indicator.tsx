"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { isOfflineMode } from "@/lib/prefetch-service"

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Vérifier l'état initial
    setIsOffline(!navigator.onLine || isOfflineMode())

    // Configurer les écouteurs d'événements
    const handleOnline = () => setIsOffline(isOfflineMode())
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!isOffline) {
    return null
  }

  return (
    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center gap-1">
      <WifiOff className="h-3 w-3" />
      <span>Hors ligne</span>
    </Badge>
  )
}
