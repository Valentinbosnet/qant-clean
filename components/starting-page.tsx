"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RecentActivityList } from "./recent-activity-list"
import { OfflineReadinessIndicator } from "./offline-readiness-indicator"
import { QuickActionButtons } from "./quick-action-buttons"
import { PrefetchStatusCard } from "./prefetch-status-card"
import { analyzeStorageUsage } from "@/lib/offline-mode"

export function StartingPage() {
  const [prefetchEnabled, setPrefetchEnabled] = useState(false)
  const [wifiOnly, setWifiOnly] = useState(true)
  const [learnHabits, setLearnHabits] = useState(true)
  const [offlineReadiness, setOfflineReadiness] = useState(0)
  const [storageStats, setStorageStats] = useState({
    totalSize: 0,
    itemCount: 0,
    categories: {},
    lastUpdated: null as Date | null,
  })

  useEffect(() => {
    // Simuler le chargement des préférences utilisateur
    setTimeout(() => {
      setPrefetchEnabled(true)
      setOfflineReadiness(78)
    }, 500)

    // Charger les statistiques de stockage
    const loadStorageStats = async () => {
      try {
        const stats = await analyzeStorageUsage()
        setStorageStats(stats)
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques de stockage:", error)
      }
    }

    loadStorageStats()
  }, [])

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenue</h1>
          <p className="text-muted-foreground mt-1">
            Votre application est prête à être utilisée en ligne et hors ligne.
          </p>
        </div>
        <OfflineReadinessIndicator readiness={offlineReadiness} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <QuickActionButtons />
        </div>
        <div>
          <PrefetchStatusCard
            status={prefetchEnabled ? "active" : "inactive"}
            itemCount={storageStats.itemCount}
            successRate={85}
            lastUpdated={storageStats.lastUpdated}
          />
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
          <TabsTrigger value="prefetch">Préchargement</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="favorites">Favoris</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>Tableau de bord</CardTitle>
              <CardDescription>Accédez rapidement à toutes les fonctionnalités de l'application.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenu du tableau de bord...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prefetch">
          <Card>
            <CardHeader>
              <CardTitle>Préchargement intelligent</CardTitle>
              <CardDescription>
                Configurez comment l'application anticipe vos besoins en mode hors ligne.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="prefetch">Activer le préchargement</Label>
                  <p className="text-sm text-muted-foreground">
                    Permet à l'application de précharger les données pour une utilisation hors ligne.
                  </p>
                </div>
                <Switch id="prefetch" checked={prefetchEnabled} onCheckedChange={setPrefetchEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="wifi-only">Précharger uniquement sur WiFi</Label>
                  <p className="text-sm text-muted-foreground">
                    Économisez vos données mobiles en préchargeant uniquement sur WiFi.
                  </p>
                </div>
                <Switch id="wifi-only" checked={wifiOnly} onCheckedChange={setWifiOnly} disabled={!prefetchEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="learn-habits">Apprentissage des habitudes</Label>
                  <p className="text-sm text-muted-foreground">
                    Permet à l'application d'apprendre de vos habitudes de navigation.
                  </p>
                </div>
                <Switch
                  id="learn-habits"
                  checked={learnHabits}
                  onCheckedChange={setLearnHabits}
                  disabled={!prefetchEnabled}
                />
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full">
                  Voir les statistiques détaillées
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Historique de vos actions dans l'application.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivityList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>Favoris</CardTitle>
              <CardDescription>Accédez rapidement à vos éléments favoris.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Liste des favoris...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres rapides</CardTitle>
              <CardDescription>Configurez rapidement les fonctionnalités principales.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Paramètres rapides...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
