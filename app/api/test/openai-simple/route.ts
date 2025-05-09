import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { serverEnv } from "@/lib/env-config"

export async function GET() {
  try {
    // Utiliser directement la clé API de l'environnement serveur
    const apiKey = serverEnv.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key is missing",
        },
        { status: 400 },
      )
    }

    // Tester l'API OpenAI avec une requête simple
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: "Génère une prédiction simple pour le prix de l'action AAPL pour demain en une phrase.",
      temperature: 0.5,
      maxTokens: 100,
      apiKey, // Utiliser la clé API du serveur
    })

    return NextResponse.json({
      success: true,
      message: "OpenAI API test successful",
      response: text,
    })
  } catch (error) {
    console.error("Error testing OpenAI API:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
