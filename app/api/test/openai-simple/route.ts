import { NextResponse } from "next/server"
import { serverEnv } from "@/lib/env-config"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

/**
 * Route API pour tester la connexion à l'API OpenAI
 * Envoie une simple requête pour vérifier que la clé fonctionne
 */
export async function GET() {
  try {
    // Récupérer la clé API OpenAI
    const apiKey = serverEnv.OPENAI_API_KEY

    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message: "OpenAI API key is missing",
          details: "Please configure the OPENAI_API_KEY environment variable",
        },
        { status: 400 },
      )
    }

    console.log("Testing OpenAI API with key", apiKey.substring(0, 3) + "...")

    // Effectuer un test simple avec la clé
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: "Respond with a simple 'Hello World!' and nothing else.",
      maxTokens: 10,
      temperature: 0,
      apiKey: apiKey,
    })

    return NextResponse.json({
      success: true,
      message: "OpenAI API is working correctly",
      response: text,
    })
  } catch (error) {
    console.error("Error testing OpenAI API:", error)

    // Analyse de l'erreur pour donner un message plus utile
    let errorMessage = "Unknown error"
    let errorDetails = ""

    if (error instanceof Error) {
      errorMessage = error.message

      if (errorMessage.includes("401")) {
        errorDetails = "Invalid API key or authentication error"
      } else if (errorMessage.includes("429")) {
        errorDetails = "Rate limit exceeded or insufficient quota"
      } else if (errorMessage.includes("timeout") || errorMessage.includes("socket")) {
        errorDetails = "Network timeout or connectivity issue"
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "OpenAI API test failed",
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 },
    )
  }
}
