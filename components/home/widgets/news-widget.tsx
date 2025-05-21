"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Clock, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import type { HomeWidgetConfig } from "@/lib/home-widgets-service"

interface NewsWidgetProps {
  config: HomeWidgetConfig
}

export function NewsWidget({ config }: NewsWidgetProps) {
  const { settings } = config
  const maxItems = settings?.maxItems || 4
  const category = settings?.category || "general" // Options: general, business, technology

  const [newsItems, setNewsItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadNews() {
      try {
        setIsLoading(true)

        // Essayer de récupérer les actualités depuis l'API
        const response = await fetch(`/api/news?category=${category}&limit=${maxItems}`)

        if (!response.ok) {
          throw new Error("Impossible de récupérer les actualités")
        }

        const data = await response.json()
        setNewsItems(data.articles || [])
        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des actualités:", err)

        // En cas d'erreur, utiliser des données de secours
        const fallbackNews = [
          {
            id: 1,
            title: "La Fed maintient ses taux d'intérêt inchangés",
            source: "Financial Times",
            time: "Il y a 2 heures",
            url: "#",
            isFallback: true,
          },
          {
            id: 2,
            title: "Apple dévoile son nouveau produit révolutionnaire",
            source: "TechCrunch",
            time: "Il y a 5 heures",
            url: "#",
            isFallback: true,
          },
          {
            id: 3,
            title: "Les marchés européens en hausse suite aux données économiques positives",
            source: "Bloomberg",
            time: "Il y a 8 heures",
            url: "#",
            isFallback: true,
          },
          {
            id: 4,
            title: "Tesla dépasse les attentes de livraison au T2",
            source: "CNBC",
            time: "Il y a 1 jour",
            url: "#",
            isFallback: true,
          },
        ]

        setNewsItems(fallbackNews.slice(0, maxItems))
        setError("Utilisation de données hors ligne")
      } finally {
        setIsLoading(false)
      }
    }

    loadNews()
  }, [maxItems, category])

  // Afficher un état de chargement
  if (isLoading) {
    return (
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">Actualités financières</h3>
        <div className="space-y-2">
          {Array(maxItems)
            .fill(0)
            .map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-2 sm:p-3">
                  <Skeleton className="h-5 w-full mb-2" />
                  <div className="flex items-center">
                    <Skeleton className="h-3 w-20 mr-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
        Actualités financières
        {error && (
          <span className="text-xs text-amber-500 ml-2 inline-flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {error}
          </span>
        )}
      </h3>
      <div className="space-y-2">
        {newsItems.length > 0 ? (
          newsItems.map((news) => (
            <Card key={news.id || news.title} className="overflow-hidden">
              <CardContent className="p-2 sm:p-3">
                <a
                  href={news.url}
                  className="block hover:opacity-80 transition-opacity"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="font-medium text-xs sm:text-sm flex items-start justify-between">
                    <span className="flex-1">{news.title}</span>
                    <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0 text-muted-foreground" />
                  </div>
                  <div className="flex items-center text-xs mt-1">
                    <span className="font-medium">{news.source.name || news.source}</span>
                    <span className="mx-2">•</span>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{news.publishedAt || news.time}</span>
                    {news.isFallback && (
                      <>
                        <span className="mx-2">•</span>
                        <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
                        <span className="text-amber-500">Données hors ligne</span>
                      </>
                    )}
                  </div>
                </a>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="overflow-hidden">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground">Aucune actualité disponible</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                Actualiser
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
