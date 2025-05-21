"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw, Trash2, Clock, Database } from "lucide-react"
import {
  getOfflineSettings,
  saveOfflineSettings,
  toggleOfflineMode,
  syncOfflineData,
  cleanupOfflineCache,
  getOfflineQueue,
} from "@/lib/offline-mode"
import type { OfflineSettings } from "@/lib/offline-mode"

export function OfflineModeSettings() {
  const [settings, setSettings] = useState<OfflineSettings>(getOfflineSettings())
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [queueSize, setQueueSize] = useState(0)
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)

  // Mettre à jour l'état de connexion
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Mettre à jour la taille de la file d'attente
  useEffect(() => {
    const updateQueueSize = () => {
      const queue = getOfflineQueue()
      setQueueSize(queue.length)
    }

    updateQueueSize()
    const interval = setInterval(updateQueueSize, 5000)

    return () => clearInterval(interval)
  }, [])

  // Gérer les changements de paramètres
  const handleSettingChange = (key: keyof OfflineSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    saveOfflineSettings(newSettings)
  }

  // Gérer le changement de mode hors ligne
  const handleToggleOfflineMode = async () => {
    const newValue = !settings.enabled
    await toggleOfflineMode(newValue)
    setSettings({ ...settings, enabled: newValue })
  }

  // Synchroniser les données
  const handleSync = async () => {
    setIsSyncing(true)
    setSyncResult(null)

    try {
      const result = await syncOfflineData()
      setSyncResult(result)
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error)
      setSyncResult({ success: false, error: String(error) })
    } finally {
      setIsSyncing(false)
    }
  }

  // Nettoyer le cache
  const handleCleanupCache = () => {
    cleanupOfflineCache()
    alert("Cache nettoyé avec succès")
  }

  // Formater la durée d'expiration
  const formatExpiration = (ms: number) => {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000))
    return days === 1 ? "1 jour" : `${days} jours`
  }

  // Formater la date de dernière synchronisation
  const formatLastSync = (timestamp: number) => {
    if (timestamp === 0) return "Jamais"

    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Mode hors ligne
          <Badge variant={isOnline ? "default" : "destructive"} className="ml-2">
            {isOnline ? "En ligne" : "Hors ligne"}
          </Badge>
        </CardTitle>
        <CardDescription>Configurez comment l'application fonctionne sans connexion internet</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="offline-mode">Activer le mode hors ligne</Label>
            <p className="text-sm text-muted-foreground">Permet d'utiliser l'application sans connexion internet</p>
          </div>
          <Switch id="offline-mode" checked={settings.enabled} onCheckedChange={handleToggleOfflineMode} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-detect">Détection automatique</Label>
            <p className="text-sm text-muted-foreground">
              Active automatiquement le mode hors ligne quand la connexion est perdue
            </p>
          </div>
          <Switch
            id="auto-detect"
            checked={settings.autoDetect}
            onCheckedChange={(value) => handleSettingChange("autoDetect", value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sync-reconnect">Synchroniser à la reconnexion</Label>
            <p className="text-sm text-muted-foreground">
              Synchronise automatiquement les données quand la connexion est rétablie
            </p>
          </div>
          <Switch
            id="sync-reconnect"
            checked={settings.syncOnReconnect}
            onCheckedChange={(value) => handleSettingChange("syncOnReconnect", value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Durée d'expiration du cache: {formatExpiration(settings.cacheExpiration)}</Label>
          <Slider
            value={[settings.cacheExpiration / (24 * 60 * 60 * 1000)]}
            min={1}
            max={30}
            step={1}
            onValueChange={(value) => handleSettingChange("cacheExpiration", value[0] * 24 * 60 * 60 * 1000)}
          />
          <p className="text-xs text-muted-foreground">Durée pendant laquelle les données sont conservées en cache</p>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm">Dernière synchronisation:</span>
            </div>
            <span className="text-sm font-medium">{formatLastSync(settings.lastSyncTimestamp)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              <span className="text-sm">Actions en attente:</span>
            </div>
            <Badge variant={queueSize > 0 ? "secondary" : "outline"}>{queueSize}</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={handleCleanupCache}>
          <Trash2 className="h-4 w-4 mr-2" />
          Nettoyer le cache
        </Button>
        <Button onClick={handleSync} disabled={isSyncing || !isOnline} size="sm">
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Synchronisation...
            </>
          ) : (
            <>
              {isOnline ? <Wifi className="h-4 w-4 mr-2" /> : <WifiOff className="h-4 w-4 mr-2" />}
              Synchroniser
            </>
          )}
        </Button>
      </CardFooter>
      {syncResult && (
        <div className={`p-3 text-sm ${syncResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {syncResult.success ? (
            <p>Synchronisation réussie: {syncResult.processed} action(s) traitée(s)</p>
          ) : (
            <p>Échec de la synchronisation: {syncResult.failed} erreur(s)</p>
          )}
        </div>
      )}
    </Card>
  )
}
