"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface WidgetKeyboardResizeProps {
  isEditMode: boolean
  activeWidgetId: string | null
  onResize: (widgetId: string, changes: { w?: number; h?: number }) => void
  gridItems: any[]
}

export function WidgetKeyboardResize({ isEditMode, activeWidgetId, onResize, gridItems }: WidgetKeyboardResizeProps) {
  const { toast } = useToast()

  useEffect(() => {
    if (!isEditMode || !activeWidgetId) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Trouver le widget actif dans les éléments de la grille
      const activeWidget = gridItems.find((item) => item.i === activeWidgetId)
      if (!activeWidget) return

      // Définir les touches et leurs actions
      const keyActions: Record<string, () => void> = {
        ArrowRight: () => {
          if (activeWidget.w < (activeWidget.maxW || 12)) {
            onResize(activeWidgetId, { w: activeWidget.w + 1 })
          }
        },
        ArrowLeft: () => {
          if (activeWidget.w > (activeWidget.minW || 1)) {
            onResize(activeWidgetId, { w: activeWidget.w - 1 })
          }
        },
        ArrowDown: () => {
          if (activeWidget.h < (activeWidget.maxH || 12)) {
            onResize(activeWidgetId, { h: activeWidget.h + 1 })
          }
        },
        ArrowUp: () => {
          if (activeWidget.h > (activeWidget.minH || 1)) {
            onResize(activeWidgetId, { h: activeWidget.h - 1 })
          }
        },
      }

      // Si la touche pressée est dans notre liste d'actions
      if (e.key in keyActions && (e.altKey || e.metaKey)) {
        e.preventDefault() // Empêcher le comportement par défaut du navigateur
        keyActions[e.key]() // Exécuter l'action associée

        // Afficher un toast avec l'action réalisée
        const action = e.key.replace("Arrow", "")
        toast({
          title: `Widget redimensionné`,
          description: `Direction: ${action}`,
        })
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    // Afficher une notification d'aide si nous sommes en mode édition
    toast({
      title: "Raccourcis clavier activés",
      description: "Utilisez Alt/Cmd + flèches pour redimensionner",
    })

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isEditMode, activeWidgetId, gridItems, onResize, toast])

  // Ce composant ne rend rien visuellement
  return isEditMode && activeWidgetId ? <div className="sr-only">Keyboard resize controls active</div> : null
}
