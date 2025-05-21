"use client"

import { useState, useCallback, useEffect } from "react"

interface RequestOptions<T> {
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  retries?: number
  retryDelay?: number
  timeout?: number
}

interface RequestState<T> {
  data: T | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  isSuccess: boolean
}

export function useSafeRequest<T>(requestFn: () => Promise<T>, options: RequestOptions<T> = {}) {
  const { initialData = null, onSuccess, onError, retries = 3, retryDelay = 1000, timeout = 10000 } = options

  const [state, setState] = useState<RequestState<T>>({
    data: initialData as T | null,
    isLoading: true,
    isError: false,
    error: null,
    isSuccess: false,
  })

  const [retryCount, setRetryCount] = useState(0)
  const [shouldRetry, setShouldRetry] = useState(false)

  const executeRequest = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, isError: false, error: null }))

    // Créer un timeout pour la requête
    const timeoutId = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isError: true,
        error: new Error("La requête a expiré"),
      }))

      if (retryCount < retries) {
        setShouldRetry(true)
      } else if (onError) {
        onError(new Error("La requête a expiré après plusieurs tentatives"))
      }
    }, timeout)

    try {
      const data = await requestFn()
      clearTimeout(timeoutId)

      setState({
        data,
        isLoading: false,
        isError: false,
        error: null,
        isSuccess: true,
      })

      if (onSuccess) {
        onSuccess(data)
      }
    } catch (error) {
      clearTimeout(timeoutId)

      setState({
        data: null,
        isLoading: false,
        isError: true,
        error: error instanceof Error ? error : new Error(String(error)),
        isSuccess: false,
      })

      if (retryCount < retries) {
        setShouldRetry(true)
      } else if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)))
      }
    }
  }, [requestFn, retryCount, retries, timeout, onSuccess, onError])

  // Effet pour gérer les retries
  useEffect(() => {
    if (shouldRetry) {
      const retryTimer = setTimeout(
        () => {
          setRetryCount((prev) => prev + 1)
          setShouldRetry(false)
          executeRequest()
        },
        retryDelay * (retryCount + 1),
      ) // Délai exponentiel

      return () => clearTimeout(retryTimer)
    }
  }, [shouldRetry, retryCount, retryDelay, executeRequest])

  // Exécuter la requête initiale
  useEffect(() => {
    executeRequest()
  }, [executeRequest])

  // Fonction pour forcer une nouvelle requête
  const refetch = useCallback(() => {
    setRetryCount(0)
    setShouldRetry(false)
    executeRequest()
  }, [executeRequest])

  return {
    ...state,
    refetch,
    retryCount,
  }
}
