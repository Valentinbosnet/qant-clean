"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { WifiOff, CheckCircle, AlertCircle, HelpCircle } from "lucide-react"
import { isOfflineMode, getOfflineSettings } from "@/lib/prefetch-service"

export function OfflineReadinessIndicator() {
  const [status, setStatus] = useState<"ready" | "partial" | "not-ready" | "loading">("loading")
  const [details, setDetails] = useState<string>("")

  useEffect(() => {
    // Vérifier si le mode hors ligne est activé
    const offlineSettings = getOfflineSettings()
    const isOffline = isOfflineMode()

    if (!offlineSettings.enabled && !isOffline) {
      setStatus("not-ready")
      setDetails("Le mode hors ligne n'est pas activé")
      return
    }

    // Vérifier si le stockage est disponible
    if (!("localStorage" in window)) {
      setStatus("not-ready")
      setDetails("Le stockage local n'est pas disponible sur ce navigateur")
      return
    }

    // Vérifier si le service worker est supporté
    if (!("serviceWorker" in navigator)) {
      setStatus("partial")
      setDetails("Les service workers ne sont pas supportés - fonctionnalités limitées")
      return
    }

    // Vérifier si le service worker est enregistré
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length === 0) {
        setStatus("partial")
        setDetails("Service worker non enregistré - fonctionnalités limitées")
      } else {
        setStatus("ready")
        setDetails("L'application est prête à fonctionner hors ligne")
      }
    })
  }, [])

  const getIcon = () => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case "partial":
        return <AlertCircle className="h-3 w-3 text-amber-500" />
      case "not-ready":
        return <WifiOff className="h-3 w-3 text-red-500" />
      case "loading":
      default:
        return <HelpCircle className="h-3 w-3 text-gray-500" />
    }
  }

  const getColor = () => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800 border-green-300"
      case "partial":
        return "bg-amber-100 text-amber-800 border-amber-300"
      case "not-ready":
        return "bg-red-100 text-red-800 border-red-300"
      case "loading":
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`flex items-center gap-1 ${getColor()}`}>
            {getIcon()}
            <span>Hors ligne {status === "ready" ? "prêt" : status === "partial" ? "partiel" : "non prêt"}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{details}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
