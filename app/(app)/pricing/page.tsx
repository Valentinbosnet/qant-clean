"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [priceIds, setPriceIds] = useState<{ premium: string | undefined; pro: string | undefined }>({
    premium: undefined,
    pro: undefined,
  })

  // Charger les IDs de prix sans les afficher
  useEffect(() => {
    const premiumPriceId = process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID
    const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID

    // Uniquement pour le débogage dans la console
    console.log("IDs de prix Stripe:", {
      premium: premiumPriceId,
      pro: proPriceId,
    })

    setPriceIds({
      premium: premiumPriceId,
      pro: proPriceId,
    })
  }, [])

  const handleSubscribe = async (plan: string) => {
    setLoading(plan)
    setError(null)

    try {
      // En mode développement, utiliser une approche simplifiée
      if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_USE_MOCK_PAYMENTS === "true") {
        console.log("Mode développement: simulation d'un abonnement réussi")

        // Appeler l'API pour marquer l'utilisateur comme ayant un abonnement
        const response = await fetch("/api/dev/mock-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan,
          }),
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la création de l'abonnement simulé")
        }

        // Rediriger vers le tableau de bord
        router.push("/dashboard?subscription=success")
        return
      }

      // Déterminer l'ID de prix en fonction du plan sélectionné
      const priceId = plan === "premium" ? priceIds.premium : priceIds.pro

      console.log(`Plan sélectionné: ${plan}, ID de prix utilisé: ${priceId}`)

      if (!priceId) {
        throw new Error(`ID de prix non défini pour le plan ${plan}`)
      }

      // Créer une session de paiement avec Stripe
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?subscription=success`,
          cancelUrl: `${window.location.origin}/pricing?subscription=canceled`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la création de la session de paiement")
      }

      const data = await response.json()

      if (data.url) {
        // Rediriger vers la page de paiement Stripe
        window.location.href = data.url
      } else {
        throw new Error("URL de redirection manquante")
      }
    } catch (error) {
      console.error("Erreur:", error)
      setError(error instanceof Error ? error.message : "Une erreur s'est produite")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Choisissez votre abonnement</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Accédez à toutes les fonctionnalités premium avec un abonnement adapté à vos besoins
          </p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Plan Gratuit */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Gratuit</CardTitle>
              <div className="text-3xl font-bold">0€</div>
              <CardDescription>Pour commencer</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Accès limité aux prédictions</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Données historiques basiques</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>1 portefeuille virtuel</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => handleSubscribe("free")}>
                Continuer avec le plan gratuit
              </Button>
            </CardFooter>
          </Card>

          {/* Plan Premium */}
          <Card className="border-emerald-500 dark:border-emerald-700 shadow-md relative">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
              Populaire
            </div>
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <div className="text-3xl font-bold">9,99€</div>
              <CardDescription>par mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-emerald-500" />
                  <span>Prédictions illimitées</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-emerald-500" />
                  <span>Analyse technique avancée</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-emerald-500" />
                  <span>5 portefeuilles virtuels</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-emerald-500" />
                  <span>Alertes personnalisées</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleSubscribe("premium")}
                disabled={loading === "premium"}
              >
                {loading === "premium" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  "S'abonner"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Plan Pro */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <div className="text-3xl font-bold">19,99€</div>
              <CardDescription>par mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Tout ce qui est inclus dans Premium</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Analyse prédictive en temps réel</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Portefeuilles virtuels illimités</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>Support prioritaire</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>API d'accès aux données</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleSubscribe("pro")} disabled={loading === "pro"}>
                {loading === "pro" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  "S'abonner"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Tous les abonnements sont facturés mensuellement. Vous pouvez annuler à tout moment.
            <br />
            Des questions ? Contactez notre{" "}
            <a href="/help" className="text-emerald-600 hover:underline">
              support client
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
