"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, LogOut } from "lucide-react"

export default function DashboardDirectPage() {
  const [userInfo, setUserInfo] = useState<{ email: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Récupérer les informations de l'utilisateur depuis le cookie user-info
    try {
      const cookies = document.cookie.split(";").map((cookie) => cookie.trim())
      const userInfoCookie = cookies.find((cookie) => cookie.startsWith("user-info="))

      if (userInfoCookie) {
        const userInfoValue = userInfoCookie.split("=")[1]
        const userInfo = JSON.parse(decodeURIComponent(userInfoValue))
        setUserInfo(userInfo)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des informations utilisateur:", error)
    }

    setIsLoading(false)
  }, [])

  const handleLogout = () => {
    // Supprimer les cookies
    document.cookie = "app-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "has-subscription=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    document.cookie = "user-info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

    // Rediriger vers la page de connexion
    window.location.href = "/login"
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>

      {userInfo && <p className="text-gray-400 mb-8">Bienvenue, {userInfo.email}</p>}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Abonnement actif</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-emerald-500 font-medium mb-2">Vous avez accès à toutes les fonctionnalités premium</p>
          <p className="text-xl font-bold mb-4">Plan Pro</p>
          <p className="text-gray-400">
            Votre abonnement est actif et vous donne accès à toutes les fonctionnalités premium.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Portfolios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold mb-2">0</p>
            <p className="text-gray-400">Gérez vos portfolios</p>
            <Button className="mt-4 w-full">Créer un portfolio</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold mb-2">0</p>
            <p className="text-gray-400">Suivez vos transactions</p>
            <Button className="mt-4 w-full">Voir les transactions</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prédictions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold mb-2">0</p>
            <p className="text-gray-400">Analysez les prédictions</p>
            <Button className="mt-4 w-full">Voir les prédictions</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">Voir les transactions</Button>
            <Button variant="outline">Gérer le portefeuille</Button>
            <Button variant="outline">Voir les prédictions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
