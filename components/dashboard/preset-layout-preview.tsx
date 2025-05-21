"use client"

import { useEffect, useState } from "react"
import type { PresetLayout } from "@/lib/preset-layouts-service"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Calendar, BarChart2, LineChart, PieChart, Activity, Eye } from "lucide-react"

import "@/styles/preset-preview.css"

interface PresetLayoutPreviewProps {
  preset: PresetLayout
  isInteractive?: boolean
}

export function PresetLayoutPreview({ preset, isInteractive = false }: PresetLayoutPreviewProps) {
  const [isClient, setIsClient] = useState(false)

  // Vérifier si nous sommes côté client
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <Skeleton className="w-full h-[200px] rounded-md" />
  }

  // Fonction pour obtenir l'icône en fonction du type de widget
  const getWidgetIcon = (type: string) => {
    switch (type) {
      case "market":
        return <LineChart className="h-4 w-4" />
      case "favorites":
        return <Activity className="h-4 w-4" />
      case "prediction":
        return <BarChart2 className="h-4 w-4" />
      case "news":
        return <Calendar className="h-4 w-4" />
      case "performance":
        return <PieChart className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  // Calculer la taille de la grille
  const gridSize = 12
  const maxHeight = Math.max(...preset.widgets.map((w) => w.position.y + w.position.h))

  return (
    <div className="preset-preview-container">
      <div
        className="preset-preview-grid"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${maxHeight}, 20px)`,
        }}
      >
        {preset.widgets.map((widget) => (
          <div
            key={widget.id}
            className={`preset-preview-widget ${isInteractive ? "hover:ring-2 hover:ring-primary/50 cursor-pointer transition-all" : ""}`}
            style={{
              gridColumnStart: widget.position.x + 1,
              gridColumnEnd: widget.position.x + widget.position.w + 1,
              gridRowStart: widget.position.y + 1,
              gridRowEnd: widget.position.y + widget.position.h + 1,
            }}
          >
            <div className="preset-preview-widget-header">
              <div className="preset-preview-widget-title">
                {getWidgetIcon(widget.type)}
                <span className="truncate">{widget.title}</span>
              </div>
              <Badge variant="outline" className="preset-preview-widget-badge">
                {widget.type}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
