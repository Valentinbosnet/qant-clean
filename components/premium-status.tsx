"use client"

import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, CreditCard } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

// Type pour les niveaux premium
type PremiumTier = "free" | "basic" | "premium" | "pro"

// Type pour les props du composant
interface PremiumStatusProps {
  showIcon?: boolean
  showLabel?: boolean
  variant?: "badge" | "button" | "text"
  hideIfNotPremium?: boolean
}

// Fonction pour vérifier si un utilisateur est premium (simulée)
const checkPremiumStatus = async (userId: string): Promise<PremiumTier> => {
  // Simuler un appel API
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Pour les besoins de la démonstration, considérons que les utilisateurs dont l'ID se termine par un chiffre sont premium
  const lastChar = userId.charAt(userId.length - 1)
  const lastDigit = Number.parseInt(lastChar, 10)

  if (isNaN(lastDigit)) {
    return "free"
  }

  if (lastDigit % 3 === 0) {
    return "pro"
  }

  if (lastDigit % 2 === 0) {
    return "premium"
  }

  return "basic"
}

export function PremiumStatus({
  showIcon = true,
  showLabel = true,
  variant = "badge",
  hideIfNotPremium = false,
}: PremiumStatusProps): JSX.Element | null {
  // États locaux
  const [mounted, setMounted] = useState<boolean>(false)
  const [premiumTier, setPremiumTier] = useState<PremiumTier>("free")
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Récupération du contexte d'authentification
  const { user, isAuthenticated } = useAuth()

  // Effet pour vérifier le statut premium
  useEffect((): void => {
    setMounted(true)

    const checkStatus = async (): Promise<void> => {
      setIsLoading(true)

      try {
        if (isAuthenticated && user && user.id) {
          const tier = await checkPremiumStatus(user.id)
          setPremiumTier(tier)
        } else {
          setPremiumTier("free")
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du statut premium:", error)
        setPremiumTier("free")
      } finally {
        setIsLoading(false)
      }
    }

    checkStatus()
  }, [isAuthenticated, user])

  // Mémoriser si l'utilisateur a un abonnement premium
  const isPremium = useMemo(() => premiumTier === "premium" || premiumTier === "pro", [premiumTier])

  // Mémoriser la couleur en fonction du niveau premium
  const tierColor = useMemo((): string => {
    switch (premiumTier) {
      case "pro":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "premium":
        return "bg-amber-100 text-amber-800 border-amber-300"
      case "basic":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }, [premiumTier])

  // Mémoriser le texte du label en fonction du niveau premium
  const tierLabel = useMemo((): string => {
    switch (premiumTier) {
      case "pro":
        return "Pro"
      case "premium":
        return "Premium"
      case "basic":
        return "Basic"
      default:
        return "Free"
    }
  }, [premiumTier])

  // Mémoriser le badge premium pour éviter des recréations inutiles
  const premiumBadge = useMemo(
    () => (
      <Badge variant="outline" className={tierColor}>
        {showIcon && <Crown className="h-3 w-3 mr-1" />}
        {showLabel && tierLabel}
      </Badge>
    ),
    [tierColor, tierLabel, showIcon, showLabel],
  )

  // Mémoriser le bouton d'upgrade pour éviter des recréations inutiles
  const upgradeButton = useMemo(
    () => (
      <Button asChild size="sm" variant="outline" className="flex items-center gap-1">
        <Link href="/pricing">
          <CreditCard className="h-3 w-3 mr-1" />
          Passer à Premium
        </Link>
      </Button>
    ),
    [],
  )

  // Mémoriser le texte premium pour éviter des recréations inutiles
  const premiumText = useMemo(
    () => (
      <span className={`text-sm font-medium ${isPremium ? "text-amber-600" : "text-gray-600"}`}>
        {showIcon && <Crown className="h-3 w-3 inline-block mr-1" />}
        {tierLabel}
      </span>
    ),
    [isPremium, tierLabel, showIcon],
  )

  // Si le composant n'est pas monté ou si les données sont en cours de chargement, ne rien afficher
  if (!mounted || isLoading) {
    return null
  }

  // Si l'utilisateur n'est pas premium et que hideIfNotPremium est true, ne rien afficher
  if (!isPremium && hideIfNotPremium) {
    return null
  }

  // Rendu en fonction du variant
  switch (variant) {
    case "button":
      return isPremium ? premiumBadge : upgradeButton
    case "text":
      return premiumText
    default:
      return premiumBadge
  }
}
