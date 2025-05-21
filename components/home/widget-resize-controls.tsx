"use client"
// import "@/styles/resize-controls.css"

interface WidgetResizeControlsProps {
  widgetId: string
  onResize: (widgetId: string, preset: "small" | "medium" | "large" | "full") => void
}

export function WidgetResizeControls({ widgetId, onResize }: WidgetResizeControlsProps) {
  return (
    <div className="absolute top-0 right-0 p-1 bg-background/80 rounded-bl-md z-10">
      <button onClick={() => onResize(widgetId, "small")} className="text-xs px-1">
        S
      </button>
      <button onClick={() => onResize(widgetId, "medium")} className="text-xs px-1">
        M
      </button>
      <button onClick={() => onResize(widgetId, "large")} className="text-xs px-1">
        L
      </button>
    </div>
  )
}
