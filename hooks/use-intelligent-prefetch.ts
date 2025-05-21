"use client"

import { useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import {
  trackRouteVisit,
  prefetchPredictedRoutes,
  markPrefetchedItemAsUsed,
  getPrefetchConfig,
} from "@/lib/prefetch-service"
import { getFromOfflineCache } from "@/lib/offline-mode"

interface PrefetchDataFetcher {
  route: string
  fetcher: () => Promise<{ key: string; data: any; type?: string; category?: string; tags?: string[] }[]>
}

export function useIntelligentPrefetch(dataFetchers: PrefetchDataFetcher[] = []) {
  const pathname = usePathname()

  // Suivre la visite de la route actuelle
  useEffect(() => {
    if (pathname) {
      trackRouteVisit(pathname)
    }
  }, [pathname])

  // Précharger les données pour les routes prédites
  useEffect(() => {
    if (!pathname) return

    const config = getPrefetchConfig()
    if (!config.enabled) return

    // Convertir les fetchers en un objet pour faciliter l'accès
    const fetchersMap: Record<string, () => Promise<any[]>> = {}
    dataFetchers.forEach((df) => {
      fetchersMap[df.route] = df.fetcher
    })

    // Précharger les données
    const prefetchData = async () => {
      await prefetchPredictedRoutes(pathname, fetchersMap)
    }

    // Précharger après un court délai pour ne pas bloquer le rendu
    const timeoutId = setTimeout(prefetchData, 2000)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [pathname, dataFetchers])

  // Fonction pour récupérer des données avec marquage d'utilisation
  const getDataWithTracking = useCallback((key: string): any | null => {
    const data = getFromOfflineCache<any>(key)
    if (data) {
      // Marquer l'élément comme utilisé pour améliorer les statistiques
      markPrefetchedItemAsUsed(key)
    }
    return data
  }, [])

  return {
    getDataWithTracking,
  }
}
