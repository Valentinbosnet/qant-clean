"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export function AuthStatus() {
  const { user, isLoading, isInitialized, isAuthenticated } = useAuth()
  const router = useRouter()
  const [retryCount, setRetryCount] = useState(0)
  const [showFallback, setShowFallback] = useState(false)

  // Effet pour afficher un fallback si le chargement prend trop de temps
  useEffect(() => {
    if (isLoading && !isInitialized) {
      const timer = setTimeout(() => {
        setShowFallback(true)
      }, 3000) // Afficher le fallback après 3 secondes de chargement

      return () => clearTimeout(timer)
    }
  }, [isLoading, isInitialized])

  // Fonction pour forcer le rafraîchissement de l'état d'authentification
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    setShowFallback(false)
    window.location.reload() // Forcer le rechargement de la page
  }

  // Si l'initialisation n'est pas terminée et que le fallback n'est pas affiché, afficher un squelette
  if ((isLoading || !isInitialized) && !showFallback) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-24" />
      </div>
    )
  }

  // Si le fallback est affiché, proposer de réessayer
  if (showFallback) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleRetry} className="flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          Réessayer
        </Button>
      </div>
    )
  }

  // Si l'utilisateur est authentifié, afficher le menu utilisateur
  if (isAuthenticated && user) {
    return <UserMenu user={user} />
  }

  // Sinon, afficher les boutons de connexion/inscription
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => router.push("/auth")}>
        Se connecter
      </Button>
      <Button size="sm" onClick={() => router.push("/auth?tab=signup")}>
        S'inscrire
      </Button>
    </div>
  )
}
