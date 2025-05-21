"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, RefreshCw, Save, Trash2, ZapIcon } from "lucide-react"
import {
  getOfflineSettings,
  saveOfflineSettings,
  getCacheStats,
  cleanupOfflineCache,
  compressAllCacheData,
  analyzeStorageUsage,
} from "@/lib/offline-mode"

export function OfflineCompressionSettings() {
  const [settings, setSettings] = useState(getOfflineSettings())
  const [stats, setStats] = useState(getCacheStats())
  const [analysis, setAnalysis] = useState(analyzeStorageUsage())
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionResult, setCompressionResult] = useState<{ processed: number; saved: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Formater la taille en KB ou MB
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  // Rafraîchir les statistiques
  const refreshStats = () => {
    setStats(getCacheStats())
    setAnalysis(analyzeStorageUsage())
  }

  // Sauvegarder les paramètres
  const saveSettings = () => {
    setIsLoading(true)
    saveOfflineSettings(settings)
    setTimeout(() => {
      refreshStats()
      setIsLoading(false)
    }, 300)
  }

  // Nettoyer le cache
  const cleanupCache = () => {
    setIsLoading(true)
    const removed = cleanupOfflineCache(true)
    setTimeout(() => {
      refreshStats()
      setIsLoading(false)
      alert(`${removed} éléments supprimés du cache.`)
    }, 300)
  }

  // Compresser toutes les données
  const compressAll = async () => {
    setIsCompressing(true)
    try {
      const result = await compressAllCacheData()
      setCompressionResult(result)
      refreshStats()
    } catch (error) {
      console.error("Erreur lors de la compression des données:", error)
    } finally {
      setIsCompressing(false)
    }
  }

  // Mettre à jour les statistiques au chargement
  useEffect(() => {
    refreshStats()
  }, [])

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ZapIcon className="h-5 w-5" />
          Compression des données hors ligne
        </CardTitle>
        <CardDescription>Optimisez l'utilisation du stockage pour le mode hors ligne</CardDescription>
      </CardHeader>

      <Tabs defaultValue="settings">
        <TabsList className="mx-6">
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
        </TabsList>

        <CardContent>
          <TabsContent value="settings" className="space-y-4 mt-2">
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

            <div className="space-y-2">
              <Label htmlFor="threshold-slider">
                Seuil de compression ({formatSize(settings.compressionThreshold)})
              </Label>
              <Slider
                id="threshold-slider"
                min={512}
                max={10240}
                step={512}
                value={[settings.compressionThreshold]}
                onValueChange={(value) => setSettings({ ...settings, compressionThreshold: value[0] })}
                disabled={!settings.compressionEnabled}
              />
              <p className="text-xs text-muted-foreground">
                Les données plus petites que ce seuil ne seront pas compressées
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quota-slider">Quota de stockage ({formatSize(settings.storageQuota)})</Label>
              <Slider
                id="quota-slider"
                min={1 * 1024 * 1024}
                max={100 * 1024 * 1024}
                step={1 * 1024 * 1024}
                value={[settings.storageQuota]}
                onValueChange={(value) => setSettings({ ...settings, storageQuota: value[0] })}
              />
              <p className="text-xs text-muted-foreground">Limite maximale d'utilisation du stockage local</p>
            </div>

            <div className="pt-4 flex flex-col gap-2">
              <Button
                onClick={compressAll}
                disabled={isCompressing || !settings.compressionEnabled}
                variant="outline"
                className="w-full"
              >
                {isCompressing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Compression en cours...
                  </>
                ) : (
                  <>Compresser toutes les données</>
                )}
              </Button>

              {compressionResult && (
                <Alert variant="default" className="mt-2">
                  <AlertTitle>Compression terminée</AlertTitle>
                  <AlertDescription>
                    {compressionResult.processed} éléments traités, {formatSize(compressionResult.saved)} économisés
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Éléments en cache</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Taux de compression</p>
                <p className="text-2xl font-bold">{stats.compressionRatio.toFixed(2)}x</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Taille originale</p>
                <p className="text-2xl font-bold">{formatSize(stats.totalSize)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Taille compressée</p>
                <p className="text-2xl font-bold">{formatSize(stats.compressedSize)}</p>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span>Espace utilisé</span>
                <span>{Math.round(analysis.usagePercentage)}%</span>
              </div>
              <Progress value={analysis.usagePercentage} />
              <p className="text-xs text-muted-foreground">
                {formatSize(analysis.totalUsage)} utilisés sur{" "}
                {formatSize(analysis.totalUsage + analysis.availableSpace)} estimés
              </p>
            </div>

            {stats.itemsByType && Object.keys(stats.itemsByType).length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Types de données</p>
                <div className="space-y-2">
                  {Object.entries(stats.itemsByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span>{type}</span>
                      <span>
                        {count} élément{count > 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4 mt-2">
            {analysis.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-1">
                  <InfoIcon className="h-4 w-4" />
                  Suggestions d'optimisation
                </p>
                <ul className="space-y-1">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="text-sm pl-5 relative before:content-['•'] before:absolute before:left-0"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.largestItems.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Plus gros éléments en cache</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {analysis.largestItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm border-b pb-1">
                      <span className="truncate max-w-[70%]" title={item.key}>
                        {item.key}
                      </span>
                      <span className="text-right">
                        <span className="text-xs bg-muted px-1 py-0.5 rounded mr-2">{item.type}</span>
                        {formatSize(item.size)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={cleanupCache} disabled={isLoading}>
          <Trash2 className="mr-2 h-4 w-4" />
          Nettoyer le cache
        </Button>

        <Button onClick={saveSettings} disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
