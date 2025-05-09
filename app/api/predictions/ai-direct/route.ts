import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { extractJsonFromMarkdown } from "@/lib/json-extractor" // Mise à jour de l'import
import { serverEnv } from "@/lib/env-config"

export async function POST(request: NextRequest) {
  try {
    const { symbol, stockName, currentPrice, historicalData, days = 30 } = await request.json()

    // Vérifier que les données nécessaires sont présentes
    if (!symbol || !stockName || !currentPrice || !historicalData || historicalData.length === 0) {
      return NextResponse.json({ error: "Données manquantes pour la prédiction" }, { status: 400 })
    }

    // Vérifier que la clé API OpenAI est disponible
    const apiKey = serverEnv.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is missing. Please check your environment variables." },
        { status: 500 },
      )
    }

    console.log("Generating AI prediction with OpenAI API key available:", !!apiKey)

    // Préparer les données historiques pour l'IA
    const historicalPrices = historicalData
      .slice(0, Math.min(60, historicalData.length))
      .map((point: any) => ({
        date: point.date,
        price: point.price,
      }))
      .reverse() // Ordre chronologique pour l'IA

    // Construire le prompt pour l'IA
    const prompt = `
Tu es un analyste financier expert. Analyse les données historiques suivantes pour l'action ${symbol} (${stockName}) et génère une prédiction de prix pour les ${days} prochains jours.

Prix actuel: ${currentPrice}

Données historiques (des plus anciennes aux plus récentes):
${JSON.stringify(historicalPrices, null, 2)}

Génère une prédiction détaillée qui inclut:
1. La tendance générale (up, down, ou neutral)
2. Un objectif de prix à court terme (7 jours)
3. Un objectif de prix à long terme (${days} jours)
4. Un niveau de confiance (entre 0 et 1)
5. Une explication de ton raisonnement
6. Des prédictions quotidiennes pour les ${days} prochains jours

IMPORTANT: Réponds UNIQUEMENT avec un objet JSON brut sans utiliser de délimiteurs de bloc de code comme \`\`\`json ou \`\`\`.
N'utilise pas de Markdown. Réponds directement avec l'objet JSON au format suivant:

{
  "trend": "up|down|neutral",
  "shortTermTarget": number,
  "longTermTarget": number,
  "confidence": number,
  "reasoning": "string",
  "dailyPredictions": [
    { "date": "YYYY-MM-DD", "price": number }
  ]
}
`

    try {
      // Appeler l'API OpenAI avec la clé API du serveur
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        temperature: 0.2, // Réduire la température pour des résultats plus cohérents
        maxTokens: 2000,
        apiKey, // Utiliser la clé API du serveur
      })

      console.log("OpenAI API response received, length:", text.length)
      console.log("OpenAI API response starts with:", text.substring(0, 50))

      // Extraire le JSON de la réponse Markdown si nécessaire
      const jsonText = extractJsonFromMarkdown(text)
      console.log("Extracted JSON starts with:", jsonText.substring(0, 50))

      try {
        // Analyser la réponse JSON
        const aiResponse = JSON.parse(jsonText)

        // Générer les points de prédiction
        const predictionPoints = []

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
          })
        }

        // Construire le résultat
        const result = {
          symbol,
          algorithm: "ai",
          points: predictionPoints,
          metrics: {
            confidence: aiResponse.confidence,
            accuracy: aiResponse.confidence * 0.9, // Estimation basée sur la confiance
          },
          trend: aiResponse.trend,
          shortTermTarget: aiResponse.shortTermTarget,
          longTermTarget: aiResponse.longTermTarget,
          aiReasoning: aiResponse.reasoning,
        }

        return NextResponse.json(result)
      } catch (jsonError) {
        console.error("Erreur lors de l'analyse JSON:", jsonError)
        console.error("Contenu brut de la réponse:", text)
        return NextResponse.json(
          {
            error: `Erreur lors de l'analyse JSON: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`,
          },
          { status: 500 },
        )
      }
    } catch (openaiError) {
      console.error("Erreur spécifique à l'API OpenAI:", openaiError)
      return NextResponse.json(
        {
          error: `Erreur lors de l'appel à l'API OpenAI: ${openaiError instanceof Error ? openaiError.message : String(openaiError)}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Erreur lors de la génération de prédictions IA:", error)
    return NextResponse.json(
      { error: `Échec de la génération de prédictions IA: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
