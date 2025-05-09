import { NextResponse } from "next/server"
import { saveApiKeys } from "@/actions/api-keys"

export async function POST(request: Request) {
  try {
    const { openaiKey, alphaVantageKey } = await request.json()

    // Utiliser l'action serveur pour sauvegarder les clés
    const result = await saveApiKeys(openaiKey, alphaVantageKey)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error || "Erreur lors de la mise à jour des clés API" }, { status: 500 })
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour des clés API:", error)
    return NextResponse.json({ error: "Erreur lors de la mise à jour des clés API" }, { status: 500 })
  }
}
