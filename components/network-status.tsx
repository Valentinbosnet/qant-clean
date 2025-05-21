"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { JSX } from "react"

// Type pour les états de connexion
type ConnectionState = "online" | "offline" | "unknown"

// Type pour les props du composant
interface NetworkStatusProps {
  showTooltip?: boolean
  showLabel?: boolean
  variant?: "icon" | "badge" | "full"
}

export function NetworkStatus({
  showTooltip = true,
  showLabel = false,
  variant = "icon",
}: NetworkStatusProps): JSX.Element | null {
  // États locaux
  const [connectionState, setConnectionState] = useState<ConnectionState>("unknown")
  const [mounted, setMounted] = useState<boolean>(false)

  // Gestionnaires d'événements optimisés avec useCallback
  const handleOnline = useCallback((): void => {
    setConnectionState("online")
  }, [])

  const handleOffline = useCallback((): void => {
    setConnectionState("offline")
  }, [])

  // Effet pour configurer les écouteurs d'événements réseau
  useEffect((): (() => void) => {
    // Marquer le composant comme monté
    setMounted(true)

    // Initialiser l'état en fonction de l'état actuel du réseau
    setConnectionState(typeof navigator !== "undefined" && navigator.onLine ? "online" : "offline")

    // Ajouter les écouteurs d'événements
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Nettoyer les écouteurs lors du démontage
    return (): void => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [handleOnline, handleOffline])

  // Mémoriser le contenu du tooltip pour éviter des recréations inutiles
  const tooltipContent = useMemo(
    () => <TooltipContent>{connectionState === "online" ? "Connecté au réseau" : "Hors ligne"}</TooltipContent>,
    [connectionState],
  )

  // Mémoriser l'icône pour éviter des recréations inutiles
  const statusIcon = useMemo(
    () =>
      connectionState === "online" ? (
        <Wifi className="h-4 w-4 text-green-500" />
      ) : (
        <WifiOff className="h-4 w-4 text-red-500" />
      ),
    [connectionState],
  )

  // Mémoriser le label pour éviter des recréations inutiles
  const statusLabel = useMemo(
    () => (
      <span className={connectionState === "online" ? "text-green-500" : "text-red-500"}>
        {connectionState === "online" ? "En ligne" : "Hors ligne"}
      </span>
    ),
    [connectionState],
  )

  // Si le composant n'est pas monté, ne rien afficher
  if (!mounted) {
    return null
  }

  // Déterminer le contenu à afficher en fonction du variant
  let content: JSX.Element

  switch (variant) {
    case "badge":
      content = (
        <div
          className={`px-2 py-1 rounded-full text-xs ${
            connectionState === "online" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {statusIcon}
          {showLabel && <span className="ml-1">{connectionState === "online" ? "En ligne" : "Hors ligne"}</span>}
        </div>
      )
      break
    case "full":
      content = (
        <div className="flex items-center gap-2">
          {statusIcon}
          {statusLabel}
        </div>
      )
      break
    default:
      content = (
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {statusIcon}
        </Button>
      )
  }

  // Rendu du statut réseau
  return showTooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        {tooltipContent}
      </Tooltip>
    </TooltipProvider>
  ) : (
    content
  )
}
