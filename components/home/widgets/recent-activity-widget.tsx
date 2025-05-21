"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Search, Star, BarChart2, Bell, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { isOfflineModeEnabled } from "@/lib/offline-mode"
import type { HomeWidgetConfig } from "@/lib/home-widgets-service"

interface RecentActivityWidgetProps {
  config: HomeWidgetConfig
}

export function RecentActivityWidget({ config }: RecentActivityWidgetProps) {
  const { settings } = config
  const maxItems = settings?.maxItems || 4

  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    async function loadActivities() {
      // Vérifier si le mode hors ligne est activé
      const offlineMode = isOfflineModeEnabled()
      setIsOffline(offlineMode)

      if (offlineMode) {
        // Utiliser des données fictives en mode hors ligne
        const offlineActivities = [
          {
            id: 1,
            type: "search",
            icon: <Search className="h-4 w-4" />,
            description: "Vous avez recherché TSLA",
            time: "Il y a 10 minutes",
            isOffline: true,
          },
          {
            id: 2,
            type: "favorite",
            icon: <Star className="h-4 w-4" />,
            description: "Vous avez ajouté NVDA aux favoris",
            time: "Il y a 2 heures",
            isOffline: true,
          },
          {
            id: 3,
            type: "prediction",
            icon: <BarChart2 className="h-4 w-4" />,
            description: "Nouvelle prédiction pour AAPL",
            time: "Il y a 5 heures",
            isOffline: true,
          },
          {
            id: 4,
            type: "alert",
            icon: <Bell className="h-4 w-4" />,
            description: "Alerte de prix pour MSFT déclenchée",
            time: "Il y a 1 jour",
            isOffline: true,
          },
        ]

        setActivities(offlineActivities)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        const supabase = createClientComponentClient()

        // Vérifier si l'utilisateur est connecté
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          // Utilisateur non connecté, utiliser des données fictives
          setActivities([
            {
              id: 1,
              type: "info",
              icon: <Star className="h-4 w-4" />,
              description: "Connectez-vous pour voir votre activité",
              time: "Maintenant",
              isGuest: true,
            },
          ])
          setIsLoading(false)
          return
        }

        // Récupérer les activités récentes depuis Supabase
        // Exemple: recherches, favoris ajoutés, alertes, etc.
        const { data: searchHistory, error: searchError } = await supabase
          .from("search_history")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(maxItems)

        const { data: favoriteActions, error: favoritesError } = await supabase
          .from("favorite_actions")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(maxItems)

        const { data: alertHistory, error: alertsError } = await supabase
          .from("alert_history")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(maxItems)

        // Combiner et trier toutes les activités
        const allActivities = [
          ...(searchHistory || []).map((item) => ({
            id: `search-${item.id}`,
            type: "search",
            icon: <Search className="h-4 w-4" />,
            description: `Vous avez recherché ${item.symbol}`,
            time: formatTimeAgo(new Date(item.created_at)),
            timestamp: new Date(item.created_at).getTime(),
          })),
          ...(favoriteActions || []).map((item) => ({
            id: `favorite-${item.id}`,
            type: "favorite",
            icon: <Star className="h-4 w-4" />,
            description: `Vous avez ${item.action === "add" ? "ajouté" : "retiré"} ${item.symbol} ${item.action === "add" ? "aux" : "des"} favoris`,
            time: formatTimeAgo(new Date(item.created_at)),
            timestamp: new Date(item.created_at).getTime(),
          })),
          ...(alertHistory || []).map((item) => ({
            id: `alert-${item.id}`,
            type: "alert",
            icon: <Bell className="h-4 w-4" />,
            description: `Alerte ${item.type} pour ${item.symbol} déclenchée`,
            time: formatTimeAgo(new Date(item.created_at)),
            timestamp: new Date(item.created_at).getTime(),
          })),
        ]

        // Trier par date (plus récent en premier) et limiter au nombre maximum
        const sortedActivities = allActivities.sort((a, b) => b.timestamp - a.timestamp).slice(0, maxItems)

        if (sortedActivities.length === 0) {
          // Aucune activité trouvée
          setActivities([
            {
              id: "no-activity",
              type: "info",
              icon: <Clock className="h-4 w-4" />,
              description: "Aucune activité récente",
              time: "Maintenant",
              isEmpty: true,
            },
          ])
        } else {
          setActivities(sortedActivities)
        }

        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des activités:", err)
        setError("Impossible de charger les activités")

        // Utiliser des données de secours
        setActivities([
          {
            id: "error",
            type: "error",
            icon: <AlertCircle className="h-4 w-4" />,
            description: "Erreur lors du chargement des activités",
            time: "Maintenant",
            isError: true,
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadActivities()
  }, [maxItems])

  // Fonction pour formater le temps écoulé
  function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 60) return "À l'instant"
    if (diffMin < 60) return `Il y a ${diffMin} minute${diffMin > 1 ? "s" : ""}`
    if (diffHour < 24) return `Il y a ${diffHour} heure${diffHour > 1 ? "s" : ""}`
    if (diffDay < 30) return `Il y a ${diffDay} jour${diffDay > 1 ? "s" : ""}`

    return date.toLocaleDateString()
  }

  // Afficher un état de chargement
  if (isLoading) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-medium mb-3">Activité récente</h3>
        <div className="space-y-2">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center">
                    <Skeleton className="h-8 w-8 rounded-full mr-3" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-3">
        Activité récente
        {isOffline && (
          <span className="text-xs text-amber-500 ml-2 inline-flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Mode hors ligne
          </span>
        )}
      </h3>
      <div className="space-y-2">
        {activities.map((activity) => (
          <Card key={activity.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center">
                <div
                  className={`rounded-full p-2 mr-3 ${
                    activity.isError
                      ? "bg-red-100 text-red-500"
                      : activity.isGuest
                        ? "bg-blue-100 text-blue-500"
                        : activity.isEmpty
                          ? "bg-gray-100 text-gray-500"
                          : "bg-muted"
                  }`}
                >
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm">{activity.description}</div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.time}
                    {activity.isOffline && (
                      <>
                        <span className="mx-1">•</span>
                        <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                        <span className="text-amber-500">Données hors ligne</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p>Aucune activité récente</p>
          </div>
        )}
      </div>
    </div>
  )
}
