"use client"

import type React from "react"

import { useState } from "react"
import { Check, Moon, Sun, Laptop } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeSelectorProps {
  currentTheme: string
  onThemeChange: (theme: string) => void
}

interface ThemeOption {
  value: string
  label: string
  icon: React.ReactNode
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || "system")

  const themeOptions: ThemeOption[] = [
    {
      value: "light",
      label: "Clair",
      icon: <Sun className="h-5 w-5" />,
    },
    {
      value: "dark",
      label: "Sombre",
      icon: <Moon className="h-5 w-5" />,
    },
    {
      value: "system",
      label: "Système",
      icon: <Laptop className="h-5 w-5" />,
    },
  ]

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme)
    onThemeChange(theme)
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {themeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            "relative flex flex-col items-center justify-center rounded-md border-2 p-4 hover:bg-accent",
            selectedTheme === option.value
              ? "border-primary bg-accent"
              : "border-muted bg-background hover:border-accent",
          )}
          onClick={() => handleThemeChange(option.value)}
        >
          {selectedTheme === option.value && (
            <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-4 w-4" />
            </span>
          )}
          <div className="mb-2">{option.icon}</div>
          <span className="text-sm font-medium">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
