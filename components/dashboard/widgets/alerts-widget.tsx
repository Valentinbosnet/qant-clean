"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, BellOff, ChevronRight, TrendingDown, TrendingUp } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { WidgetConfig } from "@/lib/dashboard-service"

interface Alert {
  id: string
  symbol: string
  type: "price" | "volume" | "prediction" | "news"
  message: string
  severity: "low" | "medium" | "high"
  timestamp: string
  read: boolean
}

interface AlertsWidgetProps {
  config: WidgetConfig
}

export function AlertsWidget({ config }: AlertsWidgetProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)

  // Nombre d'alertes à afficher (depuis les paramètres du widget ou valeur par défaut)
  const maxAlerts = config.settings?.maxAlerts || 5

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true)

      // Simuler un appel API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Données simulées
      const mockAlerts: Alert[] = [
        {
          id: "1",
          symbol: "AAPL",
          type: "price",
          message: "Apple a dépassé le seuil de 200$",
          severity: "medium",
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          read: false,
        },
        {
          id: "2",
          symbol: "TSLA",
          type: "prediction",
          message: "Prédiction de baisse pour Tesla dans les 7 prochains jours",
          severity: "high",
          timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
          read: false,
        },
        {
          id: "3",
          symbol: "MSFT",
          type: "volume",
          message: "Volume inhabituel détecté sur Microsoft",
          severity: "medium",
          timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
          read: true,
        },
        {
          id: "4",
          symbol: "AMZN",
          type: "news",
          message: "Nouvelles importantes concernant Amazon",
          severity: "low",
          timestamp: new Date(Date.now() - 360 * 60000).toISOString(),
          read: false,
        },
        {
          id: "5",
          symbol: "NVDA",
          type: "price",
          message: "NVIDIA a atteint un nouveau record historique",
          severity: "medium",
          timestamp: new Date(Date.now() - 480 * 60000).toISOString(),
          read: true,
        },
        {
          id: "6",
          symbol: "GOOG",
          type: "prediction",
          message: "Prédiction de hausse pour Google dans les 30 prochains jours",
          severity: "medium",
          timestamp: new Date(Date.now() - 600 * 60000).toISOString(),
          read: false,
        },
      ]

      setAlerts(mockAlerts)
      setLoading(false)
    }

    fetchAlerts()
  }, [])

  const markAsRead = (id: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)))
  }

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, read: true })))
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

    if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} min`
    } else if (diffMinutes < 1440) {
      return `Il y a ${Math.floor(diffMinutes / 60)} h`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getSeverityColor = (severity: Alert["severity"]) => {
    switch (severity) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-warning text-warning-foreground"
      case "low":
        return "bg-muted text-muted-foreground"
    }
  }

  const getTypeIcon = (type: Alert["type"]) => {
    switch (type) {
      case "price":
        return <TrendingUp className="h-4 w-4" />
      case "volume":
        return <TrendingDown className="h-4 w-4" />
      case "prediction":
        return <ChevronRight className="h-4 w-4" />
      case "news":
        return <Bell className="h-4 w-4" />
    }
  }

  const filteredAlerts = showOnlyUnread ? alerts.filter((alert) => !alert.read) : alerts

  const displayedAlerts = filteredAlerts.slice(0, maxAlerts)
  const unreadCount = alerts.filter((alert) => !alert.read).length

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-normal">
            {unreadCount} non lues
          </Badge>

          <div className="flex items-center space-x-2">
            <Switch id="show-unread" checked={showOnlyUnread} onCheckedChange={setShowOnlyUnread} />
            <Label htmlFor="show-unread" className="text-xs">
              Non lues uniquement
            </Label>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7">
            <BellOff className="h-3 w-3 mr-1" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100%-2rem)]">
        {displayedAlerts.length > 0 ? (
          <div className="space-y-2">
            {displayedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-2 rounded-md border flex items-start gap-2 ${
                  alert.read ? "bg-background" : "bg-muted/30"
                }`}
              >
                <div className={`p-1 rounded-full ${getSeverityColor(alert.severity)}`}>{getTypeIcon(alert.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{alert.symbol}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(alert.timestamp)}</span>
                  </div>
                  <p className="text-sm truncate">{alert.message}</p>
                </div>

                {!alert.read && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => markAsRead(alert.id)}>
                    <BellOff className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[100px] text-center">
            <Bell className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {showOnlyUnread ? "Aucune alerte non lue" : "Aucune alerte disponible"}
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
