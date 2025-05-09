// Service pour récupérer et analyser les données macroéconomiques
import { getFromCache, saveToCache } from "./cache-utils"

// Types pour les indicateurs macroéconomiques
export interface MacroeconomicIndicator {
  name: string
  value: number
  previousValue?: number
  change?: number
  percentChange?: number
  date: string
  impact: "positive" | "negative" | "neutral"
  importance: number // 0-1, indication de l'importance pour les prédictions
}

export interface MacroeconomicData {
  indicators: MacroeconomicIndicator[]
  lastUpdated: string
  marketOutlook: "bullish" | "bearish" | "neutral"
  outlookStrength: number // 0-1, force de la conviction
  sectorImpact: Record<string, number> // Impact par secteur (-1 à 1)
}

// Mapping des secteurs pour les actions
const sectorMapping: Record<string, string> = {
  AAPL: "Technology",
  MSFT: "Technology",
  GOOGL: "Technology",
  AMZN: "Consumer Cyclical",
  META: "Technology",
  TSLA: "Consumer Cyclical",
  NVDA: "Technology",
  JPM: "Financial Services",
  // Ajouter d'autres symboles au besoin
}

// Durée du cache pour les données macroéconomiques (12 heures)
const MACRO_CACHE_DURATION = 12 * 60 * 60 * 1000

/**
 * Récupère les données macroéconomiques pour un pays donné
 */
export async function getMacroeconomicData(country = "US", forceRefresh = false): Promise<MacroeconomicData> {
  const cacheKey = `macro_data_${country}`

  // Vérifier le cache d'abord si on ne force pas le rafraîchissement
  if (!forceRefresh) {
    const cachedData = getFromCache<MacroeconomicData>(cacheKey)
    if (cachedData) {
      return cachedData
    }
  }

  try {
    // Note: En production, nous utiliserions une API réelle comme:
    // - Alpha Vantage Economic Indicators
    // - Federal Reserve Economic Data (FRED)
    // - World Bank API
    // Pour cet exemple, nous allons simuler des données

    // Simulation des indicateurs macroéconomiques
    const data = generateMockMacroData(country)

    // Sauvegarder dans le cache
    saveToCache<MacroeconomicData>(cacheKey, data, MACRO_CACHE_DURATION)

    return data
  } catch (error) {
    console.error(`Erreur lors de la récupération des données macroéconomiques:`, error)
    // Retourner des données simulées en cas d'erreur
    return generateMockMacroData(country)
  }
}

/**
 * Évalue l'impact des données macroéconomiques sur un titre spécifique
 */
export function evaluateMarcoImpact(
  symbol: string,
  macroData: MacroeconomicData,
): {
  impact: "positive" | "negative" | "neutral"
  strength: number
  details: string
} {
  // Déterminer le secteur du titre
  const sector = sectorMapping[symbol] || "Unknown"

  // Vérifier si nous avons un impact spécifique pour ce secteur
  const sectorImpact = macroData.sectorImpact[sector] || 0

  // Calculer l'impact total basé sur l'outlook général et l'impact sectoriel
  let totalImpact = 0
  if (macroData.marketOutlook === "bullish") {
    totalImpact = 0.5 + sectorImpact / 2
  } else if (macroData.marketOutlook === "bearish") {
    totalImpact = -0.5 + sectorImpact / 2
  } else {
    totalImpact = sectorImpact
  }

  // Déterminer le type d'impact et la force
  let impact: "positive" | "negative" | "neutral" = "neutral"
  if (totalImpact > 0.2) {
    impact = "positive"
  } else if (totalImpact < -0.2) {
    impact = "negative"
  }

  const strength = Math.abs(totalImpact)

  // Générer une explication des détails
  let details = "Basé sur les indicateurs macroéconomiques: "
  // Sélectionner les 2 indicateurs les plus importants
  const keyIndicators = [...macroData.indicators].sort((a, b) => b.importance - a.importance).slice(0, 2)

  keyIndicators.forEach((indicator, index) => {
    details += `${indicator.name} (${indicator.impact === "positive" ? "+" : indicator.impact === "negative" ? "-" : "="})${index < keyIndicators.length - 1 ? ", " : "."}`
  })

  if (sectorImpact !== 0) {
    details += ` L'impact sur le secteur ${sector} est ${sectorImpact > 0 ? "positif" : "négatif"}.`
  }

  return {
    impact,
    strength,
    details,
  }
}

/**
 * Génère des données macroéconomiques simulées
 */
function generateMockMacroData(country: string): MacroeconomicData {
  const now = new Date()
  const today = now.toISOString().split("T")[0]

  // Pour simuler des données différentes à chaque exécution mais cohérentes pour une journée
  const dateCode = Number.parseInt(today.replace(/-/g, ""))
  const randomSeed = dateCode % 100

  // Déterminer l'orientation du marché
  let marketOutlook: "bullish" | "bearish" | "neutral"
  let outlookStrength: number

  // Utiliser le code de date pour influencer l'orientation du marché de façon cohérente
  if (randomSeed < 30) {
    marketOutlook = "bearish"
    outlookStrength = 0.3 + randomSeed / 100
  } else if (randomSeed > 70) {
    marketOutlook = "bullish"
    outlookStrength = 0.3 + (randomSeed - 70) / 100
  } else {
    marketOutlook = "neutral"
    outlookStrength = 0.2 + Math.abs(randomSeed - 50) / 100
  }

  // Générer des impacts sectoriels
  const sectors = [
    "Technology",
    "Financial Services",
    "Consumer Cyclical",
    "Healthcare",
    "Energy",
    "Industrials",
    "Basic Materials",
  ]
  const sectorImpact: Record<string, number> = {}

  sectors.forEach((sector) => {
    // Influencer l'impact sectoriel en fonction de l'orientation générale du marché et du secteur
    const baseBias = marketOutlook === "bullish" ? 0.2 : marketOutlook === "bearish" ? -0.2 : 0
    const sectorCode = sector.charCodeAt(0) % 10
    const sectorBias = sectorCode / 10 - 0.5
    sectorImpact[sector] = Math.max(-0.9, Math.min(0.9, baseBias + sectorBias + (Math.random() * 0.4 - 0.2)))
  })

  // Générer les indicateurs macroéconomiques
  const indicators: MacroeconomicIndicator[] = [
    {
      name: "PIB (Croissance trimestrielle)",
      value: 2.1 + (randomSeed % 10) / 10,
      previousValue: 2.0 + (randomSeed % 8) / 10,
      date: today,
      impact: randomSeed > 50 ? "positive" : "negative",
      importance: 0.9,
    },
    {
      name: "Taux d'inflation",
      value: 3.2 + (randomSeed % 20) / 10,
      previousValue: 3.5 + (randomSeed % 15) / 10,
      date: today,
      impact: randomSeed < 50 ? "positive" : "negative",
      importance: 0.85,
    },
    {
      name: "Taux de chômage",
      value: 3.6 + (randomSeed % 10) / 10,
      previousValue: 3.7 + (randomSeed % 12) / 10,
      date: today,
      impact: randomSeed < 40 ? "positive" : "negative",
      importance: 0.75,
    },
    {
      name: "Taux directeur",
      value: 5.25 + (randomSeed % 10) / 20,
      previousValue: 5.25,
      date: today,
      impact: randomSeed > 60 ? "negative" : "neutral",
      importance: 0.9,
    },
    {
      name: "Balance commerciale (Milliards $)",
      value: -50 - (randomSeed % 30),
      previousValue: -55 - (randomSeed % 25),
      date: today,
      impact: "neutral",
      importance: 0.5,
    },
    {
      name: "Indice de production industrielle",
      value: 102 + (randomSeed % 10),
      previousValue: 101 + (randomSeed % 8),
      date: today,
      impact: randomSeed > 30 ? "positive" : "neutral",
      importance: 0.6,
    },
  ]

  // Calculer les changements pour chaque indicateur
  indicators.forEach((indicator) => {
    if (indicator.previousValue !== undefined) {
      indicator.change = indicator.value - indicator.previousValue
      indicator.percentChange = (indicator.change / indicator.previousValue) * 100
    }
  })

  return {
    indicators,
    lastUpdated: now.toISOString(),
    marketOutlook,
    outlookStrength,
    sectorImpact,
  }
}
