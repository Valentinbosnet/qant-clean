"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, PlusCircle, Wallet, ArrowUpRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
// No Supabase import needed
import RealTimeAnalysis from "@/components/real-time-analysis"
import { popularStocks } from "@/lib/stock-service"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Fetch user data from our API instead of Supabase directly
        const response = await fetch("/api/user/profile")
        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }
        const userData = await response.json()
        setUser(userData)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching user:", error)
        setError("Failed to fetch user data")
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      // Use our API endpoint for logout instead of Supabase directly
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  // Afficher un indicateur de chargement pendant la récupération des données
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <span className="ml-2 text-gray-400">Chargement...</span>
      </div>
    )
  }

  // Afficher un message d'erreur si la récupération des données a échoué
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
          <p className="text-gray-400">Bienvenue, {user?.email || "Utilisateur"}</p>
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

      {/* Prédictions en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {popularStocks.slice(0, 6).map((symbol) => (
          <RealTimeAnalysis key={symbol} symbol={symbol} />
        ))}
      </div>

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
