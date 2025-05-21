"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getPrefetchConfig, savePrefetchConfig, getPrefetchStats, CachePriority } from "@/lib/prefetch-service"

export function PrefetchSettings() {
  const [config, setConfig] = useState(getPrefetchConfig())
  const [stats, setStats] = useState(getPrefetchStats())
  const [isWifiOnly, setIsWifiOnly] = useState(config.onlyOnWifi)
  const [isEnabled, setIsEnabled] = useState(config.enabled)
  const [isIntelligent, setIsIntelligent] = useState(config.intelligentPrefetch)
  const [prefetchOnLogin, setPrefetchOnLogin] = useState(config.prefetchOnLogin)
  const [maxItems, setMaxItems] = useState(config.maxItemsPerSession.toString())
  const [maxSize, setMaxSize] = useState((config.maxSizePerSession / (1024 * 1024)).toString())
  const [minBattery, setMinBattery] = useState(config.minBatteryLevel)
  const [priority, setPriority] = useState(config.prefetchPriority)
  const [isSaved, setIsSaved] = useState(false)

  // Charger les configurations et statistiques
  useEffect(() => {
    setConfig(getPrefetchConfig())
    setStats(getPrefetchStats())
  }, [])

  // Mettre à jour les états locaux lorsque la configuration change
  useEffect(() => {
    setIsWifiOnly(config.onlyOnWifi)
    setIsEnabled(config.enabled)
    setIsIntelligent(config.intelligentPrefetch)
    setPrefetchOnLogin(config.prefetchOnLogin)
    setMaxItems(config.maxItemsPerSession.toString())
    setMaxSize((config.maxSizePerSession / (1024 * 1024)).toString())
    setMinBattery(config.minBatteryLevel)
    setPriority(config.prefetchPriority)
  }, [config])

  // Sauvegarder les paramètres
  const handleSave = () => {
    const newConfig = {
      enabled: isEnabled,
      onlyOnWifi: isWifiOnly,
      intelligentPrefetch: isIntelligent,
      prefetchOnLogin: prefetchOnLogin,
      maxItemsPerSession: Number.parseInt(maxItems, 10) || 20,
      maxSizePerSession: (Number.parseFloat(maxSize) || 10) * 1024 * 1024,
      minBatteryLevel: minBattery,
      prefetchPriority: priority,
    }

    savePrefetchConfig(newConfig)
    setConfig(getPrefetchConfig())
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  // Formater la taille en MB
  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2)
  }

  // Formater la date
  const formatDate = (timestamp: number) => {
    if (!timestamp) return "Jamais"
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de préchargement intelligent</CardTitle>
          <CardDescription>Configurez comment l'application anticipe vos besoins en mode hors ligne</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="prefetch-enabled" className="flex-1">
              Activer le préchargement intelligent
            </Label>
            <Switch id="prefetch-enabled" checked={isEnabled} onCheckedChange={setIsEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="wifi-only" className="flex-1">
              Précharger uniquement sur WiFi
            </Label>
            <Switch id="wifi-only" checked={isWifiOnly} onCheckedChange={setIsWifiOnly} disabled={!isEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="intelligent-prefetch" className="flex-1">
              Utiliser l'apprentissage des habitudes
            </Label>
            <Switch
              id="intelligent-prefetch"
              checked={isIntelligent}
              onCheckedChange={setIsIntelligent}
              disabled={!isEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="prefetch-on-login" className="flex-1">
              Précharger au moment de la connexion
            </Label>
            <Switch
              id="prefetch-on-login"
              checked={prefetchOnLogin}
              onCheckedChange={setPrefetchOnLogin}
              disabled={!isEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-items">Nombre maximum d'éléments par session</Label>
            <Input
              id="max-items"
              type="number"
              value={maxItems}
              onChange={(e) => setMaxItems(e.target.value)}
              disabled={!isEnabled}
              min="1"
              max="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-size">Taille maximale par session (MB)</Label>
            <Input
              id="max-size"
              type="number"
              value={maxSize}
              onChange={(e) => setMaxSize(e.target.value)}
              disabled={!isEnabled}
              min="1"
              max="100"
              step="0.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="min-battery">Niveau minimum de batterie ({minBattery}%)</Label>
            <Slider
              id="min-battery"
              value={[minBattery]}
              onValueChange={(value) => setMinBattery(value[0])}
              disabled={!isEnabled}
              min={5}
              max={50}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priorité des données préchargées</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as CachePriority)}
              disabled={!isEnabled}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Sélectionner une priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CachePriority.LOW}>Basse</SelectItem>
                <SelectItem value={CachePriority.MEDIUM}>Moyenne</SelectItem>
                <SelectItem value={CachePriority.HIGH}>Haute</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={!isEnabled}>
            {isSaved ? "Paramètres sauvegardés!" : "Sauvegarder les paramètres"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistiques de préchargement</CardTitle>
          <CardDescription>Informations sur l'efficacité du préchargement intelligent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Éléments préchargés</p>
              <p className="text-2xl font-bold">{stats.totalPrefetched}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Taille totale</p>
              <p className="text-2xl font-bold">{formatSize(stats.totalSize)} MB</p>
            </div>
            <div>
              <p className="text-sm font-medium">Taux de succès</p>
              <p className="text-2xl font-bold">{(stats.successRate * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm font-medium">Dernier préchargement</p>
              <p className="text-sm">{formatDate(stats.lastPrefetchTime)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Éléments actuellement préchargés</p>
            <div className="max-h-40 overflow-y-auto text-sm bg-gray-50 p-2 rounded">
              {stats.prefetchedItems.length > 0 ? (
                <ul className="list-disc pl-5">
                  {stats.prefetchedItems.map((item, index) => (
                    <li key={index} className="truncate">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Aucun élément préchargé</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
