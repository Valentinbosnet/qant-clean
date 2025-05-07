"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sun, Moon, Laptop } from "lucide-react"

interface ThemeSelectorProps {
  initialTheme: string | null
  onThemeChange: (theme: string) => void
}

export function ThemeSelector({ initialTheme, onThemeChange }: ThemeSelectorProps) {
  const { setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<string>(initialTheme || "system")

  // Mettre à jour le thème lorsque le composant est monté
  useEffect(() => {
    if (initialTheme) {
      setTheme(initialTheme)
    }
  }, [initialTheme, setTheme])

  const handleThemeChange = (value: string) => {
    setSelectedTheme(value)
    setTheme(value)
    onThemeChange(value)
  }

  return (
    <div className="space-y-4">
      <Label>Thème de l'application</Label>
      <RadioGroup value={selectedTheme} onValueChange={handleThemeChange} className="grid grid-cols-3 gap-4">
        <div>
          <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
          <Label
            htmlFor="theme-light"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <Sun className="mb-3 h-6 w-6" />
            Clair
          </Label>
        </div>

        <div>
          <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
          <Label
            htmlFor="theme-dark"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <Moon className="mb-3 h-6 w-6" />
            Sombre
          </Label>
        </div>

        <div>
          <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
          <Label
            htmlFor="theme-system"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <Laptop className="mb-3 h-6 w-6" />
            Système
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}
