import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Vérifier si la clé API OpenAI est définie
    const hasOpenAiKey = !!process.env.OPENAI_API_KEY

    // Obtenir les premiers caractères de la clé pour le débogage (sécurisé)
    let keyPrefix = "non définie"
    if (hasOpenAiKey && process.env.OPENAI_API_KEY) {
      // Ne montrer que les 7 premiers caractères pour des raisons de sécurité
      keyPrefix = process.env.OPENAI_API_KEY.substring(0, 7) + "..."
    }

    // Retourner les informations de débogage
    return NextResponse.json({
      hasOpenAiKey,
      keyPrefix,
      environment: process.env.NODE_ENV || "unknown",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erreur lors de la vérification de la clé API:", error)
    return NextResponse.json(
      { error: "Erreur lors de la vérification de la clé API", details: String(error) },
      { status: 500 },
    )
  }
}
