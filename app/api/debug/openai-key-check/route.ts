import { NextResponse } from "next/server"
import { serverEnv } from "@/lib/env-config"

export async function GET() {
  try {
    const apiKey = serverEnv.OPENAI_API_KEY

    // Ne jamais renvoyer la clé complète, juste un statut
    const keyStatus = {
      available: !!apiKey,
      length: apiKey ? apiKey.length : 0,
      firstChar: apiKey ? apiKey.charAt(0) : null,
      lastChar: apiKey ? apiKey.charAt(apiKey.length - 1) : null,
      // Vérifier si la clé commence par "sk-" (format standard des clés OpenAI)
      validFormat: apiKey ? apiKey.startsWith("sk-") : false,
    }

    return NextResponse.json({
      status: "success",
      message: apiKey ? "OpenAI API key is configured" : "OpenAI API key is missing",
      keyStatus,
      env: process.env.NODE_ENV,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Error checking OpenAI API key",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
