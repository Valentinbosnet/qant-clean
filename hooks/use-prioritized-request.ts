"use client"

import { useState, useEffect } from "react"
import { CachePriority, getFromOfflineCache, isOfflineMode, saveToOfflineCache } from "@/lib/offline-mode"

interface UsePrioritizedRequestOptions<T> {
  key: string
  fetcher: () => Promise<T>
  priority?: CachePriority
  type?: string
  category?: string
  tags?: string[]
  expiration?: number
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
}

export function usePrioritizedRequest<T = any>({
  key,
  fetcher,
  priority = CachePriority.MEDIUM,
  type = "json",
  category,
  tags,
  expiration,
  revalidateOnFocus = false,
  revalidateOnReconnect = true,
}: UsePrioritizedRequestOptions<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isValidating, setIsValidating] = useState(false)

  const fetchData = async (shouldCache = true) => {
    setIsValidating(true)

    try {
      // Essayer de récupérer les données depuis le cache
      const cachedData = getFromOfflineCache<T>(key)

      // Si nous sommes hors ligne et que nous avons des données en cache, les utiliser
      if (isOfflineMode() && cachedData) {
        setData(cachedData)
        setIsLoading(false)
        setIsValidating(false)
        return
      }

      // Si nous avons des données en cache, les utiliser immédiatement
      if (cachedData) {
        setData(cachedData)
        setIsLoading(false)
      }

      // Si nous sommes en ligne, récupérer les données fraîches
      if (navigator.onLine) {
        const freshData = await fetcher()
        setData(freshData)

        // Mettre en cache les données avec la priorité spécifiée
        if (shouldCache) {
          saveToOfflineCache(key, freshData, {
            type,
            priority,
            category,
            tags,
            expiration,
          })
        }
      } else if (!cachedData) {
        // Si nous sommes hors ligne et que nous n'avons pas de données en cache, lever une erreur
        throw new Error("Vous êtes hors ligne et aucune donnée n'est disponible dans le cache.")
      }

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
      setIsValidating(false)
    }
  }

  // Revalider les données
  const revalidate = () => fetchData()

  // Effet initial pour charger les données
  useEffect(() => {
    fetchData()
  }, [key])

  // Effet pour revalider les données lorsque la fenêtre reprend le focus
  useEffect(() => {
    if (!revalidateOnFocus) return

    const handleFocus = () => {
      if (!isValidating) {
        fetchData()
      }
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [revalidateOnFocus, isValidating])

  // Effet pour revalider les données lorsque la connexion est rétablie
  useEffect(() => {
    if (!revalidateOnReconnect) return

    const handleOnline = () => {
      if (!isValidating) {
        fetchData()
      }
    }

    window.addEventListener("online", handleOnline)
    return () => window.removeEventListener("online", handleOnline)
  }, [revalidateOnReconnect, isValidating])

  return {
    data,
    error,
    isLoading,
    isValidating,
    revalidate,
  }
}
