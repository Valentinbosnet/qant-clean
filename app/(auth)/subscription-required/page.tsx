"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, Shield, Zap, BarChart3, Lock, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SubscriptionRequiredPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [devMode, setDevMode] = useState(false)

  useEffect(() => {
    // Vérifier si l'environnement est en développement
    if (process.env.NODE_ENV === "development") {
      setDevMode(true)
    }

    // Vérifier si l'utilisateur est déjà authentifié
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    // Vérifier si l'utilisateur a déjà un abonnement
    const checkSubscription = async () => {
      try {
        const response = await fetch("/api/user/check-subscription")

        // Vérifier si la réponse est du JSON valide
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error("La réponse n'est pas du JSON valide:", await response.text())
          setCheckingStatus(false)
          return
        }

        const data = await response.json()

        if (data.hasSubscription) {
          // Si l'utilisateur a déjà un abonnement, rediriger vers le dashboard
          router.push("/dashboard")
          return
        }

        setCheckingStatus(false)
      } catch (error) {
        console.error("Erreur lors de la vérification de l'abonnement:", error)
        setCheckingStatus(false)
      }
    }

    if (status === "authenticated") {
      checkSubscription()
    } else {
      setCheckingStatus(false)
    }
  }, [status, router])

  const handleSelectPlan = (plan: string) => {
    setSelectedPlan(plan)
    setError(null)
  }

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      setError("Veuillez sélectionner un plan d'abonnement")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // En mode développement, utiliser une approche simplifiée
      if (devMode) {
        // Simuler un abonnement réussi
        console.log("Mode développement: simulation d'un abonnement réussi")

        // Appeler l'API pour marquer l'utilisateur comme ayant un abonnement
        await fetch("/api/dev/mock-subscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan: selectedPlan,
          }),
        })

        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
        return
      }

      // Créer une session de paiement avec Stripe
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: selectedPlan,
          returnUrl: `${window.location.origin}/dashboard`,
        }),
      })

      // Vérifier si la réponse est du JSON valide
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("La réponse n'est pas du JSON valide:", text)
        throw new Error("Erreur serveur: réponse non valide")
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de la session de paiement")
      }

      // Rediriger vers la page de paiement Stripe
      window.location.href = data.url
    } catch (error) {
      console.error("Erreur:", error)
      setError(error instanceof Error ? error.message : "Une erreur s'est produite")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || checkingStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-emerald-500">Vérification de votre statut...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Choisissez votre plan</h1>
          <p className="mt-2 text-gray-400">
            Sélectionnez un plan qui correspond à vos besoins pour accéder à toutes les fonctionnalités.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Plan Premium */}
          <Card
            className={`border-2 transition-all ${
              selectedPlan === "premium"
                ? "border-emerald-500 bg-gray-800"
                : "border-gray-700 bg-gray-800 hover:border-gray-600"
            }`}
            onClick={() => handleSelectPlan("premium")}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-white">Premium</CardTitle>
                {selectedPlan === "premium" && <CheckCircle className="h-6 w-6 text-emerald-500" />}
              </div>
              <CardDescription className="text-gray-400">Pour les investisseurs actifs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-white">
                100€ <span className="text-lg font-normal text-gray-400">/mois</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                  <span className="text-gray-300">Analyses techniques avancées</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                  <span className="text-gray-300">Prédictions sur 50 actifs par jour</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                  <span className="text-gray-300">5 portfolios avec 250 000€ de capital virtuel</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                  <span className="text-gray-300">Alertes de prix personnalisées</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                  <span className="text-gray-300">Support par email sous 24h</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full ${
                  selectedPlan === "premium" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() => handleSelectPlan("premium")}
              >
                Sélectionner
              </Button>
            </CardFooter>
          </Card>

          {/* Plan Pro */}
          <Card
            className={`border-2 transition-all ${
              selectedPlan === "pro"
                ? "border-emerald-500 bg-gray-800"
                : "border-gray-700 bg-gray-800 hover:border-gray-600"
            }`}
            onClick={() => handleSelectPlan("pro")}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-white">Pro</CardTitle>
                {selectedPlan === "pro" && <CheckCircle className="h-6 w-6 text-emerald-500" />}
              </div>
              <CardDescription className="text-gray-400">Pour les traders professionnels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-white">
                300€ <span className="text-lg font-normal text-gray-400">/mois</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                  <span className="text-gray-300">Tout ce qui est inclus dans Premium</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                  <span className="text-gray-300">Analyses fondamentales détaillées</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                  <span className="text-gray-300">Prédictions illimitées sur tous les actifs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                  <span className="text-gray-300">Portfolios illimités avec 1 000 000€ de capital</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                  <span className="text-gray-300">Backtesting sur données historiques</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                  <span className="text-gray-300">API d'accès aux données en temps réel</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 shrink-0" />
                  <span className="text-gray-300">Support prioritaire 24/7</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full ${
                  selectedPlan === "pro" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() => handleSelectPlan("pro")}
              >
                Sélectionner
              </Button>
            </CardFooter>
          </Card>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-900/30 border-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center space-y-4">
          <Button
            onClick={handleSubscribe}
            disabled={!selectedPlan || loading}
            className="w-full max-w-md bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              "Continuer vers le paiement"
            )}
          </Button>

          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <Lock className="h-4 w-4" />
            <span>Paiement sécurisé via Stripe</span>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Pourquoi choisir notre plateforme ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <Shield className="h-10 w-10 text-emerald-500 mb-3" />
              <h3 className="text-lg font-medium text-white mb-2">Précision</h3>
              <p className="text-gray-400 text-sm">
                Algorithmes d'IA avancés avec 87% de précision sur les prédictions à court terme.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Zap className="h-10 w-10 text-emerald-500 mb-3" />
              <h3 className="text-lg font-medium text-white mb-2">Rapidité</h3>
              <p className="text-gray-400 text-sm">
                Analyses en temps réel mises à jour toutes les minutes pour des décisions immédiates.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <BarChart3 className="h-10 w-10 text-emerald-500 mb-3" />
              <h3 className="text-lg font-medium text-white mb-2">Expertise</h3>
              <p className="text-gray-400 text-sm">Développé par des experts en finance quantitative et en IA.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
