"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Presentation, Focus, Eye, EyeOff, Layers } from "lucide-react"

import "@/styles/presentation-mode.css"

export interface PresentationModeOptions {
  hideControls: boolean
  focusMode: boolean
  highlightWidgets: string[]
  hideWidgets: string[]
}

interface PresentationModeControlsProps {
  isActive: boolean
  options: PresentationModeOptions
  widgetIds: string[]
  widgetTitles: Record<string, string>
  onToggle: () => void
  onOptionsChange: (options: PresentationModeOptions) => void
}

export function PresentationModeControls({
  isActive,
  options,
  widgetIds,
  widgetTitles,
  onToggle,
  onOptionsChange,
}: PresentationModeControlsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggleHideControls = () => {
    onOptionsChange({
      ...options,
      hideControls: !options.hideControls,
    })
  }

  const handleToggleFocusMode = () => {
    onOptionsChange({
      ...options,
      focusMode: !options.focusMode,
    })
  }

  const handleToggleWidgetHighlight = (widgetId: string) => {
    const isHighlighted = options.highlightWidgets.includes(widgetId)
    let newHighlightedWidgets: string[]

    if (isHighlighted) {
      newHighlightedWidgets = options.highlightWidgets.filter((id) => id !== widgetId)
    } else {
      newHighlightedWidgets = [...options.highlightWidgets, widgetId]
    }

    onOptionsChange({
      ...options,
      highlightWidgets: newHighlightedWidgets,
    })
  }

  const handleToggleWidgetVisibility = (widgetId: string) => {
    const isHidden = options.hideWidgets.includes(widgetId)
    let newHiddenWidgets: string[]

    if (isHidden) {
      newHiddenWidgets = options.hideWidgets.filter((id) => id !== widgetId)
    } else {
      newHiddenWidgets = [...options.hideWidgets, widgetId]
    }

    onOptionsChange({
      ...options,
      hideWidgets: newHiddenWidgets,
    })
  }

  return (
    <TooltipProvider>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant={isActive ? "default" : "outline"}
                size="icon"
                onClick={() => !isOpen && onToggle()}
                className={isActive ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
              >
                <Presentation className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Mode présentation</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Options de présentation</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="hide-controls" className="cursor-pointer">
                Masquer les contrôles
              </Label>
              <Switch id="hide-controls" checked={options.hideControls} onCheckedChange={handleToggleHideControls} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="focus-mode" className="cursor-pointer">
                Mode focus
              </Label>
              <Switch id="focus-mode" checked={options.focusMode} onCheckedChange={handleToggleFocusMode} />
            </div>
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center">
            <Focus className="h-4 w-4 mr-2" />
            Widgets à mettre en évidence
          </DropdownMenuLabel>

          <div className="max-h-40 overflow-y-auto p-1">
            {widgetIds.map((widgetId) => (
              <DropdownMenuItem
                key={`highlight-${widgetId}`}
                className="flex items-center justify-between"
                onSelect={(e) => {
                  e.preventDefault()
                  handleToggleWidgetHighlight(widgetId)
                }}
              >
                <span>{widgetTitles[widgetId] || widgetId}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 ${
                    options.highlightWidgets.includes(widgetId)
                      ? "text-amber-600 bg-amber-100 dark:bg-amber-900/30"
                      : ""
                  }`}
                >
                  <Layers className="h-3 w-3" />
                </Button>
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center">
            <EyeOff className="h-4 w-4 mr-2" />
            Widgets à masquer
          </DropdownMenuLabel>

          <div className="max-h-40 overflow-y-auto p-1">
            {widgetIds.map((widgetId) => (
              <DropdownMenuItem
                key={`visibility-${widgetId}`}
                className="flex items-center justify-between"
                onSelect={(e) => {
                  e.preventDefault()
                  handleToggleWidgetVisibility(widgetId)
                }}
              >
                <span>{widgetTitles[widgetId] || widgetId}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 ${
                    options.hideWidgets.includes(widgetId) ? "text-red-600 bg-red-100 dark:bg-red-900/30" : ""
                  }`}
                >
                  {options.hideWidgets.includes(widgetId) ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
