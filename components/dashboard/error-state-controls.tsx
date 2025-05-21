"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertTriangle, WifiOff, Ban, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import "@/styles/error-states.css"

export type ErrorStateType = "none" | "no-data" | "loading-error" | "network-offline"

interface ErrorStateControlsProps {
  value: ErrorStateType
  onChange: (value: ErrorStateType) => void
}

export function ErrorStateControls({ value, onChange }: ErrorStateControlsProps) {
  const getLabel = () => {
    switch (value) {
      case "no-data":
        return "Absence de données"
      case "loading-error":
        return "Erreur de chargement"
      case "network-offline":
        return "Déconnexion réseau"
      default:
        return "État normal"
    }
  }

  const getIcon = () => {
    switch (value) {
      case "no-data":
        return <Ban className="h-4 w-4 mr-2" />
      case "loading-error":
        return <AlertTriangle className="h-4 w-4 mr-2" />
      case "network-offline":
        return <WifiOff className="h-4 w-4 mr-2" />
      default:
        return <Check className="h-4 w-4 mr-2" />
    }
  }

  const getBadgeVariant = () => {
    switch (value) {
      case "no-data":
        return "warning"
      case "loading-error":
        return "destructive"
      case "network-offline":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1">
          <AlertTriangle className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">État d'erreur:</span>
          <Badge variant={getBadgeVariant()} className="ml-1 font-normal">
            {getIcon()}
            {getLabel()}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onChange("none")} className="flex items-center">
          <Check className="h-4 w-4 mr-2" />
          État normal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("no-data")} className="flex items-center">
          <Ban className="h-4 w-4 mr-2" />
          Absence de données
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("loading-error")} className="flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Erreur de chargement
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange("network-offline")} className="flex items-center">
          <WifiOff className="h-4 w-4 mr-2" />
          Déconnexion réseau
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
