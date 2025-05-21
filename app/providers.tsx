"use client"

import type React from "react"

import { useEffect } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { initOfflineMode } from "@/lib/offline-mode"
import { initPrefetchService } from "@/lib/prefetch-service"

export function Providers({ children }: { children: React.ReactNode }) {
  // Initialiser le mode hors ligne et le préchargement
  useEffect(() => {
    // Initialiser le mode hors ligne
    initOfflineMode()

    // Initialiser le service de préchargement
    const cleanupPrefetch = initPrefetchService()

    // Enregistrer le service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {
            console.log("Service Worker enregistré avec succès:", registration)
          })
          .catch((error) => {
            console.error("Erreur lors de l'enregistrement du Service Worker:", error)
          })
      })
    }

    // Nettoyer lors du démontage
    return () => {
      cleanupPrefetch()
    }
  }, [])

  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  )
}
