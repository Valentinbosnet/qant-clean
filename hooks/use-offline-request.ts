"use client"

import { useState, useEffect, useCallback } from "react"
import { isOfflineMode, getFromOfflineCache, saveToOfflineCache, addToOfflineQueue } from "@/lib/offline-mode"

interface UseOfflineRequestOptions<T> {
  key: string
  fetcher: () => Promise<T>
  fallbackData?: T
  cacheExpiration?: number
  queueOffline?: boolean
  dependencies?: any[]
}

interface UseOfflineRequestResult<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  isOffline: boolean
  refetch: () => Promise<T | null>
  isCached: boolean
}

export function useOfflineRequest<T>({
  key,
  fetcher,
  fallbackData = null,
  cacheExpiration,
  queueOffline = true,
  dependencies = [],
}: UseOfflineRequestOptions<T>): UseOfflineRequestResult<T> {
  const [data, setData] = useState<T | null>(fallbackData)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [isCached, setIsCached] = useState<boolean>(false)
  const offline = isOfflineMode()

  const fetchData = useCallback(async (): Promise<T | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // Vérifier si nous sommes en mode hors ligne
      if (offline) {
        // Essayer de récupérer les données du cache
        const cachedData = getFromOfflineCache<T>(key)

        if (cachedData) {
          setData(cachedData)
          setIsCached(true)
          setIsLoading(false)
          return cachedData
        }

        // Si pas de données en cache, utiliser les données de secours
        setData(fallbackData)
        setIsLoading(false)
        return fallbackData
      }

      // Si nous sommes en ligne, récupérer les données
      const result = await fetcher()

      // Sauvegarder les données dans le cache
      saveToOfflineCache(key, result, cacheExpiration)

      setData(result)
      setIsCached(false)
      setIsLoading(false)
      return result
    } catch (err) {
      console.error(`Erreur lors de la récupération des données pour ${key}:`, err)

      // En cas d'erreur, essayer de récupérer les données du cache
      const cachedData = getFromOfflineCache<T>(key)

      if (cachedData) {
        setData(cachedData)
        setIsCached(true)
        setIsLoading(false)
        return cachedData
      }

      // Si l'option est activée, ajouter la requête à la file d'attente
      if (queueOffline) {
        addToOfflineQueue("fetch", { key, timestamp: Date.now() })
      }

      setError(err instanceof Error ? err : new Error(String(err)))
      setData(fallbackData)
      setIsLoading(false)
      return fallbackData
    }
  }, [key, fetcher, fallbackData, cacheExpiration, queueOffline, offline])

  useEffect(() => {
    fetchData()
  }, [fetchData, ...dependencies])

  return {
    data,
    isLoading,
    error,
    isOffline: offline,
    refetch: fetchData,
    isCached,
  }
}
