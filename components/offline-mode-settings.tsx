"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, WifiOff, Save } from "lucide-react"
import { getOfflineSettings, saveOfflineSettings, isOfflineMode } from "@/lib/prefetch-service"

export function OfflineModeSettings() {
  const [settings, setSettings] = useState(getOfflineSettings())
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // S'assurer que nous sommes côté client
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSave = () => {
    setIsLoading(true)
    saveOfflineSettings(settings)
    setTimeout(() => {
      setIsLoading(false)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    }, 500)
  }

  // Si nous sommes côté serveur, afficher un état de chargement
  if (!isClient) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Chargement...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Paramètres du mode hors ligne</CardTitle>
        <CardDescription>Configurez comment l'application fonctionne sans connexion internet</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="offline-toggle" className="font-medium">
              Mode hors ligne
            </Label>
            <p className="text-sm text-muted-foreground">Activer le fonctionnement sans connexion internet</p>
          </div>
          <Switch
            id="offline-toggle"
            checked={settings.enabled}
            onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-detect-toggle" className="font-medium">
              Détection automatique
            </Label>
            <p className="text-sm text-muted-foreground">
              Activer automatiquement le mode hors ligne lorsque la connexion est perdue
            </p>
          </div>
          <Switch
            id="auto-detect-toggle"
            checked={settings.autoDetect}
            onCheckedChange={(checked) => setSettings({ ...settings, autoDetect: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="sync-toggle" className="font-medium">
              Synchronisation automatique
            </Label>
            <p className="text-sm text-muted-foreground">Synchroniser les données lorsque la connexion est rétablie</p>
          </div>
          <Switch
            id="sync-toggle"
            checked={settings.syncOnReconnect}
            onCheckedChange={(checked) => setSettings({ ...settings, syncOnReconnect: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="compression-toggle" className="font-medium">
              Compression des données
            </Label>
            <p className="text-sm text-muted-foreground">Réduire la taille des données stockées localement</p>
          </div>
          <Switch
            id="compression-toggle"
            checked={settings.compressionEnabled}
            onCheckedChange={(checked) => setSettings({ ...settings, compressionEnabled: checked })}
          />
        </div>

        {isOfflineMode() && (
          <Alert variant="warning" className="mt-4">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Mode hors ligne actif</AlertTitle>
            <AlertDescription>
              L'application fonctionne actuellement en mode hors ligne. Les données sont stockées localement.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...
            </>
          ) : isSaved ? (
            <>
              <Save className="mr-2 h-4 w-4" /> Paramètres sauvegardés!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Sauvegarder les paramètres
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
