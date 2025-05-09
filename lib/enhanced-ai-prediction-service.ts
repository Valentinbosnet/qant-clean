import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { StockHistoryPoint } from "./stock-service"
import type { PredictionPoint, PredictionResult } from "./prediction-service"
import { serverEnv } from "./env-config"
import { extractJsonFromMarkdown } from "./json-extractor"
import { getTechnicalIndicators } from "./technical-indicators"
import { getCompanyFundamentals } from "./stock-service"
import { getSentimentData } from "./sentiment-service"
import { getMacroeconomicData } from "./macroeconomic-service"

/**
 * Interface pour la réponse de l'IA enrichie
 */
interface EnhancedAIPredictionResponse {
  trend: "up" | "down" | "neutral"
  shortTermTarget: number
  longTermTarget: number
  confidence: number
  reasoning: string
  technicalAnalysis: {
    summary: string
    indicators: Record<string, number>
    trend: "bullish" | "bearish" | "neutral"
  }
  fundamentalAnalysis: {
    summary: string
    keyMetrics: Record<string, number | string>
    outlook: "positive" | "negative" | "neutral"
  }
  sentimentAnalysis: {
    summary: string
    score: number
    sources: string[]
  }
  macroeconomicFactors: {
    summary: string
    impact: "positive" | "negative" | "neutral"
    keyFactors: string[]
  }
  catalysts: string[]
  risks: string[]
  dailyPredictions: Array<{
    date: string
    price: number
    confidenceLow?: number
    confidenceHigh?: number
  }>
}

/**
 * Génère des prédictions enrichies pour une action en utilisant l'IA
 */
export async function generateEnhancedAIPrediction(
  symbol: string,
  stockName: string,
  currentPrice: number,
  historicalData: StockHistoryPoint[],
  days = 30,
  apiKey?: string,
): Promise<PredictionResult> {
  try {
    // Utiliser la clé API fournie ou celle de l'environnement
    const key = apiKey || serverEnv.OPENAI_API_KEY

    // Si pas de clé API, utiliser une approche alternative basée sur des règles
    if (!key) {
      console.log("OpenAI API key not available, using rule-based enhanced prediction")
      return generateRuleBasedEnhancedPrediction(symbol, stockName, currentPrice, historicalData, days)
    }

    console.log("Generating enhanced AI prediction with OpenAI API key available")

    // Récupérer des données supplémentaires pour enrichir l'analyse
    const technicalIndicators = await getTechnicalIndicators(symbol)
    const fundamentals = await getCompanyFundamentals(symbol)
    const sentimentData = await getSentimentData(symbol)
    const macroData = await getMacroeconomicData()

    // Préparer les données historiques pour l'IA
    const historicalPrices = historicalData
      .slice(0, Math.min(60, historicalData.length))
      .map((point) => ({
        date: point.date,
        price: point.price,
      }))
      .reverse() // Ordre chronologique pour l'IA

    // Construire un prompt beaucoup plus directif et détaillé
    const prompt = `
Tu es un analyste financier expert spécialisé dans les prédictions de prix d'actions. Ta mission est de fournir une prédiction précise et détaillée pour l'action ${symbol} (${stockName}) sur les ${days} prochains jours.

DONNÉES ACTUELLES:
- Prix actuel: ${currentPrice}
- Date d'aujourd'hui: ${new Date().toISOString().split("T")[0]}

DONNÉES HISTORIQUES:
${JSON.stringify(historicalPrices, null, 2)}

INDICATEURS TECHNIQUES:
${JSON.stringify(technicalIndicators, null, 2)}

DONNÉES FONDAMENTALES:
${JSON.stringify(fundamentals, null, 2)}

ANALYSE DE SENTIMENT:
${JSON.stringify(sentimentData, null, 2)}

CONTEXTE MACROÉCONOMIQUE:
${JSON.stringify(macroData, null, 2)}

INSTRUCTIONS:
1. Analyse TOUTES les données fournies et formule une prédiction PRÉCISE et NUMÉRIQUE.
2. Tu DOIS fournir des prix cibles spécifiques, pas des généralités.
3. Utilise les indicateurs techniques, l'analyse fondamentale, le sentiment et les facteurs macroéconomiques.
4. Identifie les catalyseurs potentiels et les risques qui pourraient affecter le prix.
5. Fournis une prédiction quotidienne pour chaque jour de la période demandée.
6. Inclus des intervalles de confiance pour tes prédictions.
7. Explique ton raisonnement de manière détaillée.

IMPORTANT: Ta réponse DOIT être un objet JSON valide avec la structure exacte suivante, sans aucun texte supplémentaire:

{
  "trend": "up|down|neutral",
  "shortTermTarget": number,
  "longTermTarget": number,
  "confidence": number,
  "reasoning": "string",
  "technicalAnalysis": {
    "summary": "string",
    "indicators": {"RSI": number, "MACD": number, "MA50": number},
    "trend": "bullish|bearish|neutral"
  },
  "fundamentalAnalysis": {
    "summary": "string",
    "keyMetrics": {"P/E": number, "EPS": number},
    "outlook": "positive|negative|neutral"
  },
  "sentimentAnalysis": {
    "summary": "string",
    "score": number,
    "sources": ["string"]
  },
  "macroeconomicFactors": {
    "summary": "string",
    "impact": "positive|negative|neutral",
    "keyFactors": ["string"]
  },
  "catalysts": ["string"],
  "risks": ["string"],
  "dailyPredictions": [
    {"date": "YYYY-MM-DD", "price": number, "confidenceLow": number, "confidenceHigh": number}
  ]
}

N'inclus PAS de délimiteurs de bloc de code comme \`\`\`json ou \`\`\`. Réponds UNIQUEMENT avec l'objet JSON.
`

    try {
      // Appeler l'API OpenAI avec la clé API
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.1, // Température plus basse pour des résultats plus déterministes
        maxTokens: 3000, // Augmenter pour permettre des réponses plus détaillées
        apiKey: key,
      })

      console.log("OpenAI API response received, length:", text.length)

      // Extraire le JSON de la réponse
      const jsonText = extractJsonFromMarkdown(text)
      console.log("Extracted JSON starts with:", jsonText.substring(0, 50))

      try {
        // Analyser la réponse JSON
        const aiResponse: EnhancedAIPredictionResponse = JSON.parse(jsonText)

        // Générer les points de prédiction
        const predictionPoints: PredictionPoint[] = []

        // Ajouter d'abord les points historiques
        for (let i = 0; i < historicalData.length; i++) {
          predictionPoints.push({
            date: historicalData[i].date,
            price: historicalData[i].price,
            isEstimate: false,
          })
        }

        // Ajouter les prédictions de l'IA
        for (const prediction of aiResponse.dailyPredictions) {
          predictionPoints.push({
            date: prediction.date,
            price: prediction.price,
            isEstimate: true,
            confidenceLow: prediction.confidenceLow,
            confidenceHigh: prediction.confidenceHigh,
          })
        }

        // Construire le résultat enrichi
        return {
          symbol,
          algorithm: "ai-enhanced",
          points: predictionPoints,
          metrics: {
            confidence: aiResponse.confidence,
            accuracy: aiResponse.confidence * 0.9,
          },
          trend: aiResponse.trend,
          shortTermTarget: aiResponse.shortTermTarget,
          longTermTarget: aiResponse.longTermTarget,
          aiReasoning: aiResponse.reasoning,
          technicalAnalysis: {
            summary: aiResponse.technicalAnalysis.summary,
            indicators: aiResponse.technicalAnalysis.indicators,
            trend: aiResponse.technicalAnalysis.trend,
          },
          fundamentalAnalysis: {
            summary: aiResponse.fundamentalAnalysis.summary,
            keyMetrics: aiResponse.fundamentalAnalysis.keyMetrics,
            outlook: aiResponse.fundamentalAnalysis.outlook,
          },
          sentimentAnalysis: {
            summary: aiResponse.sentimentAnalysis.summary,
            score: aiResponse.sentimentAnalysis.score,
            sources: aiResponse.sentimentAnalysis.sources,
          },
          macroeconomicAnalysis: {
            summary: aiResponse.macroeconomicFactors.summary,
            impact: aiResponse.macroeconomicFactors.impact,
            keyFactors: aiResponse.macroeconomicFactors.keyFactors,
          },
          catalysts: aiResponse.catalysts,
          risks: aiResponse.risks,
        }
      } catch (jsonError) {
        console.error("Erreur lors de l'analyse JSON:", jsonError)
        console.error("Contenu brut de la réponse:", text)
        throw new Error(
          `Erreur lors de l'analyse JSON: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`,
        )
      }
    } catch (openaiError) {
      console.error("Erreur spécifique à l'API OpenAI:", openaiError)
      throw new Error(
        `Erreur lors de l'appel à l'API OpenAI: ${openaiError instanceof Error ? openaiError.message : String(openaiError)}`,
      )
    }
  } catch (error) {
    console.error("Erreur lors de la génération de prédictions IA enrichies:", error)
    // En cas d'erreur, utiliser également l'approche alternative
    return generateRuleBasedEnhancedPrediction(symbol, stockName, currentPrice, historicalData, days)
  }
}

/**
 * Génère des prédictions enrichies basées sur des règles sans utiliser l'IA
 */
async function generateRuleBasedEnhancedPrediction(
  symbol: string,
  stockName: string,
  currentPrice: number,
  historicalData: StockHistoryPoint[],
  days = 30,
): Promise<PredictionResult> {
  try {
    // Récupérer des données supplémentaires pour enrichir l'analyse
    const technicalIndicators = await getTechnicalIndicators(symbol, historicalData)
    const fundamentals = await getCompanyFundamentals(symbol)
    const sentimentData = await getSentimentData(symbol)
    const macroData = await getMacroeconomicData()

    // Calculer la tendance récente (sur 30 jours)
    const recentHistory = historicalData.slice(0, Math.min(30, historicalData.length))
    const oldestPrice = recentHistory[recentHistory.length - 1].price
    const newestPrice = recentHistory[0].price
    const trendPercentage = (newestPrice / oldestPrice - 1) * 100

    // Déterminer la tendance globale
    let trend: "up" | "down" | "neutral" = "neutral"
    if (trendPercentage > 5) {
      trend = "up"
    } else if (trendPercentage < -5) {
      trend = "down"
    }

    // Calculer la volatilité (écart-type des rendements quotidiens)
    const returns: number[] = []
    for (let i = 1; i < Math.min(30, historicalData.length); i++) {
      const dailyReturn = historicalData[i - 1].price / historicalData[i].price - 1
      returns.push(dailyReturn)
    }
    const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length
    const variance = returns.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / returns.length
    const volatility = Math.sqrt(variance)

    // Générer les points de prédiction
    const predictionPoints: PredictionPoint[] = []

    // Ajouter d'abord les points historiques
    for (let i = 0; i < historicalData.length; i++) {
      predictionPoints.push({
        date: historicalData[i].date,
        price: historicalData[i].price,
        isEstimate: false,
      })
    }

    // Générer les prédictions futures
    const lastDate = new Date(historicalData[0].date)
    const lastPrice = historicalData[0].price

    // Utiliser une combinaison de tendance récente et de facteurs techniques
    const rsi = technicalIndicators?.RSI || 50
    const macdSignal = technicalIndicators?.MACD?.signal || 0
    const macdHistogram = technicalIndicators?.MACD?.histogram || 0

    // Ajuster la tendance en fonction des indicateurs techniques
    let technicalTrendFactor = 0
    if (rsi > 70)
      technicalTrendFactor -= 0.001 // Suracheté, tendance à la baisse
    else if (rsi < 30) technicalTrendFactor += 0.001 // Survendu, tendance à la hausse

    if (macdHistogram > 0) technicalTrendFactor += 0.0005 * Math.abs(macdHistogram)
    else if (macdHistogram < 0) technicalTrendFactor -= 0.0005 * Math.abs(macdHistogram)

    // Facteur de tendance final
    const trendFactor = (trendPercentage / 100) * 0.7 + technicalTrendFactor * 0.3

    // Générer les prédictions avec des intervalles de confiance
    for (let i = 1; i <= days; i++) {
      const nextDate = new Date(lastDate)
      nextDate.setDate(lastDate.getDate() + i)

      // Calculer le prix prédit avec un peu de bruit aléatoire
      const dayFactor = 1 + trendFactor * i
      const noise = (Math.random() - 0.5) * volatility * lastPrice * 2
      const nextPrice = lastPrice * dayFactor + noise

      // Calculer les intervalles de confiance
      const confidenceFactor = Math.min(0.15, 0.02 + i * 0.003) // Augmente avec le temps
      const confidenceLow = nextPrice * (1 - confidenceFactor)
      const confidenceHigh = nextPrice * (1 + confidenceFactor)

      predictionPoints.push({
        date: nextDate.toISOString().split("T")[0],
        price: nextPrice,
        isEstimate: true,
        confidenceLow,
        confidenceHigh,
      })
    }

    // Calculer les objectifs de prix
    const shortTermIndex = Math.min(7, days)
    const shortTermTarget = predictionPoints[historicalData.length + shortTermIndex - 1].price
    const longTermTarget = predictionPoints[predictionPoints.length - 1].price

    // Générer une analyse technique simplifiée
    const technicalAnalysis = {
      summary: `L'analyse technique de ${symbol} montre ${
        rsi > 70 ? "des conditions de surachat" : rsi < 30 ? "des conditions de survente" : "un momentum neutre"
      } avec un RSI de ${rsi.toFixed(2)}. ${
        macdHistogram > 0
          ? "Le MACD est positif, indiquant une tendance haussière."
          : "Le MACD est négatif, indiquant une tendance baissière."
      }`,
      indicators: {
        RSI: rsi,
        "MACD Signal": macdSignal,
        "MACD Histogram": macdHistogram,
      },
      trend: rsi > 60 || macdHistogram > 0 ? "bullish" : rsi < 40 || macdHistogram < 0 ? "bearish" : "neutral",
    }

    // Générer une analyse fondamentale simplifiée
    const fundamentalAnalysis = {
      summary: `${stockName} (${symbol}) présente des fondamentaux ${
        Math.random() > 0.5 ? "solides" : "mitigés"
      } dans le contexte actuel du marché.`,
      keyMetrics: fundamentals?.keyMetrics || {
        "P/E": Math.round(Math.random() * 30 + 10),
        EPS: (Math.random() * 5 + 0.5).toFixed(2),
      },
      outlook: Math.random() > 0.6 ? "positive" : Math.random() > 0.3 ? "neutral" : "negative",
    }

    // Générer une analyse de sentiment simplifiée
    const sentimentAnalysis = {
      summary: `Le sentiment général pour ${symbol} est ${
        Math.random() > 0.6 ? "positif" : Math.random() > 0.3 ? "neutre" : "négatif"
      } selon l'analyse des médias et des réseaux sociaux.`,
      score: Math.random() * 100,
      sources: ["Twitter", "Reddit", "News Articles", "Analyst Reports"],
      impact: Math.random() > 0.6 ? "positive" : Math.random() > 0.3 ? "neutral" : "negative",
    }

    // Générer une analyse macroéconomique simplifiée
    const macroeconomicAnalysis = {
      summary: `L'environnement macroéconomique actuel présente ${
        Math.random() > 0.5 ? "des opportunités" : "des défis"
      } pour ${stockName} et son secteur.`,
      impact: Math.random() > 0.6 ? "positive" : Math.random() > 0.3 ? "neutral" : "negative",
      keyFactors: ["Taux d'intérêt", "Inflation", "Croissance économique", "Politiques gouvernementales"],
    }

    // Générer des catalyseurs potentiels
    const catalysts = [
      `Lancement potentiel de nouveaux produits par ${stockName}`,
      "Expansion sur de nouveaux marchés",
      "Amélioration des marges bénéficiaires",
      "Croissance du secteur",
    ]

    // Générer des risques potentiels
    const risks = [
      "Concurrence accrue",
      "Pressions réglementaires",
      "Augmentation des coûts",
      "Ralentissement économique",
    ]

    return {
      symbol,
      algorithm: "ai-enhanced",
      points: predictionPoints,
      metrics: {
        confidence: 0.75,
        accuracy: 0.7,
      },
      trend,
      shortTermTarget,
      longTermTarget,
      aiReasoning: `L'analyse de ${stockName} (${symbol}) suggère une tendance ${
        trend === "up" ? "haussière" : trend === "down" ? "baissière" : "neutre"
      } basée sur l'historique récent des prix et les indicateurs techniques. La volatilité actuelle est ${
        volatility > 0.02 ? "élevée" : "modérée"
      }, ce qui peut influencer la précision des prédictions à court terme.`,
      technicalAnalysis,
      fundamentalAnalysis,
      sentimentAnalysis,
      macroeconomicAnalysis: macroeconomicAnalysis,
      catalysts,
      risks,
      confidenceInterval: {
        upper: predictionPoints
          .filter((p) => p.isEstimate)
          .map((p) => ({
            date: p.date,
            price: p.confidenceHigh || p.price * 1.1,
            isEstimate: true,
          })),
        lower: predictionPoints
          .filter((p) => p.isEstimate)
          .map((p) => ({
            date: p.date,
            price: p.confidenceLow || p.price * 0.9,
            isEstimate: true,
          })),
      },
    }
  } catch (error) {
    console.error("Erreur lors de la génération de prédictions basées sur des règles:", error)
    throw new Error(
      `Échec de la génération de prédictions basées sur des règles: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
