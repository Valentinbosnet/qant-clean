"use client"

import { useEffect, useState } from "react"
import { StockGrid } from "@/components/stock-grid"
import { StockDetailModal } from "@/components/stock-detail-modal"
import { ApiStatus } from "@/components/api-status"
import { Badge } from "@/components/ui/badge"
import { Database, TrendingUp, User, Star } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useFavorites } from "@/hooks/use-favorites"

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { favorites, isLoading: favoritesLoading } = useFavorites()
  const [greeting, setGreeting] = useState("Bonjour")

  // Définir le message de salutation en fonction de l'heure
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) {
      setGreeting("Bonjour")
    } else if (hour < 18) {
      setGreeting("Bon après-midi")
    } else {
      setGreeting("Bonsoir")
    }
  }, [])

  return (
    <main className="container mx-auto px-4 py-8">
      {isAuthenticated && !isLoading && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                {greeting}, {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Investisseur"}
              </h2>
              <p className="text-muted-foreground">Bienvenue sur votre tableau de bord personnel</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Mon profil
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/favorites">
                  <Star className="h-4 w-4 mr-2" />
                  Mes favoris ({favoritesLoading ? "..." : favorites.length})
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Stock Dashboard</h1>
        <div className="flex items-center gap-2">
          <p className="text-gray-500">Suivez les performances des actions populaires</p>
          <Badge variant="outline" className="bg-gradient-to-r from-amber-500 to-amber-300 text-white border-0">
            Premium
          </Badge>
        </div>
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <Database className="h-3 w-3 mr-1" />
          <span>Utilisation du cache local pour réduire les appels API</span>
        </div>
      </div>

      {!isAuthenticated && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Suivez vos actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Accédez à des données en temps réel et suivez les performances de vos actions préférées.</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/auth">Commencer</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-amber-500" />
                Créez votre liste de favoris
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Enregistrez vos actions préférées et accédez-y rapidement depuis votre tableau de bord personnel.</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/auth">S'inscrire</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Personnalisez votre expérience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Adaptez l'interface à vos besoins et recevez des notifications personnalisées.</p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/auth">Créer un compte</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <ApiStatus />
      <StockGrid />
      <StockDetailModal />

      <footer className="text-center mt-16 mb-8 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Stock Dashboard. Toutes les données sont fournies par Alpha Vantage.
        <div className="mt-2">
          <span className="text-xs">
            Utilisation de l'API gratuite (25 requêtes/jour) avec mise en cache locale.
            <a
              href="https://www.alphavantage.co/premium/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline"
            >
              Passer à la version premium
            </a>
          </span>
        </div>
      </footer>
    </main>
  )
}
