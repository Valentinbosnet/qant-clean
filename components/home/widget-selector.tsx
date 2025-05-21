"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import "@/styles/widget-animations.css"

interface WidgetSelectorProps {
  open: boolean
  onClose: () => void
  onAddWidget: (type: string, title: string, settings: any) => Promise<boolean>
}

interface WidgetTypeOption {
  id: string
  type: string
  title: string
  description: string
  icon: React.ReactNode
  defaultSettings: any
}

export function WidgetSelector({ open, onClose, onAddWidget }: WidgetSelectorProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg p-4 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Add Widget</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="border rounded p-2 hover:bg-muted"
            onClick={() => {
              onAddWidget("welcome", "Welcome", {})
              onClose()
            }}
          >
            Welcome
          </button>
          <button
            className="border rounded p-2 hover:bg-muted"
            onClick={() => {
              onAddWidget("market-overview", "Market Overview", {})
              onClose()
            }}
          >
            Market Overview
          </button>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
