import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getProgressiveAnalysis } from "@/lib/progressive-prediction-service"
import { apiQuota } from "@/lib/api-quota-manager"

export async function GET(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const allowSimulated = searchParams.get("allowSimulated") === "true"

    if (!symbol) {
      return NextResponse.json({ error: "Symbole requis" }, { status: 400 })
    }

    // Vérifier le quota d'API avant de faire la requête
    if (!allowSimulated && !apiQuota.canMakeRequest()) {
      return NextResponse.json(
        {
          error: "Limite d'API atteinte. Veuillez réessayer plus tard ou autoriser les données simulées.",
          quotaInfo: apiQuota.getQuotaInfo(),
        },
        { status: 429 },
      )
    }

    // Récupérer l'analyse progressive
    const analysis = await getProgressiveAnalysis(symbol, allowSimulated)

    // Enregistrer la requête dans le quota seulement si des données réelles ont été utilisées
    if (!analysis.isSimulated) {
      apiQuota.recordRequest()
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Erreur lors de la récupération de l'analyse progressive:", error)
    return NextResponse.json(
      { error: "Erreur serveur", details: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 },
    )
  }
}
