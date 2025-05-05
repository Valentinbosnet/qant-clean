"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, PlusCircle, Wallet, ArrowUpRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardBypassPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simuler un chargement
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Gérer la déconnexion
  const handleLogout = () => {
    // Supprimer tous les cookies
    document.cookie = "app-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "has-subscription=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "user-info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

    // Rediriger vers la page de connexion
    router.push("/login")
  }

  // Si en cours de chargement, afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-2 text-gray-400">Chargement...</span>
      </div>
    )
  }

  // Afficher le tableau de bord sans vérification d'authentification
  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
          <p className="text-gray-400">Bienvenue sur votre tableau de bord</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
            onClick={() => router.refresh()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardHeader>
          <CardTitle className="text-white">Abonnement actif</CardTitle>
          <CardDescription>Vous avez accès à toutes les fonctionnalités premium</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-emerald-400 font-medium">Plan Pro</p>
          <p className="text-gray-400 mt-2">
            Votre abonnement est actif et vous donne accès à toutes les fonctionnalités premium.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Portfolios</CardTitle>
            <CardDescription>Gérez vos portfolios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">0</div>
              <Wallet className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
          <CardContent className="pt-0">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              <PlusCircle className="h-4 w-4 mr-2" />
              Créer un portfolio
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Transactions</CardTitle>
            <CardDescription>Suivez vos transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">0</div>
              <ArrowUpRight className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
          <CardContent className="pt-0">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Voir les transactions</Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Prédictions</CardTitle>
            <CardDescription>Analysez les prédictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">0</div>
              <PlusCircle className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
          <CardContent className="pt-0">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Voir les prédictions</Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Actions rapides</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Button onClick={() => router.push("/transactions")}>Voir les transactions</Button>
          <Button onClick={() => router.push("/portfolio")}>Gérer le portefeuille</Button>
          <Button onClick={() => router.push("/predictions")}>Voir les prédictions</Button>
        </div>
      </div>
    </div>
  )
}
