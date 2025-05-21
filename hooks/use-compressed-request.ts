"use client"

import { useState, useEffect, useCallback } from "react"
import { getFromOfflineCache, saveToOfflineCache, isOfflineMode, getOfflineSettings } from "@/lib/offline-mode"
import { estimateCompressionRatio } from "@/lib/compression-utils"

interface UseCompressedRequestOptions {
  cacheKey?: string
  cacheDuration?: number
  compressionThreshold?: number
  priority?: boolean
  dataType?: string
}

export function useCompressedRequest<T = any>(url: string, options: UseCompressedRequestOptions = {}) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [cacheInfo, setCacheInfo] = useState<{
    fromCache: boolean
    compressionRatio?: number
    originalSize?: number
    compressedSize?: number
  }>({ fromCache: false })

  const { cacheKey = url, cacheDuration, compressionThreshold, priority = false, dataType = "json" } = options

  const fetchData = useCallback(
    async (force = false) => {
      setIsLoading(true)
      setError(null)

      try {
        // Vérifier si les données sont en cache et si on n'est pas en mode force
        if (!force) {
          const cachedData = getFromOfflineCache<T>(cacheKey)
          if (cachedData) {
            setData(cachedData)
            setCacheInfo({ fromCache: true })
            setIsLoading(false)
            return
          }
        }

        // Si nous sommes en mode hors ligne et qu'il n'y a pas de données en cache
        if (isOfflineMode() && !force) {
          throw new Error("Vous êtes en mode hors ligne et ces données ne sont pas disponibles en cache.")
        }

        // Faire la requête
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const jsonData = await response.json()
        setData(jsonData)
        setCacheInfo({ fromCache: false })

        // Mettre en cache les données avec compression si nécessaire
        const settings = getOfflineSettings()
        const threshold = compressionThreshold || settings.compressionThreshold

        // Estimer le taux de compression
        const compressionInfo = estimateCompressionRatio(jsonData)
        setCacheInfo({
          fromCache: false,
          compressionRatio: compressionInfo.ratio,
          originalSize: compressionInfo.original,
          compressedSize: compressionInfo.compressed,
        })

        // Sauvegarder dans le cache
        saveToOfflineCache(cacheKey, jsonData, {
          expiration: cacheDuration,
          type: dataType,
          priority,
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    },
    [url, cacheKey, cacheDuration, compressionThreshold, priority, dataType],
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    error,
    isLoading,
    refetch: () => fetchData(true),
    cacheInfo,
  }
}
