"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WidgetConfig } from "@/lib/dashboard-service"
import { X, Settings, Grip, ArrowRightIcon as ArrowsMaximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PredictionWidget } from "./widgets/prediction-widget"
import { FavoritesWidget } from "./widgets/favorites-widget"
import { MarketOverviewWidget } from "./widgets/market-overview-widget"
import { AlertsWidget } from "./widgets/alerts-widget"
import { NotesWidget } from "./widgets/notes-widget"
import { SectorWidget } from "./widgets/sector-widget"
import { NewsWidget } from "./widgets/news-widget"
import { WidgetSettingsForm } from "./widget-settings-form"

interface WidgetProps {
  widget: WidgetConfig
  editMode: boolean
  onRemove: () => void
  onUpdate: (updates: Partial<WidgetConfig>) => void
}

export function Widget({ widget, editMode, onRemove, onUpdate }: WidgetProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  // Fonction pour rendre le bon composant de widget selon le type
  const renderWidgetContent = () => {
    switch (widget.type) {
      case "prediction":
        return <PredictionWidget config={widget} />
      case "favorites":
        return <FavoritesWidget config={widget} />
      case "market":
        return <MarketOverviewWidget config={widget} />
      case "alerts":
        return <AlertsWidget config={widget} />
      case "notes":
        return <NotesWidget config={widget} />
      case "sector":
        return <SectorWidget config={widget} />
      case "news":
        return <NewsWidget config={widget} />
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Type de widget inconnu</p>
          </div>
        )
    }
  }

  const handleUpdateSettings = (newSettings: any) => {
    onUpdate({ settings: { ...widget.settings, ...newSettings } })
    setShowSettings(false)
  }

  return (
    <>
      <Card className="h-full overflow-hidden">
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
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsExpanded(true)}>
              <ArrowsMaximize className="h-3.5 w-3.5" />
            </Button>

            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowSettings(true)}>
              <Settings className="h-3.5 w-3.5" />
            </Button>

            {editMode && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                onClick={onRemove}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paramètres du widget "{widget.title}"</DialogTitle>
          </DialogHeader>
          <WidgetSettingsForm widget={widget} onSubmit={handleUpdateSettings} />
        </DialogContent>
      </Dialog>

      {/* Mode plein écran pour le widget */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded} className="max-w-5xl">
        <DialogContent className="max-w-5xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>{widget.title}</DialogTitle>
          </DialogHeader>
          <div className="h-[70vh] overflow-auto">{renderWidgetContent()}</div>
        </DialogContent>
      </Dialog>
    </>
  )
}
