import { isOfflineModeEnabled } from "@/lib/offline-mode"

// Types pour les actualités
export interface NewsArticle {
  id: string
  title: string
  description: string
  url: string
  source: {
    id: string | null
    name: string
  }
  publishedAt: string
  content?: string
  urlToImage?: string
}

export interface NewsResponse {
  articles: NewsArticle[]
  status: string
  totalResults: number
}

// Fonction pour récupérer les actualités
export async function getNews(category = "business", limit = 10): Promise<NewsResponse> {
  // Vérifier si le mode hors ligne est activé
  if (isOfflineModeEnabled()) {
    return getMockNews(category, limit)
  }

  try {
    // Utiliser l'API Alpha Vantage pour les actualités
    const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY

    if (!apiKey) {
      throw new Error("Clé API Alpha Vantage non configurée")
    }

    const topics = category === "technology" ? "technology" : category === "general" ? "general" : "business"

    const response = await fetch(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=${topics}&apikey=${apiKey}`,
    )

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des actualités: ${response.statusText}`)
    }

    const data = await response.json()

    // Formater les données pour correspondre à notre interface
    const articles =
      data.feed?.slice(0, limit).map((item: any, index: number) => ({
        id: item.title ? `${index}-${item.title.substring(0, 20)}` : `article-${index}`,
        title: item.title,
        description: item.summary,
        url: item.url,
        source: {
          id: item.source,
          name: item.source,
        },
        publishedAt: formatDate(item.time_published),
        urlToImage: item.banner_image || null,
      })) || []

    return {
      articles,
      status: "ok",
      totalResults: articles.length,
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des actualités:", error)
    return getMockNews(category, limit)
  }
}

// Fonction pour formater la date
function formatDate(dateString: string): string {
  if (!dateString) return "Récemment"

  try {
    // Format Alpha Vantage: 20230615T123000
    const year = dateString.substring(0, 4)
    const month = dateString.substring(4, 6)
    const day = dateString.substring(6, 8)
    const hour = dateString.substring(9, 11)
    const minute = dateString.substring(11, 13)

    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`)

    // Calculer le temps écoulé
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)

    if (diffMin < 60) return `Il y a ${diffMin} minute${diffMin > 1 ? "s" : ""}`

    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `Il y a ${diffHour} heure${diffHour > 1 ? "s" : ""}`

    const diffDay = Math.floor(diffHour / 24)
    if (diffDay < 30) return `Il y a ${diffDay} jour${diffDay > 1 ? "s" : ""}`

    return date.toLocaleDateString()
  } catch (e) {
    return "Date inconnue"
  }
}

// Fonction pour obtenir des actualités fictives
function getMockNews(category: string, limit: number): NewsResponse {
  const mockArticles: NewsArticle[] = [
    {
      id: "1",
      title: "La Fed maintient ses taux d'intérêt inchangés",
      description:
        "La Réserve fédérale américaine a décidé de maintenir ses taux d'intérêt inchangés lors de sa dernière réunion.",
      url: "#",
      source: {
        id: "financial-times",
        name: "Financial Times",
      },
      publishedAt: "Il y a 2 heures",
    },
    {
      id: "2",
      title: "Apple dévoile son nouveau produit révolutionnaire",
      description:
        "Apple a présenté aujourd'hui son dernier produit qui pourrait révolutionner le marché de la technologie.",
      url: "#",
      source: {
        id: "techcrunch",
        name: "TechCrunch",
      },
      publishedAt: "Il y a 5 heures",
    },
    {
      id: "3",
      title: "Les marchés européens en hausse suite aux données économiques positives",
      description:
        "Les marchés boursiers européens ont connu une hausse significative après la publication de données économiques encourageantes.",
      url: "#",
      source: {
        id: "bloomberg",
        name: "Bloomberg",
      },
      publishedAt: "Il y a 8 heures",
    },
    {
      id: "4",
      title: "Tesla dépasse les attentes de livraison au T2",
      description:
        "Tesla a annoncé avoir dépassé les attentes des analystes concernant ses livraisons pour le deuxième trimestre.",
      url: "#",
      source: {
        id: "cnbc",
        name: "CNBC",
      },
      publishedAt: "Il y a 1 jour",
    },
    {
      id: "5",
      title: "Nouvelle réglementation pour les cryptomonnaies en Europe",
      description:
        "L'Union européenne a adopté une nouvelle réglementation concernant les cryptomonnaies qui entrera en vigueur l'année prochaine.",
      url: "#",
      source: {
        id: "reuters",
        name: "Reuters",
      },
      publishedAt: "Il y a 2 jours",
    },
    {
      id: "6",
      title: "Amazon annonce l'acquisition d'une startup d'IA",
      description:
        "Amazon a annoncé l'acquisition d'une startup spécialisée dans l'intelligence artificielle pour renforcer ses capacités technologiques.",
      url: "#",
      source: {
        id: "wall-street-journal",
        name: "Wall Street Journal",
      },
      publishedAt: "Il y a 3 jours",
    },
  ]

  // Filtrer par catégorie si nécessaire
  let filteredArticles = [...mockArticles]

  if (category === "technology") {
    filteredArticles = mockArticles.filter(
      (article) =>
        article.title.includes("Apple") ||
        article.title.includes("technologie") ||
        article.title.includes("IA") ||
        article.title.includes("Amazon"),
    )
  } else if (category === "business") {
    filteredArticles = mockArticles.filter(
      (article) =>
        article.title.includes("marchés") || article.title.includes("Fed") || article.title.includes("économiques"),
    )
  }

  // Si le filtrage a supprimé tous les articles, revenir aux articles originaux
  if (filteredArticles.length === 0) {
    filteredArticles = mockArticles
  }

  return {
    articles: filteredArticles.slice(0, limit),
    status: "ok",
    totalResults: filteredArticles.length,
  }
}
