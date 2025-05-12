"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bell, Check, RefreshCw, Settings } from "lucide-react"
import { SectorAlertsPanel } from "@/components/sector-alerts-panel"
import { SectorAlertsPreferences } from "@/components/sector-alerts-preferences"
import { sectorAlertsService } from "@/lib/sector-alerts-service"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function SectorAlertsPage() {
  const [activeTab, setActiveTab] = useState("alerts")
  const [unreadCount, setUnreadCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    loadUnreadCount()
  }, [])

  const loadUnreadCount = async () => {
    try {
      const unreadAlerts = await sectorAlertsService.getUnreadAlerts()
      setUnreadCount(unreadAlerts.length)
    } catch (error) {
      console.error("Error loading unread alerts count:", error)
    }
  }

  const handleCheckForUpdates = async () => {
    try {
      const newAlerts = await sectorAlertsService.checkSectorIndicators()
      if (newAlerts.length > 0) {
        await loadUnreadCount()
        toast({
          title: "Nouvelles alertes",
          description: `${newAlerts.length} nouvelle(s) alerte(s) sectorielle(s) détectée(s)`,
          variant: "success",
        })
      } else {
        toast({
          title: "Aucune nouvelle alerte",
          description: "Aucun changement significatif détecté dans les indicateurs sectoriels",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error checking for updates:", error)
      toast({
        title: "Erreur",
        description: "Impossible de vérifier les mises à jour des indicateurs sectoriels",
        variant: "destructive",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await sectorAlertsService.markAllAlertsAsRead()
      setUnreadCount(0)
      toast({
        title: "Succès",
        description: "Toutes les alertes ont été marquées comme lues",
        variant: "success",
      })
    } catch (error) {
      console.error("Error marking all alerts as read:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Alertes Sectorielles</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleCheckForUpdates}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Vérifier les mises à jour
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="alerts" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Alertes
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Préférences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <SectorAlertsPanel maxHeight="600px" showHeader={false} showFooter={false} showTabs={true} />
        </TabsContent>

        <TabsContent value="preferences">
          <SectorAlertsPreferences onSave={loadUnreadCount} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
