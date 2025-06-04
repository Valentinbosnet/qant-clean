"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider" // Assurez-vous que ce chemin est correct
import { AuthProvider } from "@/contexts/auth-context" // Assurez-vous que ce chemin est correct
import { Toaster } from "@/components/ui/toaster" // Assurez-vous que ce chemin est correct
import { useEffect } from "react"
// import { initOfflineMode } from "@/lib/offline-mode" // Décommentez si utilisé
// import { initPrefetchService } from "@/lib/prefetch-service" // Décommentez si utilisé

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // initOfflineMode(); // Décommentez si utilisé
    // const cleanupPrefetch = initPrefetchService(); // Décommentez si utilisé

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
    // return () => { // Décommentez si utilisé
    //   cleanupPrefetch();
    // };
  }, [])

  return (
    // SessionProvider doit être à un niveau assez haut pour envelopper tous les composants qui utilisent useSession
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AuthProvider>
          {" "}
          {/* Votre AuthProvider personnalisé */}
          {children}
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
