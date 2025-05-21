"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, X } from "lucide-react"

interface HomeWidgetProps {
  widget: any
  editMode: boolean
  showBorder: boolean
  onRemove: () => void
  onUpdate: (updates: any) => void
}

export function HomeWidget({ widget, editMode, showBorder, onRemove, onUpdate }: HomeWidgetProps) {
  // Safely extract widget properties
  const widgetType = typeof widget.type === "string" ? widget.type : "unknown"
  const widgetTitle = typeof widget.title === "string" ? widget.title : ""

  // Simple placeholder content
  const renderWidgetContent = () => {
    return (
      <div className="flex items-center justify-center h-full p-4 text-center">
        <p>
          {widgetTitle || "Widget"} ({widgetType})
        </p>
      </div>
    )
  }

  return (
    <Card className="h-full overflow-hidden">
      {editMode && (
        <CardHeader className="px-3 py-1 flex flex-row items-center justify-between bg-muted/20">
          <CardTitle className="text-base font-medium">{widgetTitle || "Widget"}</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onUpdate({})}>
              <Settings className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0 overflow-auto">{renderWidgetContent()}</CardContent>
    </Card>
  )
}
