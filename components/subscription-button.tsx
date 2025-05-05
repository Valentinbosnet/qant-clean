"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface SubscriptionButtonProps {
  priceId: string
  label: string
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link"
  className?: string
}

export function SubscriptionButton({ priceId, label, variant = "default", className }: SubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Créer une session de paiement
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/pricing?payment=cancelled`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de la session de paiement")
      }

      // Rediriger vers la page de paiement Stripe
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("URL de paiement manquante")
      }
    } catch (error) {
      console.error("Erreur:", error)
      setError(error instanceof Error ? error.message : "Une erreur s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button onClick={handleSubscribe} disabled={isLoading} variant={variant} className={className}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Chargement...
          </>
        ) : (
          label
        )}
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </>
  )
}
