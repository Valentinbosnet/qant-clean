"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Vérifier l'état initial du réseau
    setIsOnline(navigator.onLine)

    // Écouter les changements d'état du réseau
    const handleOnline = () => {
      setIsOnline(true)
      // Masquer après un délai si nous revenons en ligne
      setTimeout(() => setIsVisible(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setIsVisible(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Vérifier la connectivité au serveur Supabase
    const checkServerConnectivity = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (!supabaseUrl) return

        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: "HEAD",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          console.warn("Problème de connexion au serveur Supabase")
          setIsVisible(true)
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la connectivité:", error)
        setIsVisible(true)
      }
    }

    // Vérifier la connectivité au démarrage
    checkServerConnectivity()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Ne rien afficher côté serveur
  if (!isClient) return null

  // Ne rien afficher si tout va bien et que l'alerte n'est pas visible
  if (isOnline && !isVisible) return null

  return (
    <Alert variant={isOnline ? "default" : "destructive"} className="mb-4">
      {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
      <AlertTitle>{isOnline ? "Connexion rétablie" : "Problème de connexion"}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          {isOnline
            ? "Votre connexion internet a été rétablie. Vous pouvez continuer à utiliser l'application."
            : "Vous semblez être hors ligne. Vérifiez votre connexion internet et réessayez."}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (isOnline) {
              setIsVisible(false)
            } else {
              window.location.reload()
            }
          }}
          className="ml-2"
        >
          {isOnline ? "Fermer" : <RefreshCw className="h-4 w-4" />}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
