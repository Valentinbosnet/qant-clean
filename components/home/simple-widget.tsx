"use client"

import { Card, CardContent } from "@/components/ui/card"
import { HomeWidget } from "./home-widget"

interface SimpleWidgetProps {
  widget: any
  editMode: boolean
  onRemove?: () => void
  isResizing?: boolean
}

export function SimpleWidget({ widget, editMode, onRemove, isResizing }: SimpleWidgetProps) {
  // Simplified component with no animations or complex state
  const handleUpdateWidget = (updates: any) => {
    console.log("Widget updated:", updates)
  }

  return (
    <div className="w-full h-full">
      <Card className="h-full border">
        <CardContent className="p-0 h-full">
          <HomeWidget
            widget={widget}
            editMode={editMode}
            showBorder={false}
            onRemove={onRemove || (() => {})}
            onUpdate={handleUpdateWidget}
          />
        </CardContent>
      </Card>
    </div>
  )
}
