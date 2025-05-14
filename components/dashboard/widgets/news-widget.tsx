"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import type { WidgetConfig } from "@/lib/dashboard-service"
import { Clock, Newspaper, TrendingUp, Building2, DollarSign } from "lucide-react"

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  url: string
  publishedAt: string
  category: "markets" | "companies" | "economy" | "technology" | "general"
  impact: "positive" | "negative" | "neutral"
  relatedSymbols?: string[]
}

interface NewsWidgetProps {
  config: WidgetConfig
}

export function NewsWidget({ config }: NewsWidgetProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")

  const settings = {
    maxItems: config.settings?.maxItems || 5,
    autoRefresh: config.settings?.autoRefresh !== false,
    refreshInterval: config.settings?.refreshInterval || 300000, // 5 minutes
    showImpact: config.settings?.showImpact !== false,
    defaultCategory: config.settings?.defaultCategory || "all",
    trackedSymbols: config.settings?.trackedSymbols || [],
  }

  useEffect(() => {
    setActiveCategory(settings.defaultCategory)
    fetchNews()

    if (settings.autoRefresh) {
      const interval = setInterval(fetchNews, settings.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [settings.defaultCategory, settings.trackedSymbols])

  const fetchNews = async () => {
    setLoading(true)

    try {
      // Simuler un appel API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Données simulées
      const mockNews: NewsItem[] = [
        {
          id: "1",
          title: "La Fed maintient ses taux d'intérêt inchangés",
          summary:
            "La Réserve fédérale américaine a décidé de maintenir ses taux d'intérêt inchangés lors de sa dernière réunion, citant des préoccupations concernant l'inflation.",
          source: "Financial Times",
          url: "#",
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 heures
          category: "economy",
          impact: "neutral",
          relatedSymbols: ["SPY", "QQQ"],
        },
        {
          id: "2",
          title: "Apple dépasse les attentes avec ses résultats trimestriels",
          summary:
            "Apple a annoncé des résultats trimestriels supérieurs aux attentes, portés par les ventes d'iPhone et les services.",
          source: "CNBC",
          url: "#",
          publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 heures
          category: "companies",
          impact: "positive",
          relatedSymbols: ["AAPL"],
        },
        {
          id: "3",
          title: "Le S&P 500 atteint un nouveau record historique",
          summary:
            "L'indice S&P 500 a atteint un nouveau sommet historique, porté par les valeurs technologiques et les perspectives économiques positives.",
          source: "Bloomberg",
          url: "#",
          publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 jour
          category: "markets",
          impact: "positive",
          relatedSymbols: ["SPY"],
        },
        {
          id: "4",
          title: "Tesla annonce une baisse de production pour le prochain trimestre",
          summary:
            "Tesla a annoncé qu'elle réduirait sa production au prochain trimestre en raison de problèmes de chaîne d'approvisionnement.",
          source: "Reuters",
          url: "#",
          publishedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(), // 1.5 jours
          category: "companies",
          impact: "negative",
          relatedSymbols: ["TSLA"],
        },
        {
          id: "5",
          title: "L'inflation américaine ralentit plus que prévu",
          summary:
            "Le taux d'inflation aux États-Unis a ralenti plus que prévu en avril, renforçant les espoirs d'une baisse des taux d'intérêt.",
          source: "Wall Street Journal",
          url: "#",
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 jours
          category: "economy",
          impact: "positive",
          relatedSymbols: ["SPY", "QQQ", "DIA"],
        },
        {
          id: "6",
          title: "Microsoft investit massivement dans l'IA générative",
          summary:
            "Microsoft a annoncé un investissement de plusieurs milliards de dollars dans le développement de technologies d'IA générative.",
          source: "TechCrunch",
          url: "#",
          publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 jours
          category: "technology",
          impact: "positive",
          relatedSymbols: ["MSFT"],
        },
      ]

      setNews(mockNews)
    } catch (error) {
      console.error("Erreur lors du chargement des actualités:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) {
      return `${diffMins} min`
    } else if (diffMins < 24 * 60) {
      return `${Math.floor(diffMins / 60)} h`
    } else {
      return `${Math.floor(diffMins / (60 * 24))} j`
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "positive":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "negative":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "markets":
        return <TrendingUp className="h-3.5 w-3.5 mr-1" />
      case "companies":
        return <Building2 className="h-3.5 w-3.5 mr-1" />
      case "economy":
        return <DollarSign className="h-3.5 w-3.5 mr-1" />
      default:
        return <Newspaper className="h-3.5 w-3.5 mr-1" />
    }
  }

  const filteredNews = news
    .filter((item) => {
      if (activeCategory === "all") return true
      return item.category === activeCategory
    })
    .slice(0, settings.maxItems)

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid grid-cols-5 mb-2">
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="markets">Marchés</TabsTrigger>
          <TabsTrigger value="companies">Entreprises</TabsTrigger>
          <TabsTrigger value="economy">Économie</TabsTrigger>
          <TabsTrigger value="technology">Tech</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-0 flex-1 overflow-auto">
          {loading ? (
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex flex-col space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNews.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Aucune actualité disponible dans cette catégorie
                </div>
              ) : (
                filteredNews.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex flex-col space-y-1.5">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm">{item.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatRelativeTime(item.publishedAt)}
                          </div>

                          <Badge variant="outline" className="text-xs flex items-center">
                            {getCategoryIcon(item.category)}
                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                          </Badge>

                          {settings.showImpact && (
                            <Badge className={`text-xs ${getImpactColor(item.impact)}`}>
                              {item.impact === "positive"
                                ? "Positif"
                                : item.impact === "negative"
                                  ? "Négatif"
                                  : "Neutre"}
                            </Badge>
                          )}

                          {item.relatedSymbols && item.relatedSymbols.length > 0 && (
                            <div className="flex gap-1">
                              {item.relatedSymbols.map((symbol) => (
                                <Badge key={symbol} variant="secondary" className="text-xs">
                                  ${symbol}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
