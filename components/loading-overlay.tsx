"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface LoadingOverlayProps {
  timeout?: number
  message?: string
}

export function LoadingOverlay({ timeout = 10000, message = "Chargement..." }: LoadingOverlayProps) {
  const { isLoading, isInitialized } = useAuth()
  const [showOverlay, setShowOverlay] = useState(true)
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false)

  useEffect(() => {
    // Masquer l'overlay lorsque l'initialisation est terminée
    if (!isLoading && isInitialized) {
      setShowOverlay(false)
    }

    // Afficher un message de timeout si le chargement prend trop de temps
    const timeoutTimer = setTimeout(() => {
      if (isLoading || !isInitialized) {
        setShowTimeoutMessage(true)
      }
    }, timeout)

    return () => {
      clearTimeout(timeoutTimer)
    }
  }, [isLoading, isInitialized, timeout])

  // Si l'overlay ne doit pas être affiché, ne rien rendre
  if (!showOverlay) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-card shadow-lg">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-medium">{message}</p>

        {showTimeoutMessage && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Le chargement prend plus de temps que prévu...</p>
            <button onClick={() => window.location.reload()} className="mt-2 text-sm text-primary hover:underline">
              Rafraîchir la page
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
