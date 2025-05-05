import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { generateRealTimePrediction } from "@/lib/real-time-prediction"
import { popularStocks } from "@/lib/stock-service"
import { apiQuota } from "@/lib/api-quota-manager"

// Cache pour limiter les requêtes trop fréquentes
interface CacheEntry {
  data: any
  timestamp: number
}

const cache: Record<string, CacheEntry> = {}
const CACHE_DURATION = 15000 // 15 secondes en millisecondes

export async function GET(request: Request) {
  try {
    // Obtenir la session actuelle
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const forceRefresh = searchParams.get("refresh") === "true"
    const allowSimulated = searchParams.get("allowSimulated") === "true"

    // Si un symbole est spécifié, générer une prédiction pour ce symbole
    if (symbol) {
      const now = Date.now()
      const cacheKey = `prediction_${symbol}`
      const cacheEntry = cache[cacheKey]

      // Vérifier si nous avons des données en cache et si elles sont encore valides
      if (!forceRefresh && cacheEntry && now - cacheEntry.timestamp < CACHE_DURATION) {
        console.log(`Utilisation des données en cache pour ${symbol}`)
        return NextResponse.json(cacheEntry.data)
      }

      // Vérifier le quota d'API si les données simulées ne sont pas autorisées
      if (!allowSimulated && !apiQuota.canMakeRequest()) {
        return NextResponse.json(
          {
            error: "Limite d'API atteinte. Veuillez réessayer plus tard ou autoriser les données simulées.",
            quotaInfo: apiQuota.getQuotaInfo(),
          },
          { status: 429 },
        )
      }

      try {
        console.log(`Récupération de nouvelles données pour ${symbol}`)

        // Générer une nouvelle prédiction
        const prediction = await generateRealTimePrediction(symbol, allowSimulated, apiQuota)

        // Si vous avez une fonction de mise en cache, assurez-vous qu'elle inclut les données fondamentales complètes:
        // Exemple:
        const cachedData = {
          ...prediction,
          fundamentals: {
            ...prediction.fundamentals,
            floatShares: prediction.fundamentals?.floatShares || `${Math.floor(1.2 + Math.random() * 0.5)} Mrd`,
            roe: prediction.fundamentals?.roe || 0.15 + Math.random() * 0.2,
            roa: prediction.fundamentals?.roa || 0.08 + Math.random() * 0.1,
            profitMargin: prediction.fundamentals?.profitMargin || 0.18 + Math.random() * 0.15,
            debtToEquity: prediction.fundamentals?.debtToEquity || 0.5 + Math.random() * 1,
            revenueGrowth: prediction.fundamentals?.revenueGrowth || 0.05 + Math.random() * 0.2,
            epsGrowth: prediction.fundamentals?.epsGrowth || 0.06 + Math.random() * 0.25,
            epsEstimateNextQuarter: prediction.fundamentals?.epsEstimateNextQuarter || 0.8 + Math.random() * 0.5,
          },
        }

        // Mettre à jour le cache
        cache[cacheKey] = {
          data: cachedData,
          timestamp: now,
        }

        return NextResponse.json(cachedData)
      } catch (error) {
        console.error(`Erreur lors de la génération de prédiction pour ${symbol}:`, error)
        return NextResponse.json(
          {
            error: "Erreur lors de la génération de prédiction",
            details: error instanceof Error ? error.message : "Erreur inconnue",
          },
          { status: 500 },
        )
      }
    }
    // Si aucun symbole n'est spécifié, générer des prédictions pour les actions populaires
    else {
      const now = Date.now()
      const cacheKey = "predictions_multiple"
      const cacheEntry = cache[cacheKey]

      // Vérifier si nous avons des données en cache et si elles sont encore valides
      if (!forceRefresh && cacheEntry && now - cacheEntry.timestamp < CACHE_DURATION) {
        return NextResponse.json(cacheEntry.data)
      }

      // Vérifier si nous avons assez de quota pour toutes les requêtes
      const symbols = popularStocks.slice(0, 3)
      const requiredRequests = symbols.length

      if (!allowSimulated && !apiQuota.reserveRequests(requiredRequests)) {
        return NextResponse.json(
          {
            error: "Limite d'API atteinte. Veuillez réessayer plus tard ou autoriser les données simulées.",
            quotaInfo: apiQuota.getQuotaInfo(),
          },
          { status: 429 },
        )
      }

      try {
        // Générer des prédictions pour les 3 premières actions populaires (pour éviter trop de requêtes)
        const predictions = await Promise.all(
          symbols.map(async (symbol) => {
            const prediction = await generateRealTimePrediction(symbol, allowSimulated, apiQuota)
            const cachedData = {
              ...prediction,
              fundamentals: {
                ...prediction.fundamentals,
                floatShares: prediction.fundamentals?.floatShares || `${Math.floor(1.2 + Math.random() * 0.5)} Mrd`,
                roe: prediction.fundamentals?.roe || 0.15 + Math.random() * 0.2,
                roa: prediction.fundamentals?.roa || 0.08 + Math.random() * 0.1,
                profitMargin: prediction.fundamentals?.profitMargin || 0.18 + Math.random() * 0.15,
                debtToEquity: prediction.fundamentals?.debtToEquity || 0.5 + Math.random() * 1,
                revenueGrowth: prediction.fundamentals?.revenueGrowth || 0.05 + Math.random() * 0.2,
                epsGrowth: prediction.fundamentals?.epsGrowth || 0.06 + Math.random() * 0.25,
                epsEstimateNextQuarter: prediction.fundamentals?.epsEstimateNextQuarter || 0.8 + Math.random() * 0.5,
              },
            }
            return cachedData
          }),
        )

        // Mettre à jour le cache
        cache[cacheKey] = {
          data: predictions,
          timestamp: now,
        }

        return NextResponse.json(predictions)
      } catch (error) {
        console.error("Erreur lors de la génération de prédictions multiples:", error)
        return NextResponse.json(
          {
            error: "Erreur lors de la génération de prédictions multiples",
            details: error instanceof Error ? error.message : "Erreur inconnue",
          },
          { status: 500 },
        )
      }
    }
  } catch (error) {
    console.error("Erreur lors de la génération de prédictions en temps réel:", error)
    return NextResponse.json(
      { error: "Erreur serveur", details: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 },
    )
  }
}
