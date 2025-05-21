"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Cloud, CloudOff } from "lucide-react"
import { isOfflineMode, toggleOfflineMode } from "@/lib/offline-mode"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error

// Type pour les props du composant
interface OfflineModeToggleProps {
  showIcon?: boolean
  showLabel?: boolean
  variant?: "default" | "compact" | "full"
  onToggle?: (enabled: boolean) => void
}

export function OfflineModeToggle({
  showIcon = true,
  showLabel = true,
  variant = "default",
  onToggle,
}: OfflineModeToggleProps): JSX.Element | null {
  // États locaux
  const [mounted, setMounted] = useState<boolean>(false)
  const [offlineEnabled, setOfflineEnabled] = useState<boolean>(false)
  const [isChanging, setIsChanging] = useState<boolean>(false)

  // Effet pour initialiser l'état
  useEffect((): void => {
    setMounted(true)
    setOfflineEnabled(isOfflineMode())
  }, [])

  // Gestionnaire de changement optimisé avec useCallback
  const handleToggleChange = useCallback(
    async (checked: boolean): Promise<void> => {
      try {
        setIsChanging(true)

        // Appeler la fonction de toggle
        await toggleOfflineMode(checked)

        // Mettre à jour l'état local
        setOfflineEnabled(checked)

        // Appeler le callback si fourni
        if (onToggle) {
          onToggle(checked)
        }

        // Recharger la page pour appliquer les changements
        window.location.reload()
      } catch (error) {
        console.error("Erreur lors du changement de mode:", error)
        setIsChanging(false)
      }
    },
    [onToggle],
  )

  // Mémoriser l'icône pour éviter des recréations inutiles
  const modeIcon = useMemo(
    () =>
      offlineEnabled ? (
        <CloudOff className="h-4 w-4 mr-2 text-amber-500" />
      ) : (
        <Cloud className="h-4 w-4 mr-2 text-blue-500" />
      ),
    [offlineEnabled],
  )

  // Mémoriser le texte du label pour éviter des recalculs inutiles
  const labelText = useMemo(
    () => (offlineEnabled ? "Mode hors ligne activé" : "Mode hors ligne désactivé"),
    [offlineEnabled],
  )

  // Si le composant n'est pas monté, ne rien afficher
  if (!mounted) {
    return null
  }

  // Déterminer le contenu à afficher en fonction du variant
  let content: JSX.Element

  switch (variant) {
    case "compact":
      content = (
        <div className="flex items-center space-x-1">
          {showIcon && modeIcon}
          <Switch
            id="offline-mode-compact"
            checked={offlineEnabled}
            onCheckedChange={handleToggleChange}
            disabled={isChanging}
          />
        </div>
      )
      break
    case "full":
      content = (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            {showIcon && modeIcon}
            <Label htmlFor="offline-mode-full" className="text-sm font-medium">
              Mode hors ligne
            </Label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {offlineEnabled
                ? "L'application fonctionne sans connexion internet"
                : "L'application nécessite une connexion internet"}
            </span>
            <Switch
              id="offline-mode-full"
              checked={offlineEnabled}
              onCheckedChange={handleToggleChange}
              disabled={isChanging}
            />
          </div>
        </div>
      )
      break
    default:
      content = (
        <div className="flex items-center space-x-2">
          {showIcon && modeIcon}
          {showLabel && (
            <Label htmlFor="offline-mode-default" className="text-sm cursor-pointer">
              {labelText}
            </Label>
          )}
          <Switch
            id="offline-mode-default"
            checked={offlineEnabled}
            onCheckedChange={handleToggleChange}
            disabled={isChanging}
          />
        </div>
      )
  }

  return content
}
