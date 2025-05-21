"use client"

import { useState, type ReactNode } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sun, Moon } from "lucide-react"
import "@/styles/preview-themes.css"

interface ThemePreviewWrapperProps {
  children: ReactNode
}

export function ThemePreviewWrapper({ children }: ThemePreviewWrapperProps) {
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light")

  return (
    <div className={previewTheme === "dark" ? "preview-dark" : ""}>
      <div className="flex justify-end mb-4">
        <Tabs value={previewTheme} onValueChange={(v) => setPreviewTheme(v as any)} className="w-auto">
          <TabsList>
            <TabsTrigger value="light" title="Thème clair">
              <Sun className="h-4 w-4 mr-2" />
              Clair
            </TabsTrigger>
            <TabsTrigger value="dark" title="Thème sombre">
              <Moon className="h-4 w-4 mr-2" />
              Sombre
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {children}
    </div>
  )
}
