// Service pour générer des prédictions en temps réel basées sur les données actuelles du marché
import { getStockQuote } from "./stock-service"

// Interface pour les prédictions en temps réel
export interface RealTimePrediction {
  symbol: string
  currentPrice: number
  predictedPrice: {
    oneDay: number
    oneWeek: number
    oneMonth: number
  }
  confidence: {
    oneDay: number
    oneWeek: number
    oneMonth: number
  }
  sentimentAnalysis: {
    score: number // -1 à 1
    label: "Très négatif" | "Négatif" | "Neutre" | "Positif" | "Très positif"
  }
  volumeProjection: {
    trend: "En hausse" | "Stable" | "En baisse"
    percentage: number
  }
  riskAssessment: {
    score: number // 1 à 10
    level: "Faible" | "Modéré" | "Élevé" | "Très élevé"
    factors: string[]
  }
  technicalSignals: {
    macd: "Achat fort" | "Achat" | "Neutre" | "Vente" | "Vente forte"
    rsi: "Suracheté" | "Achat" | "Neutre" | "Vente" | "Survendu"
    movingAverages: "Achat fort" | "Achat" | "Neutre" | "Vente" | "Vente forte"
    overallSignal: "Achat fort" | "Achat" | "Neutre" | "Vente" | "Vente forte"
  }
  newsImpact: {
    recent: boolean
    sentiment: "Positif" | "Neutre" | "Négatif"
    magnitude: "Faible" | "Modéré" | "Fort"
    summary: string
  }
  recommendedAction: {
    action: "Achat fort" | "Achat" | "Conserver" | "Vente" | "Vente forte"
    reason: string
    stopLoss: number
    targetPrice: number
  }
  generatedAt: string
  isSimulated: boolean // Indique si les données sont simulées ou réelles
  fundamentals?: Fundamentals
}

// Ajoutez ou mettez à jour l'interface pour inclure les données fondamentales manquantes

// Assurez-vous que l'interface Fundamentals contient ces propriétés supplémentaires:
export interface Fundamentals {
  pe: number
  eps: number
  dividendYield: number
  marketCap: string
  beta: number
  avgVolume: string
  floatShares?: string
  roe?: number
  roa?: number
  profitMargin?: number
  debtToEquity?: number
  revenueGrowth?: number
  epsGrowth?: number
  epsEstimateNextQuarter?: number
}

// Fonction pour générer une prédiction en temps réel
export async function generateRealTimePrediction(
  symbol: string,
  allowSimulated = false,
  apiQuota: any,
): Promise<RealTimePrediction> {
  try {
    // Vérifier le quota d'API si les données simulées ne sont pas autorisées
    const useSimulatedData = allowSimulated || !apiQuota.canMakeRequest()

    // Récupérer les données actuelles de l'action
    let stockData = null
    let isSimulated = useSimulatedData

    if (!useSimulatedData) {
      try {
        stockData = await getStockQuote(symbol)
        // Si on a réussi à obtenir des données réelles, enregistrer la requête
        apiQuota.recordRequest()
      } catch (error) {
        console.warn(
          `Erreur lors de la récupération des données pour ${symbol}, utilisation de données simulées:`,
          error,
        )
        isSimulated = true
      }
    }

    // Si on n'a pas de données ou si on utilise des données simulées
    if (!stockData) {
      // Générer un prix simulé basé sur le symbole pour avoir une cohérence
      const symbolSum = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
      const basePrice = 50 + (symbolSum % 200) // Prix entre 50 et 250

      stockData = {
        symbol,
        currentPrice: basePrice,
        previousClose: basePrice * (1 + (Math.random() * 0.04 - 0.02)), // ±2% du prix de base
        volatility: 0.02 + Math.random() * 0.08,
        isSimulated: true,
      }
    }

    // Utiliser le prix réel du marché
    const currentPrice = stockData.currentPrice || 100 // Prix par défaut si non disponible
    isSimulated = stockData.isSimulated || isSimulated

    // Générer des facteurs aléatoires pour la simulation, mais basés sur les données réelles
    const volatilityFactor = Math.max(0.02, Math.min(0.1, stockData.volatility || 0.02 + Math.random() * 0.08))

    // Déterminer la tendance basée sur les données réelles si disponibles
    let trendBias = Math.random() > 0.5 ? 1 : -1
    if (stockData.previousClose && stockData.currentPrice) {
      trendBias = stockData.currentPrice > stockData.previousClose ? 0.7 : -0.7
    }

    const marketSentiment = (Math.random() * 2 - 1) * 0.5 // Entre -0.5 et 0.5

    // Générer des prédictions de prix
    const oneDayChange = currentPrice * (trendBias * (Math.random() * volatilityFactor) + marketSentiment * 0.01)
    const oneWeekChange = currentPrice * (trendBias * (Math.random() * volatilityFactor * 2) + marketSentiment * 0.02)
    const oneMonthChange = currentPrice * (trendBias * (Math.random() * volatilityFactor * 4) + marketSentiment * 0.05)

    // Générer des niveaux de confiance (plus élevés à court terme, plus faibles à long terme)
    const oneDayConfidence = Math.min(0.95, 0.6 + Math.random() * 0.35)
    const oneWeekConfidence = Math.min(0.9, 0.5 + Math.random() * 0.3)
    const oneMonthConfidence = Math.min(0.85, 0.3 + Math.random() * 0.3)

    // Générer une analyse de sentiment
    const sentimentScore = Math.min(1, Math.max(-1, trendBias * (0.3 + Math.random() * 0.7) + marketSentiment))
    let sentimentLabel: "Très négatif" | "Négatif" | "Neutre" | "Positif" | "Très positif" = "Neutre"

    if (sentimentScore < -0.6) sentimentLabel = "Très négatif"
    else if (sentimentScore < -0.2) sentimentLabel = "Négatif"
    else if (sentimentScore < 0.2) sentimentLabel = "Neutre"
    else if (sentimentScore < 0.6) sentimentLabel = "Positif"
    else sentimentLabel = "Très positif"

    // Générer des projections de volume
    const volumeTrend: "En hausse" | "Stable" | "En baisse" =
      Math.random() > 0.6 ? "En hausse" : Math.random() > 0.5 ? "En baisse" : "Stable"
    const volumePercentage =
      Math.random() * 15 * (volumeTrend === "En hausse" ? 1 : volumeTrend === "En baisse" ? -1 : 0.2)

    // Générer une évaluation des risques
    const riskScore = Math.min(10, Math.max(1, Math.floor(volatilityFactor * 100 * 0.7 + Math.random() * 3)))
    let riskLevel: "Faible" | "Modéré" | "Élevé" | "Très élevé" = "Modéré"

    if (riskScore < 3) riskLevel = "Faible"
    else if (riskScore < 6) riskLevel = "Modéré"
    else if (riskScore < 8) riskLevel = "Élevé"
    else riskLevel = "Très élevé"

    const possibleRiskFactors = [
      "Volatilité du marché",
      "Incertitude économique",
      "Concurrence accrue dans le secteur",
      "Risques réglementaires",
      "Valorisation élevée",
      "Pression sur les marges",
      "Tensions géopolitiques",
      "Incertitude des résultats trimestriels",
      "Rotation sectorielle",
      "Perspectives de croissance incertaines",
    ]

    const numFactors = Math.floor(Math.random() * 3) + 1
    const riskFactors = []
    for (let i = 0; i < numFactors; i++) {
      const randomIndex = Math.floor(Math.random() * possibleRiskFactors.length)
      riskFactors.push(possibleRiskFactors[randomIndex])
      possibleRiskFactors.splice(randomIndex, 1)
    }

    // Générer des signaux techniques
    const signals = ["Achat fort", "Achat", "Neutre", "Vente", "Vente forte"]

    // MACD biaisé par la tendance
    const macdIndex = Math.min(4, Math.max(0, Math.floor(2 + trendBias * -1.5 + Math.random() * 2)))
    const macdSignal = signals[macdIndex] as any

    // RSI basé sur le sentiment et la volatilité
    let rsiSignal: any
    if (sentimentScore > 0.7) rsiSignal = "Suracheté"
    else if (sentimentScore > 0.3) rsiSignal = "Achat"
    else if (sentimentScore > -0.3) rsiSignal = "Neutre"
    else if (sentimentScore > -0.7) rsiSignal = "Vente"
    else rsiSignal = "Survendu"

    // Moyennes mobiles basées sur la tendance
    const maIndex = Math.min(4, Math.max(0, Math.floor(2 + trendBias * -1.8 + marketSentiment * 2)))
    const maSignal = signals[maIndex] as any

    // Signal global avec une légère pondération vers les moyennes mobiles
    const overallSignalIndex = Math.min(
      4,
      Math.max(
        0,
        Math.floor(
          (macdIndex + maIndex * 2 + (rsiSignal === "Suracheté" ? 0 : rsiSignal === "Survendu" ? 4 : maIndex)) / 4,
        ),
      ),
    )
    const overallSignal = signals[overallSignalIndex] as any

    // Générer l'impact des nouvelles
    const hasRecentNews = Math.random() > 0.7
    const newsSentiment: "Positif" | "Neutre" | "Négatif" =
      sentimentScore > 0.3 ? "Positif" : sentimentScore < -0.3 ? "Négatif" : "Neutre"
    const newsMagnitude: "Faible" | "Modéré" | "Fort" =
      Math.random() > 0.7 ? "Fort" : Math.random() > 0.5 ? "Modéré" : "Faible"

    const possibleNewsSummaries = [
      `Des analystes ont ${newsSentiment === "Positif" ? "relevé" : "abaissé"} leurs objectifs de prix pour ${symbol}`,
      `${symbol} a annoncé ${newsSentiment === "Positif" ? "de bons" : newsSentiment === "Négatif" ? "des résultats décevants" : "des résultats conformes aux attentes"}`,
      `Le secteur de ${symbol} connaît une ${newsSentiment === "Positif" ? "forte croissance" : newsSentiment === "Négatif" ? "période difficile" : "évolution stable"}`,
      `${symbol} explore de nouvelles opportunités de ${newsSentiment === "Positif" ? "croissance" : newsSentiment === "Négatif" ? "restructuration" : "développement"}`,
      `Les régulateurs examinent ${newsSentiment === "Négatif" ? "avec attention" : ""} les pratiques de ${symbol}`,
      `${symbol} a ${newsSentiment === "Positif" ? "dépassé" : newsSentiment === "Négatif" ? "manqué" : "atteint"} les estimations du consensus pour le trimestre`,
    ]

    const newsSummary = possibleNewsSummaries[Math.floor(Math.random() * possibleNewsSummaries.length)]

    // Générer une action recommandée
    let recommendedAction: any
    let actionReason: string

    if (overallSignal === "Achat fort") {
      recommendedAction = "Achat fort"
      actionReason = `Forte dynamique haussière avec signaux techniques positifs${hasRecentNews && newsSentiment === "Positif" ? " et actualités favorables" : ""}`
    } else if (overallSignal === "Achat") {
      recommendedAction = "Achat"
      actionReason = `Tendance haussière avec potentiel de croissance${hasRecentNews && newsSentiment === "Positif" ? " soutenu par des nouvelles positives" : ""}`
    } else if (overallSignal === "Vente forte") {
      recommendedAction = "Vente forte"
      actionReason = `Signaux techniques fortement baissiers${hasRecentNews && newsSentiment === "Négatif" ? " et actualités défavorables" : ""}`
    } else if (overallSignal === "Vente") {
      recommendedAction = "Vente"
      actionReason = `Tendance baissière avec risque de poursuite du mouvement${hasRecentNews && newsSentiment === "Négatif" ? " et sentiment négatif" : ""}`
    } else {
      recommendedAction = "Conserver"
      actionReason = `Signaux mixtes sans tendance claire${hasRecentNews ? ", attendre de nouveaux catalyseurs" : ""}`
    }

    // Générer un stop loss et un objectif de prix
    const stopLossPercentage = recommendedAction.includes("Achat")
      ? (0.05 + Math.random() * 0.05) * -1
      : recommendedAction.includes("Vente")
        ? 0.05 + Math.random() * 0.05
        : (0.07 + Math.random() * 0.03) * -1

    const targetPricePercentage = recommendedAction.includes("Achat")
      ? 0.07 + Math.random() * 0.08
      : recommendedAction.includes("Vente")
        ? (0.07 + Math.random() * 0.08) * -1
        : (0.05 + Math.random() * 0.05) * (Math.random() > 0.5 ? 1 : -1)

    const stopLoss = Number.parseFloat((currentPrice * (1 + stopLossPercentage)).toFixed(2))
    const targetPrice = Number.parseFloat((currentPrice * (1 + targetPricePercentage)).toFixed(2))

    // Générer des données fondamentales complètes
    const fundamentals: Fundamentals = {
      pe: 25 + Math.random() * 10,
      eps: 3 + Math.random() * 2,
      dividendYield: 0.005 + Math.random() * 0.02,
      marketCap: `${Math.floor(800 + Math.random() * 400)} Mrd`,
      beta: 0.8 + Math.random() * 0.8,
      avgVolume: `${Math.floor(20 + Math.random() * 30)} M`,
      floatShares: `${Math.floor(1.2 + Math.random() * 0.5)} Mrd`,
      roe: 0.15 + Math.random() * 0.2,
      roa: 0.08 + Math.random() * 0.1,
      profitMargin: 0.18 + Math.random() * 0.15,
      debtToEquity: 0.5 + Math.random() * 1,
      revenueGrowth: 0.05 + Math.random() * 0.2,
      epsGrowth: 0.06 + Math.random() * 0.25,
      epsEstimateNextQuarter: 0.8 + Math.random() * 0.5,
    }

    // Créer la prédiction en temps réel
    return {
      symbol,
      currentPrice,
      predictedPrice: {
        oneDay: Number.parseFloat((currentPrice + oneDayChange).toFixed(2)),
        oneWeek: Number.parseFloat((currentPrice + oneWeekChange).toFixed(2)),
        oneMonth: Number.parseFloat((currentPrice + oneMonthChange).toFixed(2)),
      },
      confidence: {
        oneDay: Number.parseFloat(oneDayConfidence.toFixed(2)),
        oneWeek: Number.parseFloat(oneWeekConfidence.toFixed(2)),
        oneMonth: Number.parseFloat(oneMonthConfidence.toFixed(2)),
      },
      sentimentAnalysis: {
        score: Number.parseFloat(sentimentScore.toFixed(2)),
        label: sentimentLabel,
      },
      volumeProjection: {
        trend: volumeTrend,
        percentage: Number.parseFloat(volumePercentage.toFixed(2)),
      },
      riskAssessment: {
        score: riskScore,
        level: riskLevel,
        factors: riskFactors,
      },
      technicalSignals: {
        macd: macdSignal,
        rsi: rsiSignal,
        movingAverages: maSignal,
        overallSignal: overallSignal,
      },
      newsImpact: {
        recent: hasRecentNews,
        sentiment: newsSentiment,
        magnitude: newsMagnitude,
        summary: newsSummary,
      },
      recommendedAction: {
        action: recommendedAction,
        reason: actionReason,
        stopLoss: stopLoss,
        targetPrice: targetPrice,
      },
      generatedAt: new Date().toISOString(),
      isSimulated,
      fundamentals,
    }
  } catch (error) {
    console.error(`Erreur lors de la génération de prédiction en temps réel pour ${symbol}:`, error)
    throw error
  }
}
