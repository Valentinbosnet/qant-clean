import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function GET() {
  try {
    // Vérifier si la clé API est disponible
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key is missing", status: "error" }, { status: 400 })
    }

    // Test simple avec un prompt court
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: "Réponds simplement par 'OK' pour confirmer que l'API fonctionne.",
      temperature: 0.2,
      maxTokens: 10,
      apiKey: apiKey,
    })

    return NextResponse.json({
      status: "success",
      message: "API OpenAI fonctionne correctement",
      response: text,
    })
  } catch (error) {
    console.error("Erreur lors du test OpenAI:", error)

    // Extraire les détails de l'erreur pour un meilleur débogage
    let errorMessage = "Erreur inconnue"
    let errorDetails = {}

    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = { name: error.name, stack: error.stack }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        status: "error",
      },
      { status: 500 },
    )
  }
}
