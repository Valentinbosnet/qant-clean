"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, WifiOff, Wifi } from "lucide-react"
import { isOfflineModeEnabled, setOfflineMode } from "@/lib/offline-mode"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export function OfflineModeToggle() {
  const [offlineMode, setOfflineModeState] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // S'assurer que nous sommes côté client
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== "undefined") {
      setOfflineModeState(isOfflineModeEnabled())
    }
  }, [])

  const handleToggleChange = async (checked: boolean) => {
    setIsLoading(true)

    // Petit délai pour montrer que quelque chose se passe
    await new Promise((resolve) => setTimeout(resolve, 500))

    setOfflineMode(checked)
    setOfflineModeState(checked)
    setIsLoading(false)
  }

  if (!isClient) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {offlineMode ? <WifiOff className="h-5 w-5" /> : <Wifi className="h-5 w-5" />}
          Mode Hors Ligne
        </CardTitle>
        <CardDescription>
          Activez le mode hors ligne lorsque vous rencontrez des problèmes de connexion.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {offlineMode ? (
          <Alert variant="warning">
            <AlertTitle>Mode hors ligne activé</AlertTitle>
            <AlertDescription>
              Vous êtes en mode hors ligne. Certaines fonctionnalités peuvent être limitées.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="info">
            <AlertTitle>Mode hors ligne désactivé</AlertTitle>
            <AlertDescription>
              L'application essaiera de se connecter à Supabase pour l'authentification.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center space-x-2">
          <Switch id="offline-mode" checked={offlineMode} onCheckedChange={handleToggleChange} disabled={isLoading} />
          <Label htmlFor="offline-mode" className="flex items-center">
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {offlineMode ? "Désactiver le mode hors ligne" : "Activer le mode hors ligne"}
          </Label>
        </div>

        <p className="text-sm text-muted-foreground">
          Le mode hors ligne vous permet d'utiliser l'application sans connexion à Internet. Les données seront stockées
          localement et synchronisées lorsque la connexion sera rétablie.
        </p>
      </CardContent>
    </Card>
  )
}
