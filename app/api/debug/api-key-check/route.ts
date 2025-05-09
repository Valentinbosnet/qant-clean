import { NextResponse } from "next/server"
import { debugOpenAIKey } from "@/lib/api-key-debugger"
import { serverEnv } from "@/lib/env-config"

export async function GET() {
  try {
    // Vérifier l'état de la clé API
    const debugInfo = debugOpenAIKey()

    // Journaliser les informations pour le débogage serveur
    console.log("API Key Debug - Server ENV:", {
      hasOpenAIKey: !!serverEnv.OPENAI_API_KEY,
      keyLength: serverEnv.OPENAI_API_KEY ? serverEnv.OPENAI_API_KEY.length : 0,
      env: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    })

    // Afficher toutes les variables d'environnement (uniquement en développement)
    if (process.env.NODE_ENV === "development") {
      console.log("All environment variables:", Object.keys(process.env))
    }

    return NextResponse.json({
      debug: debugInfo,
      serverEnvKeys: Object.keys(serverEnv),
      hasOpenAIKeyInServerEnv: "OPENAI_API_KEY" in serverEnv,
      openAIKeyLength: serverEnv.OPENAI_API_KEY ? serverEnv.OPENAI_API_KEY.length : 0,
      message: debugInfo.keyExists
        ? `Clé API OpenAI trouvée (${debugInfo.keyLength} caractères)`
        : "Clé API OpenAI non trouvée",
    })
  } catch (error) {
    console.error("Erreur lors de la vérification de la clé API:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la vérification de la clé API",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
