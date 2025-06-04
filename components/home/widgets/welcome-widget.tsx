"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WelcomeWidget() {
  const { data: session } = useSession()
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Simuler le chargement des données utilisateur
    const timer = setTimeout(() => {
      setUserName("Investisseur")
      setIsAuthenticated(false)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Afficher un état de chargement
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-10 w-32" />
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {session ? `Bienvenue, ${session.user.name || "Investisseur"}!` : "Bienvenue sur Stock Dashboard"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          {session
            ? "Vous êtes connecté. Découvrez nos dernières fonctionnalités."
            : "Connectez-vous pour accéder à toutes les fonctionnalités. Découvrez notre plateforme d'analyse boursière pour suivre les marchés, obtenir des prédictions IA et prendre de meilleures décisions d'investissement."}
        </p>
      </CardContent>
    </Card>
  )
}
