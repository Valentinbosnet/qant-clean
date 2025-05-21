"use client"

// Simplified auto-height component
interface AutoHeightWidgetProps {
  widgetId: string
  isEditMode: boolean
  onResize: (id: string, size: { h: number }) => void
  rowHeight: number
}

export function AutoHeightWidget({ widgetId, isEditMode, onResize, rowHeight }: AutoHeightWidgetProps) {
  if (!isEditMode) return null

  return (
    <button
      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-t-md"
      onClick={() => onResize(widgetId, { h: 4 })}
    >
      Auto
    </button>
  )
}
