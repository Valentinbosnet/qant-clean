"use client"
import { Check, Eye, ZoomIn, Zap, Contrast } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import "@/styles/accessibility.css"

export type AccessibilityMode =
  | "none"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "high-contrast"
  | "large-text"
  | "reduced-motion"

interface AccessibilityControlsProps {
  value: AccessibilityMode
  onChange: (mode: AccessibilityMode) => void
}

export function AccessibilityControls({ value, onChange }: AccessibilityControlsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1">
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Accessibilité</span>
          {value !== "none" && (
            <Badge variant="secondary" className="ml-1 px-1 font-normal">
              Actif
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Paramètres d'accessibilité</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onChange("none")} className="flex items-center justify-between">
            Standard
            {value === "none" && <Check className="h-4 w-4" />}
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Eye className="mr-2 h-4 w-4" />
              <span>Daltonisme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onChange("protanopia")} className="flex items-center justify-between">
                  Protanopie (rouge)
                  {value === "protanopia" && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onChange("deuteranopia")}
                  className="flex items-center justify-between"
                >
                  Deutéranopie (vert)
                  {value === "deuteranopia" && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChange("tritanopia")} className="flex items-center justify-between">
                  Tritanopie (bleu)
                  {value === "tritanopia" && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem onClick={() => onChange("high-contrast")} className="flex items-center justify-between">
            <div className="flex items-center">
              <Contrast className="mr-2 h-4 w-4" />
              <span>Contraste élevé</span>
            </div>
            {value === "high-contrast" && <Check className="h-4 w-4" />}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onChange("large-text")} className="flex items-center justify-between">
            <div className="flex items-center">
              <ZoomIn className="mr-2 h-4 w-4" />
              <span>Texte agrandi</span>
            </div>
            {value === "large-text" && <Check className="h-4 w-4" />}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onChange("reduced-motion")} className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="mr-2 h-4 w-4" />
              <span>Réduire les animations</span>
            </div>
            {value === "reduced-motion" && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
