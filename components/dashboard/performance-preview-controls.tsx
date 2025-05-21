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
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Gauge, Activity, Zap } from "lucide-react"

import "@/styles/performance-preview.css"

export interface PerformancePreviewOptions {
  dataSize: "small" | "medium" | "large" | "xlarge"
  animationSpeed: number
  simulateNetworkDelay: boolean
  delayMs: number
}

interface PerformancePreviewControlsProps {
  isActive: boolean
  options: PerformancePreviewOptions
  onToggle: () => void
  onOptionsChange: (options: PerformancePreviewOptions) => void
}

export function PerformancePreviewControls({
  isActive,
  options,
  onToggle,
  onOptionsChange,
}: PerformancePreviewControlsProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleDataSizeChange = (size: "small" | "medium" | "large" | "xlarge") => {
    onOptionsChange({
      ...options,
      dataSize: size,
    })
  }

  const handleAnimationSpeedChange = (value: number[]) => {
    onOptionsChange({
      ...options,
      animationSpeed: value[0],
    })
  }

  const handleNetworkDelayChange = (value: number[]) => {
    onOptionsChange({
      ...options,
      delayMs: value[0],
    })
  }

  const handleToggleNetworkDelay = () => {
    onOptionsChange({
      ...options,
      simulateNetworkDelay: !options.simulateNetworkDelay,
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
                className={isActive ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
              >
                <Gauge className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Prévisualisation des performances</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Simulation de performances</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="p-2 space-y-4">
            <div>
              <Label className="mb-2 block">Quantité de données</Label>
              <div className="grid grid-cols-4 gap-1">
                {(["small", "medium", "large", "xlarge"] as const).map((size) => (
                  <Button
                    key={size}
                    variant={options.dataSize === size ? "default" : "outline"}
                    size="sm"
                    className={`text-xs ${options.dataSize === size ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                    onClick={() => handleDataSizeChange(size)}
                  >
                    {size === "small"
                      ? "Petite"
                      : size === "medium"
                        ? "Moyenne"
                        : size === "large"
                          ? "Grande"
                          : "Très grande"}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label htmlFor="animation-speed">Vitesse d'animation</Label>
                <span className="text-xs text-muted-foreground">
                  {options.animationSpeed === 0
                    ? "Désactivée"
                    : options.animationSpeed === 1
                      ? "Lente"
                      : options.animationSpeed === 2
                        ? "Normale"
                        : "Rapide"}
                </span>
              </div>
              <Slider
                id="animation-speed"
                min={0}
                max={3}
                step={1}
                value={[options.animationSpeed]}
                onValueChange={handleAnimationSpeedChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="network-delay" className="cursor-pointer">
                Simuler un délai réseau
              </Label>
              <Button
                variant={options.simulateNetworkDelay ? "default" : "outline"}
                size="sm"
                className={`text-xs ${options.simulateNetworkDelay ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                onClick={handleToggleNetworkDelay}
              >
                {options.simulateNetworkDelay ? "Activé" : "Désactivé"}
              </Button>
            </div>

            {options.simulateNetworkDelay && (
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="delay-ms">Délai (ms)</Label>
                  <span className="text-xs text-muted-foreground">{options.delayMs} ms</span>
                </div>
                <Slider
                  id="delay-ms"
                  min={100}
                  max={5000}
                  step={100}
                  value={[options.delayMs]}
                  onValueChange={handleNetworkDelayChange}
                />
              </div>
            )}
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center justify-between cursor-pointer"
            onClick={() => {
              setIsOpen(false)
              onToggle()
            }}
          >
            <span className="flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              {isActive ? "Désactiver" : "Activer"} la simulation
            </span>
            <Zap className={`h-4 w-4 ${isActive ? "text-purple-500" : "text-muted-foreground"}`} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
