"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Check, ChevronRight, Eye, RefreshCw, Trash2, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sectorAlertsService, type SectorAlert } from "@/lib/sector-alerts-service"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface SectorAlertsPanelProps {
  userId?: string
  maxHeight?: string
  showHeader?: boolean
  showFooter?: boolean
  showTabs?: boolean
  limit?: number
}

export function SectorAlertsPanel({
  userId,
  maxHeight = "300px",
  showHeader = true,
  showFooter = true,
  showTabs = true,
  limit,
}: SectorAlertsPanelProps) {
  const [alerts, setAlerts] = useState<SectorAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("unread")
  const { toast } = useToast()

  useEffect(() => {
    loadAlerts()
  }, [userId])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const allAlerts = await sectorAlertsService.getAlerts(userId)
      setAlerts(allAlerts)
    } catch (error) {
      console.error("Error loading sector alerts:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les alertes sectorielles",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await sectorAlertsService.markAlertAsRead(alertId)
      setAlerts(
        alerts.map((alert) => {
          if (alert.id === alertId) {
            return { ...alert, read: true }
          }
          return alert
        }),
      )
    } catch (error) {
      console.error("Error marking alert as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await sectorAlertsService.markAllAlertsAsRead(userId)
      setAlerts(
        alerts.map((alert) => ({
          ...alert,
          read: true,
        })),
      )
      toast({
        title: "Succès",
        description: "Toutes les alertes ont été marquées comme lues",
        variant: "success",
      })
    } catch (error) {
      console.error("Error marking all alerts as read:", error)
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await sectorAlertsService.deleteAlert(alertId)
      setAlerts(alerts.filter((alert) => alert.id !== alertId))
    } catch (error) {
      console.error("Error deleting alert:", error)
    }
  }

  const handleCheckForUpdates = async () => {
    setLoading(true)
    try {
      const newAlerts = await sectorAlertsService.checkSectorIndicators(userId)
      if (newAlerts.length > 0) {
        await loadAlerts()
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
        setLoading(false)
      }
    } catch (error) {
      console.error("Error checking for updates:", error)
      toast({
        title: "Erreur",
        description: "Impossible de vérifier les mises à jour des indicateurs sectoriels",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const getImpactIcon = (impact: "positive" | "negative" | "neutral") => {
    switch (impact) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  const getImpactColor = (impact: "positive" | "negative" | "neutral") => {
    switch (impact) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200"
      case "negative":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const getImportanceColor = (importance: "high" | "medium" | "low") => {
    switch (importance) {
      case "high":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredAlerts = activeTab === "unread" ? alerts.filter((alert) => !alert.read) : alerts
  const displayAlerts = limit ? filteredAlerts.slice(0, limit) : filteredAlerts

  return (
    <Card className="w-full">
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Alertes Sectorielles
          </CardTitle>
          <CardDescription>Notifications des changements importants dans les indicateurs sectoriels</CardDescription>
        </CardHeader>
      )}

      <CardContent>
        {showTabs && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList>
              <TabsTrigger value="unread">
                Non lues{" "}
                <Badge variant="secondary" className="ml-1">
                  {alerts.filter((a) => !a.read).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="all">
                Toutes{" "}
                <Badge variant="secondary" className="ml-1">
                  {alerts.length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : displayAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Bell className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {activeTab === "unread" ? "Aucune alerte sectorielle non lue" : "Aucune alerte sectorielle disponible"}
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleCheckForUpdates}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Vérifier les mises à jour
            </Button>
          </div>
        ) : (
          <ScrollArea className="pr-4" style={{ maxHeight }}>
            <div className="space-y-3">
              {displayAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.read ? "bg-muted/50 border-muted" : "bg-muted border-muted-foreground/20"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <Badge variant="outline" className={getImpactColor(alert.impact)}>
                          {getImpactIcon(alert.impact)}
                          <span className="ml-1">
                            {alert.impact === "positive"
                              ? "Positif"
                              : alert.impact === "negative"
                                ? "Négatif"
                                : "Neutre"}
                          </span>
                        </Badge>
                        <Badge variant="outline" className={getImportanceColor(alert.importance)}>
                          {alert.importance === "high"
                            ? "Haute importance"
                            : alert.importance === "medium"
                              ? "Importance moyenne"
                              : "Faible importance"}
                        </Badge>
                      </div>
                      <p className={`text-sm ${alert.read ? "text-muted-foreground" : "font-medium"}`}>
                        {alert.message}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(alert.created), { addSuffix: true, locale: fr })}</span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {!alert.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleMarkAsRead(alert.id)}
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDeleteAlert(alert.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {showFooter && (
        <CardFooter className="flex justify-between">
          <Button variant="ghost" size="sm" onClick={handleCheckForUpdates} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <div className="flex space-x-2">
            {alerts.filter((a) => !a.read).length > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <Check className="h-4 w-4 mr-2" />
                Tout marquer comme lu
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <a href="/alerts/sectors">
                Voir tout
                <ChevronRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
