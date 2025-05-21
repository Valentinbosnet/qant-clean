"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function WelcomeWidget({ config }: { config: any }) {
  // Extraire les paramètres de manière sécurisée
  const settings = config?.settings && typeof config.settings === "object" ? config.settings : {}

  // Utiliser des valeurs primitives pour les paramètres
  const showGetStarted = settings.showGetStarted === true
  const showSignup = settings.showSignup === true

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
    <div className="p-4 space-y-4">
      <h3 className="text-2xl font-bold">
        {isAuthenticated ? `Bienvenue, ${userName || "Investisseur"}!` : "Bienvenue sur Stock Dashboard"}
      </h3>
      <p className="text-muted-foreground">
        {isAuthenticated
          ? "Suivez vos investissements, analysez les tendances du marché et prenez des décisions éclairées grâce à notre plateforme d'analyse boursière."
          : "Découvrez notre plateforme d'analyse boursière pour suivre les marchés, obtenir des prédictions IA et prendre de meilleures décisions d'investissement."}
      </p>

      {showGetStarted && isAuthenticated && (
        <Button variant="default" className="mt-4">
          Tableau de bord <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}

      {showSignup && !isAuthenticated && (
        <div className="flex flex-wrap gap-3">
          <Button variant="default" className="mt-4" asChild>
            <a href="/auth">
              Créer un compte <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" className="mt-4" asChild>
            <a href="/search">Explorer sans compte</a>
          </Button>
        </div>
      )}
    </div>
  )
}
