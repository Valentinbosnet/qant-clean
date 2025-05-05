"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface Subscription {
  id: string
  status: string
  priceId: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

export default function SubscriptionPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSubscription() {
      try {
        const response = await fetch("/api/user/subscription")
        if (!response.ok) {
          throw new Error("Erreur lors du chargement de l'abonnement")
        }
        const data = await response.json()
        setSubscription(data.subscription)
      } catch (error) {
        console.error("Erreur:", error)
        setError("Impossible de charger les informations d'abonnement")
      } finally {
        setLoading(false)
      }
    }

    loadSubscription()
  }, [])

  const handleManageSubscription = async () => {
    setActionLoading("manage")
    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Erreur lors de la création de la session du portail")
      }
      const data = await response.json()
      window.location.href = data.url
    } catch (error) {
      console.error("Erreur:", error)
      setError("Impossible de créer la session du portail")
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpgrade = () => {
    router.push("/pricing")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement de votre abonnement...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Gestion de l'abonnement</h1>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {!subscription || subscription.status !== "active" ? (
          <Card>
            <CardHeader>
              <CardTitle>Aucun abonnement actif</CardTitle>
              <CardDescription>Vous n'avez pas d'abonnement actif actuellement.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Abonnez-vous pour accéder à toutes les fonctionnalités premium de notre plateforme.
              </p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleUpgrade}>Voir les offres d'abonnement</Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Votre abonnement</CardTitle>
              <CardDescription>Détails de votre abonnement actuel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</div>
                  <div className="text-lg font-semibold">
                    {subscription.priceId.includes("premium") ? "Premium" : "Pro"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut</div>
                  <div className="text-lg font-semibold capitalize">
                    {subscription.status === "active" ? (
                      <span className="text-green-600">Actif</span>
                    ) : (
                      <span className="text-red-600">{subscription.status}</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Période actuelle</div>
                  <div className="text-lg font-semibold">
                    Jusqu'au {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                </div>
                {subscription.cancelAtPeriodEnd && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded">
                    Votre abonnement sera annulé à la fin de la période actuelle.
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleManageSubscription} disabled={actionLoading === "manage"}>
                {actionLoading === "manage" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  "Gérer l'abonnement"
                )}
              </Button>
              <Button variant="outline" onClick={handleUpgrade}>
                Changer de plan
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
