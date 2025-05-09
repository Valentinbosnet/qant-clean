import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getStockData } from "@/lib/stock-service"

// Fonction d'extraction JSON (dupliquée pour cette route)
function extractJsonFromMarkdown(text: string): string {
  // Rechercher un bloc JSON dans la réponse Markdown
  const jsonRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
  const match = text.match(jsonRegex)

  if (match && match[1]) {
    console.log("JSON extrait du bloc Markdown")
    return match[1]
  }

  // Vérifier si le texte commence directement par {
  if (text.trim().startsWith("{") && text.trim().endsWith("}")) {
    console.log("Le texte est déjà au format JSON")
    return text
  }

  // Si aucun bloc JSON n'est trouvé, essayer d'extraire tout ce qui ressemble à du JSON
  const anyJsonRegex = /(\{[\s\S]*?\})/
  const anyMatch = text.match(anyJsonRegex)

  if (anyMatch && anyMatch[1]) {
    console.log("JSON extrait du texte (méthode alternative)")
    return anyMatch[1]
  }

  console.log("Aucun JSON trouvé dans la réponse, retour du texte original")
  return text
}

export async function POST(request: Request) {
  try {
    const { symbol, days = 30 } = await request.json()

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    // Vérifier la clé API OpenAI
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is missing. Please check your environment variables." },
        { status: 500 },
      )
    }

    // Récupérer les données de l'action
    const stockData = await getStockData(symbol)

    if (!stockData.history || stockData.history.length < 30) {
      return NextResponse.json(
        { error: "Données historiques insuffisantes pour générer une prédiction" },
        { status: 400 },
      )
    }

    // Préparer les données historiques pour l'IA
    const historicalPrices = stockData.history
      .slice(0, Math.min(60, stockData.history.length))
      .map((point) => ({
        date: point.date,
        price: point.price,
      }))
      .reverse() // Ordre chronologique pour l'IA

    // Construire le prompt pour l'IA
    const prompt = `
Tu es un analyste financier expert. Analyse les données historiques suivantes pour l'action ${symbol} (${stockData.name}) et génère une prédiction de prix pour les ${days} prochains jours.

Prix actuel: ${stockData.price}

Données historiques (des plus anciennes aux plus récentes):
${JSON.stringify(historicalPrices, null, 2)}

Génère une prédiction détaillée qui inclut:
1. La tendance générale (up, down, ou neutral)
2. Un objectif de prix à court terme (7 jours)
3. Un objectif de prix à long terme (${days} jours)
4. Un niveau de confiance (entre 0 et 1)
5. Une explication de ton raisonnement
6. Des prédictions quotidiennes pour les ${days} prochains jours

IMPORTANT: Réponds UNIQUEMENT avec un objet JSON brut. N'utilise pas de balises de formatage, pas de \`\`\`json, pas de préfixes, juste l'objet JSON brut suivant:

&#x7B;
  "trend": "up|down|neutral",
  "shortTermTarget": number,
  "longTermTarget": number,
  "confidence": number,
  "reasoning": "string",
  "dailyPredictions": [
    &#x7B; "date": "YYYY-MM-DD", "price": number &#x7D;
  ]
&#x7D;
`

    console.log("Calling OpenAI API with model gpt-3.5-turbo...")

    try {
      // Appeler l'API OpenAI avec gpt-3.5-turbo au lieu de gpt-4o
      const { text } = await generateText({
        model: openai("gpt-3.5-turbo"),
        prompt,
        temperature: 0.2,
        maxTokens: 2000,
        apiKey,
      })

      console.log("Response received, length:", text.length)
      console.log("Response starts with:", text.substring(0, 50))

      // Extraire le JSON de la réponse Markdown si nécessaire
      const jsonText = extractJsonFromMarkdown(text)
      console.log("Extracted JSON starts with:", jsonText.substring(0, 50))

      // Analyser la réponse JSON
      const aiResponse = JSON.parse(jsonText)

      // Générer les points de prédiction
      const predictionPoints = []

      // Ajouter d'abord les points historiques
      for (const point of stockData.history) {
        predictionPoints.push({
          date: point.date,
          price: point.price,
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
        algorithm: "ai-3.5",
        points: predictionPoints,
        metrics: {
          confidence: aiResponse.confidence,
          accuracy: aiResponse.confidence * 0.9,
        },
        trend: aiResponse.trend,
        shortTermTarget: aiResponse.shortTermTarget,
        longTermTarget: aiResponse.longTermTarget,
        aiReasoning: aiResponse.reasoning,
      }

      return NextResponse.json(result)
    } catch (error) {
      console.error("Error in AI prediction:", error)

      // Fournir des informations détaillées sur l'erreur
      return NextResponse.json(
        {
          error: "Échec de la génération de prédictions IA",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in AI prediction route:", error)
    return NextResponse.json(
      {
        error: "Échec de la génération de prédictions IA",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
