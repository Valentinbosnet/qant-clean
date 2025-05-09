import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { serverEnv } from "./env-config"
import { extractJsonFromMarkdown } from "./json-extractor"

// Types pour les prédictions génériques
export interface GenericPredictionRequest {
  // Paramètres de base
  context: string // Contexte de la prédiction
  question: string // Question ou sujet de la prédiction
  timeframe?: string // Période de temps concernée (court terme, moyen terme, long terme)

  // Données supplémentaires
  historicalData?: any[] // Données historiques pertinentes
  currentData?: any // Données actuelles
  additionalContext?: string // Contexte supplémentaire

  // Paramètres de configuration
  responseFormat?: "json" | "text" | "structured" // Format de réponse souhaité
  detailLevel?: "brief" | "standard" | "detailed" // Niveau de détail souhaité
  confidenceRequired?: boolean // Demander un niveau de confiance
  scenariosRequired?: boolean // Demander plusieurs scénarios
  maxTokens?: number // Limite de tokens pour la réponse
}

export interface GenericPredictionResponse {
  // Réponse principale
  prediction: string // Prédiction principale
  confidence?: number // Niveau de confiance (0-1)
  reasoning?: string // Raisonnement derrière la prédiction

  // Scénarios alternatifs
  scenarios?: {
    optimistic?: string
    pessimistic?: string
    neutral?: string
    [key: string]: string | undefined
  }

  // Données structurées (dépend du type de prédiction)
  structuredData?: any

  // Métadonnées
  timestamp: string // Date et heure de la prédiction
  model: string // Modèle utilisé
  timeframe?: string // Période de temps concernée
}

/**
 * Génère une prédiction IA sur n'importe quel sujet
 * @param request Paramètres de la demande de prédiction
 * @param apiKey Clé API OpenAI (optionnelle)
 * @returns Réponse de prédiction
 */
export async function generateGenericPrediction(
  request: GenericPredictionRequest,
  apiKey?: string,
): Promise<GenericPredictionResponse> {
  try {
    // Utiliser la clé API fournie ou celle de l'environnement
    const key = apiKey || serverEnv.OPENAI_API_KEY

    if (!key) {
      throw new Error("OpenAI API key is missing. Please check your environment variables.")
    }

    // Construire le prompt en fonction des paramètres
    const prompt = buildPrompt(request)

    // Appeler l'API OpenAI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.2,
      maxTokens: request.maxTokens || 2000,
      apiKey: key,
    })

    console.log("OpenAI API response received, length:", text.length)

    // Traiter la réponse selon le format demandé
    if (request.responseFormat === "json") {
      const jsonText = extractJsonFromMarkdown(text)
      try {
        const parsedResponse = JSON.parse(jsonText)
        return {
          ...parsedResponse,
          timestamp: new Date().toISOString(),
          model: "gpt-4o",
        }
      } catch (jsonError) {
        console.error("Erreur lors de l'analyse JSON:", jsonError)
        throw new Error(
          `Erreur lors de l'analyse JSON: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`,
        )
      }
    } else {
      // Format texte par défaut
      return {
        prediction: text,
        timestamp: new Date().toISOString(),
        model: "gpt-4o",
        timeframe: request.timeframe,
      }
    }
  } catch (error) {
    console.error("Erreur lors de la génération de prédiction générique:", error)
    throw new Error(`Échec de la génération de prédiction: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Construit le prompt pour l'IA en fonction des paramètres de la demande
 */
function buildPrompt(request: GenericPredictionRequest): string {
  const {
    context,
    question,
    timeframe,
    historicalData,
    currentData,
    additionalContext,
    responseFormat,
    detailLevel,
    confidenceRequired,
    scenariosRequired,
  } = request

  let prompt = `Tu es un expert en analyse prédictive. Je te demande de faire une prédiction sur le sujet suivant.

CONTEXTE:
${context}

QUESTION/SUJET:
${question}
`

  if (timeframe) {
    prompt += `\nPÉRIODE DE TEMPS: ${timeframe}`
  }

  if (historicalData && historicalData.length > 0) {
    prompt += `\n\nDONNÉES HISTORIQUES:
${JSON.stringify(historicalData, null, 2)}`
  }

  if (currentData) {
    prompt += `\n\nDONNÉES ACTUELLES:
${JSON.stringify(currentData, null, 2)}`
  }

  if (additionalContext) {
    prompt += `\n\nCONTEXTE SUPPLÉMENTAIRE:
${additionalContext}`
  }

  // Instructions sur le niveau de détail
  if (detailLevel === "brief") {
    prompt += "\n\nFournis une analyse brève et concise."
  } else if (detailLevel === "detailed") {
    prompt += "\n\nFournis une analyse détaillée et approfondie."
  }

  // Instructions sur les scénarios
  if (scenariosRequired) {
    prompt += "\n\nPrésente plusieurs scénarios possibles (optimiste, pessimiste, et neutre)."
  }

  // Instructions sur le niveau de confiance
  if (confidenceRequired) {
    prompt += "\n\nIndique ton niveau de confiance dans cette prédiction (entre 0 et 1)."
  }

  // Instructions sur le format de réponse
  if (responseFormat === "json") {
    prompt += `\n\nRÉPONDS UNIQUEMENT AVEC UN OBJET JSON au format suivant:
{
  "prediction": "Ta prédiction principale",
  "confidence": number, // Niveau de confiance entre 0 et 1
  "reasoning": "Ton raisonnement détaillé",
  ${
    scenariosRequired
      ? `"scenarios": {
    "optimistic": "Description du scénario optimiste",
    "neutral": "Description du scénario neutre",
    "pessimistic": "Description du scénario pessimiste"
  },`
      : ""
  }
  "structuredData": {} // Données structurées pertinentes pour cette prédiction
}

IMPORTANT: Réponds UNIQUEMENT avec l'objet JSON brut sans utiliser de délimiteurs de bloc de code comme \`\`\`json ou \`\`\`.
N'utilise pas de Markdown. Réponds directement avec l'objet JSON.`
  } else {
    prompt += "\n\nFournis ta prédiction de manière claire et structurée."
  }

  return prompt
}

/**
 * Préconfigurations pour différents types de prédictions
 */
export const predictionTemplates = {
  stockPrice: (
    symbol: string,
    name: string,
    currentPrice: number,
    historicalData: any[],
  ): GenericPredictionRequest => ({
    context: `Analyse du prix de l'action ${symbol} (${name}) qui se négocie actuellement à ${currentPrice}.`,
    question: `Quelle sera l'évolution du prix de l'action ${symbol} dans les prochains jours/semaines?`,
    timeframe: "30 jours",
    historicalData,
    currentData: { symbol, name, currentPrice },
    responseFormat: "json",
    detailLevel: "standard",
    confidenceRequired: true,
    scenariosRequired: true,
  }),

  economicTrend: (sector: string, region: string, indicators: any[]): GenericPredictionRequest => ({
    context: `Analyse des tendances économiques dans le secteur ${sector} pour la région ${region}.`,
    question: `Comment évoluera le secteur ${sector} dans la région ${region} dans les prochains mois?`,
    timeframe: "6 mois",
    historicalData: indicators,
    responseFormat: "json",
    detailLevel: "detailed",
    confidenceRequired: true,
    scenariosRequired: true,
  }),

  marketEvent: (event: string, market: string, currentContext: string): GenericPredictionRequest => ({
    context: `Analyse de l'impact potentiel de l'événement "${event}" sur le marché ${market}. ${currentContext}`,
    question: `Quel sera l'impact de cet événement sur le marché ${market}?`,
    timeframe: "court à moyen terme",
    responseFormat: "json",
    detailLevel: "standard",
    confidenceRequired: true,
    scenariosRequired: true,
  }),

  customScenario: (scenario: string, question: string, context: string): GenericPredictionRequest => ({
    context: `Analyse du scénario hypothétique suivant: ${scenario}\n\n${context}`,
    question,
    responseFormat: "json",
    detailLevel: "detailed",
    confidenceRequired: true,
    scenariosRequired: true,
  }),
}
