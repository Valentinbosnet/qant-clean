"use client"

import { useState, useEffect } from "react"
import { getBrowserClient } from "@/lib/client-supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Sun, Moon, Monitor } from "lucide-react"

interface ThemeSelectorProps {
  userId: string
  currentTheme?: string
}

export function ThemeSelector({ userId, currentTheme = "system" }: ThemeSelectorProps) {
  const [theme, setTheme] = useState<string>(currentTheme)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = getBrowserClient()

  useEffect(() => {
    if (currentTheme) {
      setTheme(currentTheme)
    }
  }, [currentTheme])

  const updateTheme = async (newTheme: string) => {
    try {
      setLoading(true)
      setTheme(newTheme)

      const { error } = await supabase.from("profiles").update({ theme: newTheme }).eq("id", userId)

      if (error) throw error

      // Appliquer le thème au document
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark")
      } else if (newTheme === "light") {
        document.documentElement.classList.remove("dark")
      } else {
        // Système
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }

      toast({
        title: "Thème mis à jour",
        description: "Votre thème a été mis à jour avec succès",
      })
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du thème:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le thème",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thème</CardTitle>
        <CardDescription>Choisissez votre thème préféré</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={theme} onValueChange={updateTheme} className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="light" id="light" disabled={loading} />
            <Label htmlFor="light" className="flex items-center cursor-pointer">
              <Sun className="h-4 w-4 mr-2" /> Clair
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dark" id="dark" disabled={loading} />
            <Label htmlFor="dark" className="flex items-center cursor-pointer">
              <Moon className="h-4 w-4 mr-2" /> Sombre
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="system" id="system" disabled={loading} />
            <Label htmlFor="system" className="flex items-center cursor-pointer">
              <Monitor className="h-4 w-4 mr-2" /> Système
            </Label>
          </div>
        </RadioGroup>

        {loading && (
          <div className="flex items-center justify-center mt-4">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Mise à jour...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
