"use client"

import { useState, Suspense, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WidgetConfig } from "@/lib/dashboard-service"
import { X, Settings, Grip, ArrowRightIcon as ArrowsMaximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getWidgetComponent } from "./widget-registry"
import { WidgetSettingsForm } from "./widget-settings-form"
import "@/styles/widget-animations.css"

// Widget skeleton loader component
function WidgetSkeleton() {
  return (
    <div className="w-full h-full min-h-[100px] animate-pulse">
      <div className="h-4 w-1/3 bg-muted rounded mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-muted rounded"></div>
        <div className="h-3 bg-muted rounded w-5/6"></div>
        <div className="h-3 bg-muted rounded w-4/6"></div>
      </div>
    </div>
  )
}

interface WidgetProps {
  widget: WidgetConfig
  editMode: boolean
  onRemove: () => void
  onUpdate: (updates: Partial<WidgetConfig>) => void
}

export function Widget({ widget, editMode, onRemove, onUpdate }: WidgetProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  // Animation d'entrée
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  // Fonction pour rendre le bon composant de widget selon le type
  const renderWidgetContent = () => {
    const WidgetComponent = getWidgetComponent(widget.type)

    if (!WidgetComponent) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Type de widget inconnu</p>
        </div>
      )
    }

    return (
      <Suspense fallback={<WidgetSkeleton />}>
        <div className="widget-content-enter widget-content-enter-active">
          <WidgetComponent config={widget} />
        </div>
      </Suspense>
    )
  }

  const handleUpdateSettings = (newSettings: any) => {
    onUpdate({ settings: { ...widget.settings, ...newSettings } })
    setShowSettings(false)
  }

  const handleRemove = () => {
    setIsRemoving(true)
    // Attendre la fin de l'animation avant d'appeler onRemove
    setTimeout(() => {
      onRemove()
    }, 300)
  }

  return (
    <>
      <Card
        className={`h-full overflow-hidden transition-all duration-300 ${isRemoving ? "opacity-0 scale-95" : isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        <CardHeader className="px-4 py-2 flex flex-row items-center justify-between bg-muted/20">
          <div className="flex items-center space-x-2">
            {editMode && (
              <span className="cursor-move drag-handle">
                <Grip className="h-4 w-4 text-muted-foreground" />
              </span>
            )}
            <CardTitle className="text-base font-medium">{widget.title}</CardTitle>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 transition-transform hover:scale-110"
              onClick={() => setIsExpanded(true)}
            >
              <ArrowsMaximize className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 transition-transform hover:scale-110"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>

            {editMode && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={handleRemove}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-3 overflow-auto">{renderWidgetContent()}</CardContent>
      </Card>

      {/* Dialogue des paramètres du widget */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="fade-in">
          <DialogHeader>
            <DialogTitle>Paramètres du widget "{widget.title}"</DialogTitle>
          </DialogHeader>
          <WidgetSettingsForm widget={widget} onSubmit={handleUpdateSettings} />
        </DialogContent>
      </Dialog>

      {/* Mode plein écran pour le widget */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded} className="max-w-5xl">
        <DialogContent className="max-w-5xl w-[90vw] fade-in">
          <DialogHeader>
            <DialogTitle>{widget.title}</DialogTitle>
          </DialogHeader>
          <div className="h-[70vh] overflow-auto">{renderWidgetContent()}</div>
        </DialogContent>
      </Dialog>
    </>
  )
}
