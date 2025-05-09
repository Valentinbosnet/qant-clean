import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { serverEnv } from "@/lib/env-config"

export async function GET() {
  try {
    // Vérifier que la clé API est disponible
    if (!serverEnv.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Clé API OpenAI manquante. Veuillez configurer votre clé API dans les paramètres." },
        { status: 400 },
      )
    }

    // Faire un appel simple à l'API OpenAI pour vérifier la connexion
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: "Réponds simplement 'OK' pour vérifier la connexion.",
      temperature: 0.1,
      maxTokens: 5,
      apiKey: serverEnv.OPENAI_API_KEY, // Utiliser la clé API du serveur
    })

    // Si nous arrivons ici, la connexion est réussie
    return NextResponse.json({
      success: true,
      message: "Connexion à l'API OpenAI établie avec succès.",
      model: "gpt-4o",
      response: text,
    })
  } catch (error: any) {
    console.error("Erreur lors du test OpenAI:", error)

    // Déterminer le type d'erreur
    let errorMessage = "Erreur inconnue lors de la connexion à l'API OpenAI."

    if (error.message) {
      if (error.message.includes("API key")) {
        errorMessage = "Clé API OpenAI invalide ou expirée."
      } else if (error.message.includes("timeout")) {
        errorMessage = "Délai d'attente dépassé lors de la connexion à l'API OpenAI."
      } else if (error.message.includes("network")) {
        errorMessage = "Erreur réseau lors de la connexion à l'API OpenAI."
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
