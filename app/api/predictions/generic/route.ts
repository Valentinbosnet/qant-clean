import { NextResponse } from "next/server"
import { generateGenericPrediction, type GenericPredictionRequest } from "@/lib/generic-ai-prediction-service"
import { serverEnv } from "@/lib/env-config"

export async function POST(request: Request) {
  try {
    const predictionRequest: GenericPredictionRequest = await request.json()

    // Vérifier que les données nécessaires sont présentes
    if (!predictionRequest.context || !predictionRequest.question) {
      return NextResponse.json({ error: "Le contexte et la question sont requis pour la prédiction" }, { status: 400 })
    }

    // Vérifier que la clé API OpenAI est disponible
    const apiKey = serverEnv.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is missing. Please check your environment variables." },
        { status: 500 },
      )
    }

    // Générer la prédiction
    const prediction = await generateGenericPrediction(predictionRequest, apiKey)

    return NextResponse.json(prediction)
  } catch (error) {
    console.error("Erreur lors de la génération de prédiction générique:", error)
    return NextResponse.json(
      { error: `Échec de la génération de prédiction: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
