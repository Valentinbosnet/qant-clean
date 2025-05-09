// Service pour l'analyse de sentiment des nouvelles et réseaux sociaux
import { getFromCache, saveToCache } from "./cache-utils"

// Types pour l'analyse de sentiment
export interface NewsItem {
  title: string
  source: string
  date: string
  sentiment: "positive" | "negative" | "neutral"
  sentimentScore: number // -1 à 1
  url?: string
  relevance: number // 0 à 1
}

export interface SocialMediaSentiment {
  platform: string
  postCount: number
  positiveProportion: number
  negativeProportion: number
  neutralProportion: number
  overallSentiment: number // -1 à 1
  volume24hChange: number // changement de volume en pourcentage
}

export interface SentimentAnalysis {
  symbol: string
  news: NewsItem[]
  socialMedia: SocialMediaSentiment[]
  overallSentiment: number // -1 à 1
  sentimentTrend: "improving" | "declining" | "stable"
  momentum: number // 0 à 1, force de la tendance
  lastUpdated: string
}

// Durée du cache pour les analyses de sentiment (1 heure)
const SENTIMENT_CACHE_DURATION = 60 * 60 * 1000

/**
 * Récupère l'analyse de sentiment pour un symbole donné
 */
export async function getSentimentAnalysis(symbol: string, forceRefresh = false): Promise<SentimentAnalysis> {
  const cacheKey = `sentiment_${symbol}`

  // Vérifier le cache d'abord si on ne force pas le rafraîchissement
  if (!forceRefresh) {
    const cachedData = getFromCache<SentimentAnalysis>(cacheKey)
    if (cachedData) {
      return cachedData
    }
  }

  try {
    // Note: En production, nous utiliserions des APIs réelles comme:
    // - NewsAPI, Alpha Vantage News Sentiment
    // - Twitter/X API, Reddit API, etc.
    // Pour cet exemple, nous allons simuler des données

    // Simulation de l'analyse de sentiment
    const data = generateMockSentimentData(symbol)

    // Sauvegarder dans le cache
    saveToCache<SentimentAnalysis>(cacheKey, data, SENTIMENT_CACHE_DURATION)

    return data
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'analyse de sentiment pour ${symbol}:`, error)
    // Retourner des données simulées en cas d'erreur
    return generateMockSentimentData(symbol)
  }
}

/**
 * Évalue l'impact du sentiment sur les prédictions pour un titre
 */
export function evaluateSentimentImpact(sentiment: SentimentAnalysis): {
  impact: "positive" | "negative" | "neutral"
  strength: number
  details: string
} {
  // Déterminer l'impact global basé sur le sentiment et sa tendance
  let baseImpact = sentiment.overallSentiment

  // Ajuster l'impact en fonction de la tendance
  if (sentiment.sentimentTrend === "improving") {
    baseImpact += 0.2 * sentiment.momentum
  } else if (sentiment.sentimentTrend === "declining") {
    baseImpact -= 0.2 * sentiment.momentum
  }

  // Limiter l'impact entre -1 et 1
  baseImpact = Math.max(-1, Math.min(1, baseImpact))

  // Déterminer le type d'impact et la force
  let impact: "positive" | "negative" | "neutral" = "neutral"
  if (baseImpact > 0.2) {
    impact = "positive"
  } else if (baseImpact < -0.2) {
    impact = "negative"
  }

  const strength = Math.abs(baseImpact)

  // Générer une explication des détails
  let details = ""

  // Ajouter information sur les nouvelles
  const positiveNews = sentiment.news.filter((n) => n.sentiment === "positive").length
  const negativeNews = sentiment.news.filter((n) => n.sentiment === "negative").length

  if (sentiment.news.length > 0) {
    details += `${sentiment.news.length} articles récents analysés: ${positiveNews} positifs, ${negativeNews} négatifs. `
  }

  // Ajouter information sur les médias sociaux
  if (sentiment.socialMedia.length > 0) {
    const volumeChange =
      sentiment.socialMedia.reduce((acc, sm) => acc + sm.volume24hChange, 0) / sentiment.socialMedia.length
    details += `Volume des mentions sociales ${volumeChange > 0 ? "en hausse" : "en baisse"} de ${Math.abs(volumeChange).toFixed(1)}%. `
  }

  // Ajouter tendance générale
  details += `Tendance générale du sentiment: ${
    sentiment.sentimentTrend === "improving"
      ? "en amélioration"
      : sentiment.sentimentTrend === "declining"
        ? "en détérioration"
        : "stable"
  }.`

  return {
    impact,
    strength,
    details,
  }
}

/**
 * Génère des données d'analyse de sentiment simulées pour un symbole
 */
function generateMockSentimentData(symbol: string): SentimentAnalysis {
  const now = new Date()
  const today = now.toISOString()

  // Pour simuler des données différentes mais cohérentes pour chaque symbole
  const symbolCode = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const dateCode = Number.parseInt(today.split("T")[0].replace(/-/g, ""))
  const randomSeed = (symbolCode + dateCode) % 100

  // Générer un sentiment global basé sur le seed
  let overallSentiment: number
  if (randomSeed < 30) {
    overallSentiment = -0.7 + randomSeed / 100
  } else if (randomSeed > 70) {
    overallSentiment = 0.3 + (randomSeed - 70) / 100
  } else {
    overallSentiment = -0.2 + randomSeed / 100
  }

  // Déterminer la tendance du sentiment
  let sentimentTrend: "improving" | "declining" | "stable"
  let momentum: number

  if (randomSeed % 3 === 0) {
    sentimentTrend = "improving"
    momentum = 0.3 + (randomSeed % 70) / 100
  } else if (randomSeed % 3 === 1) {
    sentimentTrend = "declining"
    momentum = 0.3 + (randomSeed % 70) / 100
  } else {
    sentimentTrend = "stable"
    momentum = 0.1 + (randomSeed % 30) / 100
  }

  // Générer des articles de nouvelles simulés
  const newsCount = 3 + (randomSeed % 4)
  const news: NewsItem[] = []

  const newsSources = ["MarketWatch", "CNBC", "Bloomberg", "Reuters", "WSJ", "Financial Times"]
  const positiveHeadlines = [
    `${symbol} dépasse les attentes de résultats du trimestre`,
    `Nouvel accord stratégique pour ${symbol}`,
    `${symbol} annonce un dividende exceptionnel`,
    `Les analystes relèvent leurs objectifs pour ${symbol}`,
    `${symbol} lance un nouveau produit prometteur`,
  ]
  const negativeHeadlines = [
    `${symbol} manque les prévisions de revenus`,
    `Baisse inattendue des marges pour ${symbol}`,
    `${symbol} fait face à des défis réglementaires`,
    `Les analystes abaissent leur recommandation sur ${symbol}`,
    `Concurrence accrue dans le secteur de ${symbol}`,
  ]
  const neutralHeadlines = [
    `${symbol} maintient ses prévisions annuelles`,
    `Réorganisation interne chez ${symbol}`,
    `${symbol} participe à une conférence sectorielle`,
    `Pas de changement majeur pour ${symbol}`,
    `${symbol} conforme aux attentes du marché`,
  ]

  for (let i = 0; i < newsCount; i++) {
    const pastDays = i * 2 // Espacer les articles sur plusieurs jours
    const newsDate = new Date(now)
    newsDate.setDate(newsDate.getDate() - pastDays)

    const sourceIndex = (symbolCode + i) % newsSources.length

    let sentiment: "positive" | "negative" | "neutral"
    let sentimentScore: number
    let title: string

    // Déterminer le sentiment de cet article spécifique
    const articleSeed = (randomSeed + i * 10) % 100

    if (articleSeed < 40) {
      sentiment = "negative"
      sentimentScore = -0.3 - articleSeed / 100
      title = negativeHeadlines[articleSeed % negativeHeadlines.length]
    } else if (articleSeed > 60) {
      sentiment = "positive"
      sentimentScore = 0.3 + (articleSeed - 60) / 100
      title = positiveHeadlines[articleSeed % positiveHeadlines.length]
    } else {
      sentiment = "neutral"
      sentimentScore = -0.1 + (articleSeed - 40) / 100
      title = neutralHeadlines[articleSeed % neutralHeadlines.length]
    }

    news.push({
      title,
      source: newsSources[sourceIndex],
      date: newsDate.toISOString(),
      sentiment,
      sentimentScore,
      relevance: 0.5 + Math.random() * 0.5,
    })
  }

  // Générer des données de sentiment sur les réseaux sociaux
  const platforms = ["Twitter", "Reddit", "StockTwits"]
  const socialMedia: SocialMediaSentiment[] = platforms.map((platform) => {
    const platformSeed = (symbolCode + platform.charCodeAt(0)) % 100
    const baseSentiment = overallSentiment + (-0.2 + platformSeed / 250)

    return {
      platform,
      postCount: 500 + platformSeed * 50,
      positiveProportion: 0.3 + (platformSeed > 50 ? 0.3 : 0),
      negativeProportion: 0.3 + (platformSeed <= 50 ? 0.3 : 0),
      neutralProportion: 0.4 - Math.abs(platformSeed - 50) / 250,
      overallSentiment: Math.max(-1, Math.min(1, baseSentiment)),
      volume24hChange: -20 + (platformSeed % 40),
    }
  })

  return {
    symbol,
    news,
    socialMedia,
    overallSentiment,
    sentimentTrend,
    momentum,
    lastUpdated: today,
  }
}
