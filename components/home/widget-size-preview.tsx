"use client"

interface WidgetSizePreviewProps {
  isResizing: boolean
  widgetId: string | null
  currentSize: { w: number; h: number } | null
  gridColumns: number
}

export function WidgetSizePreview({ isResizing, widgetId, currentSize, gridColumns }: WidgetSizePreviewProps) {
  if (!isResizing || !widgetId || !currentSize) return null

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-md p-2 shadow-md z-50">
      Size: {currentSize.w} x {currentSize.h}
    </div>
  )
}
